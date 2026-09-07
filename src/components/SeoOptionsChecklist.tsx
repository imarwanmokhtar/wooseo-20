
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export interface SeoOptions {
  includeInternalLinks: boolean;
  includeOutboundLinks: boolean;
  includePowerWords: boolean;
  includeSentimentWords: boolean;
  includePermalink: boolean;
  includeAltText: boolean;
  includeFocusKeywords: boolean;
  includeMetaDescription: boolean;
}

interface SeoOptionsChecklistProps {
  options: SeoOptions;
  onOptionsChange: (options: SeoOptions) => void;
}

const SeoOptionsChecklist: React.FC<SeoOptionsChecklistProps> = ({
  options,
  onOptionsChange,
}) => {
  const handleOptionChange = (key: keyof SeoOptions, checked: boolean) => {
    onOptionsChange({
      ...options,
      [key]: checked,
    });
  };

  const checklistItems = [
    {
      key: 'includeInternalLinks' as keyof SeoOptions,
      label: 'Internal Links',
      description: 'Add 3-5 internal product and category links',
    },
    {
      key: 'includeOutboundLinks' as keyof SeoOptions,
      label: 'Outbound Links',
      description: 'Add 3-5 external links to relevant websites (required for RankMath)',
    },
    {
      key: 'includePowerWords' as keyof SeoOptions,
      label: 'Power Words in Title',
      description: 'Include power words like Amazing, Ultimate, Best in meta title',
    },
    {
      key: 'includeSentimentWords' as keyof SeoOptions,
      label: 'Sentiment Words in Title',
      description: 'Include sentiment words like Love, Excellent, Great in meta title',
    },
    {
      key: 'includePermalink' as keyof SeoOptions,
      label: 'SEO Permalink',
      description: 'Generate optimized URL permalink (max 40 characters)',
    },
    {
      key: 'includeAltText' as keyof SeoOptions,
      label: 'Image Alt Text',
      description: 'Generate descriptive alt text for product images',
    },
    {
      key: 'includeFocusKeywords' as keyof SeoOptions,
      label: 'Focus Keywords',
      description: 'Extract exactly 3 focus keywords from product name',
    },
    {
      key: 'includeMetaDescription' as keyof SeoOptions,
      label: 'Meta Description',
      description: 'Generate 140-155 character meta description with call to action',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-seo-primary" />
          SEO Content Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklistItems.map((item) => (
            <div key={item.key} className="flex items-start space-x-3">
              <Checkbox
                id={item.key}
                checked={options[item.key]}
                onCheckedChange={(checked) => 
                  handleOptionChange(item.key, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label 
                  htmlFor={item.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {item.label}
                </label>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoOptionsChecklist;
