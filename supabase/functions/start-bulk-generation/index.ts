
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting bulk generation for job:', jobId);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('bulk_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Job is not in pending status: ${job.status}`);
    }

    // Update job status to processing
    await supabase
      .from('bulk_generation_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Create individual result records for each product
    const resultInserts = job.product_ids.map((productId: number) => ({
      job_id: jobId,
      product_id: productId,
      status: 'pending'
    }));

    await supabase
      .from('bulk_generation_results')
      .insert(resultInserts);

    // Create batches for the generation queue
    const batchSize = job.batch_size || 5;
    const batches = [];
    
    for (let i = 0; i < job.product_ids.length; i += batchSize) {
      const batchProducts = job.product_ids.slice(i, i + batchSize);
      batches.push({
        job_id: jobId,
        batch_number: Math.floor(i / batchSize) + 1,
        product_ids: batchProducts,
        status: 'queued',
        priority: 0,
        scheduled_at: new Date(Date.now() + (Math.floor(i / batchSize) * 5000)).toISOString() // 5 second delays between batches
      });
    }

    await supabase
      .from('generation_queue')
      .insert(batches);

    console.log(`Created ${batches.length} batches for job ${jobId}`);

    // Start processing the first batch immediately
    if (batches.length > 0) {
      EdgeRuntime.waitUntil(processBatch(supabase, jobId, batches[0]));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bulk generation started',
        batchesCreated: batches.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error starting bulk generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processBatch(supabase: any, jobId: string, batch: any) {
  try {
    console.log(`Processing batch ${batch.batch_number} for job ${jobId}`);

    // Update batch status to processing
    await supabase
      .from('generation_queue')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    // Get job details for prompt and model
    const { data: job } = await supabase
      .from('bulk_generation_jobs')
      .select('*, woocommerce_credentials(*)')
      .eq('id', jobId)
      .single();

    if (!job) {
      throw new Error('Job not found during batch processing');
    }

    // Process each product in the batch
    for (const productId of batch.product_ids) {
      try {
        await processProduct(supabase, jobId, productId, job);
      } catch (error) {
        console.error(`Error processing product ${productId}:`, error);
        
        // Update result as failed
        await supabase
          .from('bulk_generation_results')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('job_id', jobId)
          .eq('product_id', productId);

        // Update job failed count
        await supabase.rpc('increment_job_failed_count', { job_id: jobId });
      }
    }

    // Mark batch as completed
    await supabase
      .from('generation_queue')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    // Check if this was the last batch and update job status
    await checkJobCompletion(supabase, jobId);

    // Process next batch if available
    const { data: nextBatch } = await supabase
      .from('generation_queue')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'queued')
      .order('batch_number')
      .limit(1)
      .single();

    if (nextBatch) {
      // Wait a bit before processing next batch to avoid rate limits
      setTimeout(() => {
        EdgeRuntime.waitUntil(processBatch(supabase, jobId, nextBatch));
      }, 5000);
    }

  } catch (error) {
    console.error(`Error processing batch ${batch.batch_number}:`, error);
    
    // Mark batch as failed
    await supabase
      .from('generation_queue')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', batch.id);
  }
}

async function processProduct(supabase: any, jobId: string, productId: number, job: any) {
  // Update result status to processing
  await supabase
    .from('bulk_generation_results')
    .update({ status: 'processing' })
    .eq('job_id', jobId)
    .eq('product_id', productId);

  // Get product details from WooCommerce
  const credentials = job.woocommerce_credentials;
  if (!credentials) {
    throw new Error('WooCommerce credentials not found');
  }

  // Fetch product details
  const productResponse = await fetch(
    `${credentials.store_url}/wp-json/wc/v3/products/${productId}`,
    {
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
      }
    }
  );

  if (!productResponse.ok) {
    throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
  }

  const product = await productResponse.json();

  // Generate content using the generate-content function
  const generateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        categories: product.categories
      },
      prompt: job.prompt_template,
      model: job.model,
      userId: job.user_id
    })
  });

  if (!generateResponse.ok) {
    const errorData = await generateResponse.json();
    throw new Error(`Content generation failed: ${errorData.error}`);
  }

  const content = await generateResponse.json();

  // Update result with generated content
  await supabase
    .from('bulk_generation_results')
    .update({
      status: 'completed',
      content: content,
      product_name: product.name
    })
    .eq('job_id', jobId)
    .eq('product_id', productId);

  // Update job completed count
  await supabase.rpc('increment_job_completed_count', { job_id: jobId });

  console.log(`Successfully generated content for product ${productId}`);
}

async function checkJobCompletion(supabase: any, jobId: string) {
  // Get current job status
  const { data: job } = await supabase
    .from('bulk_generation_jobs')
    .select('total_products, completed_products, failed_products')
    .eq('id', jobId)
    .single();

  if (job && (job.completed_products + job.failed_products) >= job.total_products) {
    // Job is complete
    await supabase
      .from('bulk_generation_jobs')
      .update({
        status: job.failed_products === job.total_products ? 'failed' : 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Job ${jobId} completed: ${job.completed_products} successful, ${job.failed_products} failed`);
  }
}
