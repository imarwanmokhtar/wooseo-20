
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wand2, Play, Pause, X, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import ModelSelector, { AIModel, modelConfig } from './ModelSelector';
import { getDefaultPromptTemplate } from '@/services/aiGenerationService';

interface BulkJob {
  id: string;
  status: string;
  total_products: number;
  completed_products: number;
  failed_products: number;
  model: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

interface BulkContentGeneratorProps {
  selectedProducts: Product[];
  onBack: () => void;
}

const BulkContentGenerator: React.FC<BulkContentGeneratorProps> = ({
  selectedProducts,
  onBack
}) => {
  const { user, credits } = useAuth();
  const { activeStore } = useMultiStore();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [batchSize, setBatchSize] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [currentJob, setCurrentJob] = useState<BulkJob | null>(null);
  const [jobHistory, setJobHistory] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPromptTemplate();
    loadJobHistory();
  }, [user?.id]);

  useEffect(() => {
    if (currentJob?.id) {
      const channel = supabase
        .channel('bulk-job-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bulk_generation_jobs',
            filter: `id=eq.${currentJob.id}`
          },
          (payload) => {
            console.log('Job update received:', payload);
            if (payload.new) {
              setCurrentJob(payload.new as BulkJob);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentJob?.id]);

  const loadPromptTemplate = async () => {
    if (!user?.id) return;
    try {
      const template = await getDefaultPromptTemplate(user.id);
      setPrompt(template);
    } catch (error) {
      console.error('Error loading prompt template:', error);
    }
  };

  const loadJobHistory = async () => {
    if (!user?.id || !activeStore?.id) return;

    try {
      const { data, error } = await supabase
        .from('bulk_generation_jobs')
        .select('*')
        .eq('store_id', activeStore.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobHistory(data || []);

      // Set current job if there's an active one
      const activeJob = data?.find(job => 
        job.status === 'pending' || job.status === 'processing'
      );
      if (activeJob) {
        setCurrentJob(activeJob);
      }
    } catch (error) {
      console.error('Error loading job history:', error);
    }
  };

  const totalCreditsRequired = selectedProducts.length * modelConfig[selectedModel].credits;
  const canAffordGeneration = credits >= totalCreditsRequired;

  const startBulkGeneration = async () => {
    if (!user?.id || !activeStore?.id) {
      toast.error('Authentication or store selection required');
      return;
    }

    if (!canAffordGeneration) {
      toast.error(`Not enough credits. Need ${totalCreditsRequired}, have ${credits}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create bulk generation job
      const { data: job, error: jobError } = await supabase
        .from('bulk_generation_jobs')
        .insert({
          user_id: user.id,
          store_id: activeStore.id,
          product_ids: selectedProducts.map(p => p.id),
          prompt_template: prompt,
          model: selectedModel,
          total_products: selectedProducts.length,
          batch_size: batchSize,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setCurrentJob(job);
      toast.success('Bulk generation job started!');

      // Call edge function to start processing
      const { error: processError } = await supabase.functions.invoke('start-bulk-generation', {
        body: { jobId: job.id }
      });

      if (processError) {
        console.error('Error starting bulk generation:', processError);
        toast.error('Failed to start bulk generation');
      }

    } catch (error) {
      console.error('Error creating bulk job:', error);
      setError(error instanceof Error ? error.message : 'Failed to start bulk generation');
      toast.error('Failed to start bulk generation');
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async () => {
    if (!currentJob?.id) return;

    try {
      const { error } = await supabase
        .from('bulk_generation_jobs')
        .update({ status: 'cancelled' })
        .eq('id', currentJob.id);

      if (error) throw error;

      toast.success('Job cancelled');
      setCurrentJob(null);
      loadJobHistory();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const getProgressPercentage = () => {
    if (!currentJob) return 0;
    return Math.round((currentJob.completed_products / currentJob.total_products) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Content Generation</h2>
          <p className="text-gray-600">
            Generate SEO content for {selectedProducts.length} products
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Job Status */}
      {currentJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Job</span>
              <Badge className={getStatusColor(currentJob.status)}>
                {currentJob.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentJob.completed_products} / {currentJob.total_products}</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Model</div>
                <div className="text-gray-600">{modelConfig[currentJob.model as AIModel]?.name || currentJob.model}</div>
              </div>
              <div>
                <div className="font-medium">Completed</div>
                <div className="text-green-600">{currentJob.completed_products}</div>
              </div>
              <div>
                <div className="font-medium">Failed</div>
                <div className="text-red-600">{currentJob.failed_products}</div>
              </div>
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-gray-600">
                  {currentJob.started_at && formatDuration(currentJob.started_at, currentJob.completed_at)}
                </div>
              </div>
            </div>

            {currentJob.error_message && (
              <Alert variant="destructive">
                <AlertDescription>{currentJob.error_message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {(currentJob.status === 'pending' || currentJob.status === 'processing') && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={cancelJob}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Job
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadJobHistory}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Job Configuration */}
      {!currentJob || (currentJob.status !== 'pending' && currentJob.status !== 'processing') && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Bulk Generation</CardTitle>
            <CardDescription>
              Set up your bulk content generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              userCredits={credits}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Size</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>1 (Slowest, Most Reliable)</option>
                <option value={3}>3 (Slow, Very Reliable)</option>
                <option value={5}>5 (Balanced - Recommended)</option>
                <option value={10}>10 (Faster, Less Reliable)</option>
              </select>
              <p className="text-xs text-gray-500">
                Smaller batches are more reliable but slower. Larger batches are faster but may hit rate limits.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Products</div>
                  <div>{selectedProducts.length}</div>
                </div>
                <div>
                  <div className="font-medium">Total Credits</div>
                  <div className={canAffordGeneration ? 'text-green-600' : 'text-red-600'}>
                    {totalCreditsRequired} / {credits} available
                  </div>
                </div>
                <div>
                  <div className="font-medium">Estimated Batches</div>
                  <div>{Math.ceil(selectedProducts.length / batchSize)}</div>
                </div>
                <div>
                  <div className="font-medium">Est. Duration</div>
                  <div>
                    {Math.ceil(selectedProducts.length / batchSize * 2)} - {Math.ceil(selectedProducts.length / batchSize * 5)} min
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={startBulkGeneration}
              disabled={loading || !canAffordGeneration || selectedProducts.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting Generation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Bulk Generation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Job History */}
      {jobHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobHistory.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {job.total_products} products
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {job.completed_products}/{job.total_products} completed
                    </div>
                    {job.failed_products > 0 && (
                      <div className="text-xs text-red-600">
                        {job.failed_products} failed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkContentGenerator;
