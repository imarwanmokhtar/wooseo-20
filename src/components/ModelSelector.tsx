
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// --- TYPE: Remove old/invalid aliases (no 'gpt-4.1-2025-04-14' etc) ---
export type AIModel =
  | 'gemini-2.0-flash'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo'
  | 'gpt-4o'
  | 'gpt-4.1';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  userCredits: number;
}

/**
 * Centralized config for models and their credit costs.
 * Ensure these match everywhere in the app!
 */
const modelConfig: Record<AIModel, {
  name: string;
  description: string;
  credits: number;
  provider: string;
  disabled: boolean;
  comingSoon: boolean;
}> = {
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient AI model',
    credits: 1,
    provider: 'Google',
    disabled: true,
    comingSoon: true
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'Fast and cost-effective OpenAI model',
    credits: 1,
    provider: 'OpenAI',
    disabled: false,
    comingSoon: false
  },
  'gpt-3.5-turbo': {
    name: 'ChatGPT 3.5 Turbo',
    description: 'Balanced performance and speed',
    credits: 1,
    provider: 'OpenAI',
    disabled: false,
    comingSoon: false
  },
  'gpt-4o': {
    name: 'ChatGPT 4o',
    description: 'Most advanced OpenAI model',
    credits: 2,
    provider: 'OpenAI',
    disabled: false,
    comingSoon: false
  },
  'gpt-4.1': {
    name: 'ChatGPT 4.1',
    description: 'Latest and most advanced OpenAI model',
    credits: 3,
    provider: 'OpenAI',
    disabled: false,
    comingSoon: false
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
            const isDisabled = config.disabled || !canAfford;

            return (
              <div key={modelKey} className={`flex items-center space-x-2 p-3 rounded-lg border ${isDisabled ? 'opacity-50' : ''}`}>
                <RadioGroupItem
                  value={modelId}
                  id={modelId}
                  disabled={isDisabled}
                />
                <Label
                  htmlFor={modelId}
                  className={`flex-1 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {config.name}
                        {config.comingSoon && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                      <div className="text-xs text-gray-400">by {config.provider}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-seo-primary">
                        {config.credits} credit{config.credits !== 1 ? 's' : ''}
                      </div>
                      {!canAfford && !config.disabled && (
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
