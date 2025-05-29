
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type AIModel = 'gemini-2.0-flash' | 'gpt-3.5-turbo' | 'gpt-4o';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  userCredits: number;
}

const modelConfig = {
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient AI model',
    credits: 1,
    provider: 'Google'
  },
  'gpt-3.5-turbo': {
    name: 'ChatGPT 3.5 Turbo',
    description: 'Balanced performance and speed',
    credits: 1,
    provider: 'OpenAI'
  },
  'gpt-4o': {
    name: 'ChatGPT 4o',
    description: 'Most advanced OpenAI model',
    credits: 2,
    provider: 'OpenAI'
  }
};

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  userCredits 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select AI Model</CardTitle>
        <CardDescription>
          Choose which AI model to use for content generation. Different models have different credit costs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedModel} onValueChange={onModelChange}>
          {Object.entries(modelConfig).map(([modelKey, config]) => {
            const canAfford = userCredits >= config.credits;
            const modelId = modelKey as AIModel;
            
            return (
              <div key={modelKey} className="flex items-center space-x-2 p-3 rounded-lg border">
                <RadioGroupItem 
                  value={modelId} 
                  id={modelId}
                  disabled={!canAfford}
                />
                <Label 
                  htmlFor={modelId} 
                  className={`flex-1 cursor-pointer ${!canAfford ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                      <div className="text-xs text-gray-400">by {config.provider}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-seo-primary">
                        {config.credits} credit{config.credits !== 1 ? 's' : ''}
                      </div>
                      {!canAfford && (
                        <div className="text-xs text-red-500">Not enough credits</div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        
        <div className="mt-4 text-sm text-gray-600">
          Your available credits: <span className="font-medium">{userCredits}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelSelector;
export { modelConfig };
