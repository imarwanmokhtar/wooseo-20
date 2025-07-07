
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Info } from 'lucide-react';

export type SeoPlugin = 'rankmath' | 'yoast' | 'aioseo' | 'none';

interface SeoPluginSelectorProps {
  selectedPlugin: SeoPlugin | null;
  onPluginSelect: (plugin: SeoPlugin) => void;
  showCard?: boolean;
}

const SeoPluginSelector: React.FC<SeoPluginSelectorProps> = ({
  selectedPlugin,
  onPluginSelect,
  showCard = true
}) => {
  const getSeoPluginName = (plugin: SeoPlugin) => {
    switch (plugin) {
      case 'rankmath': return 'RankMath SEO';
      case 'yoast': return 'Yoast SEO';
      case 'aioseo': return 'All in One SEO';
      case 'none': return 'No SEO Plugin / Custom Fields';
      default: return 'Select SEO Plugin';
    }
  };

  const getPluginDescription = (plugin: SeoPlugin) => {
    switch (plugin) {
      case 'rankmath': return 'Full support for meta titles, descriptions, and focus keywords.';
      case 'yoast': return 'Full support for meta titles, descriptions, and focus keywords.';
      case 'aioseo': return 'Basic support - requires AIOSEO Pro for custom post types (WooCommerce products).';
      case 'none': return 'Uses universal meta fields that work with most themes.';
      default: return '';
    }
  };

  const selector = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">SEO Plugin</label>
        <Select value={selectedPlugin || undefined} onValueChange={(value) => onPluginSelect(value as SeoPlugin)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your SEO plugin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rankmath">
              <div className="flex items-center justify-between w-full">
                <span>RankMath SEO</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                  Recommended
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="yoast">Yoast SEO</SelectItem>
            <SelectItem value="aioseo">All in One SEO</SelectItem>
            <SelectItem value="none">No SEO Plugin / Custom Fields</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedPlugin && (
        <div className="text-sm text-gray-600">
          <strong>{getSeoPluginName(selectedPlugin)}:</strong> {getPluginDescription(selectedPlugin)}
        </div>
      )}

      {selectedPlugin === 'aioseo' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>⚠️ All in One SEO Note:</strong> Custom post types (like WooCommerce products) require AIOSEO Pro to override meta titles and descriptions. With the free version, AIOSEO will use default values (product title + separator + site title). Consider upgrading to AIOSEO Pro or using RankMath/Yoast for full functionality.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  if (!showCard) {
    return selector;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-seo-primary" />
          SEO Plugin Configuration
        </CardTitle>
        <CardDescription>
          Select the SEO plugin you're using on your WooCommerce store
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selector}
      </CardContent>
    </Card>
  );
};

export default SeoPluginSelector;
