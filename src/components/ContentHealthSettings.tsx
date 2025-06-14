
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Settings, Bell, Clock, Wand2 } from 'lucide-react';
import { ContentHealthSettings as SettingsType } from '@/types/contentHealth';
import { toast } from 'sonner';

const ContentHealthSettings = () => {
  const [settings, setSettings] = useState<SettingsType>({
    min_meta_description_length: 120,
    min_short_description_words: 20,
    check_gallery_images: true,
    auto_detect_interval: 24,
    auto_generate_missing: false,
    email_notifications: false,
    email_threshold: 10,
  });

  const [saving, setSaving] = useState(false);

  const handleSettingChange = (key: keyof SettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would save to your backend/local storage
      localStorage.setItem('contentHealthSettings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      min_meta_description_length: 120,
      min_short_description_words: 20,
      check_gallery_images: true,
      auto_detect_interval: 24,
      auto_generate_missing: false,
      email_notifications: false,
      email_threshold: 10,
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Content Health Detection Settings
          </CardTitle>
          <CardDescription>
            Customize how WooSEO detects missing or incomplete content fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Detection Thresholds */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detection Thresholds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta-desc-length">Minimum Meta Description Length</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="meta-desc-length"
                    type="number"
                    value={settings.min_meta_description_length}
                    onChange={(e) => handleSettingChange('min_meta_description_length', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">characters</span>
                </div>
                <p className="text-xs text-gray-600">
                  Meta descriptions shorter than this will be flagged
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-desc-words">Minimum Short Description Words</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="short-desc-words"
                    type="number"
                    value={settings.min_short_description_words}
                    onChange={(e) => handleSettingChange('min_short_description_words', parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">words</span>
                </div>
                <p className="text-xs text-gray-600">
                  Short descriptions with fewer words will be flagged
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Check Gallery Images for Alt Text</Label>
                <p className="text-sm text-gray-600">
                  Include product gallery images in alt text analysis
                </p>
              </div>
              <Switch
                checked={settings.check_gallery_images}
                onCheckedChange={(checked) => handleSettingChange('check_gallery_images', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Automation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automation Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-detect Missing Fields</Label>
                  <p className="text-sm text-gray-600">
                    Automatically scan for missing content every {settings.auto_detect_interval} hours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.auto_detect_interval}
                    onChange={(e) => handleSettingChange('auto_detect_interval', parseInt(e.target.value))}
                    className="w-20"
                    min="1"
                    max="168"
                  />
                  <span className="text-sm text-gray-500">hours</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-generate Missing Content</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      Automatically generate missing content when detected
                    </p>
                    <Badge variant="secondary" className="text-xs">Beta</Badge>
                  </div>
                </div>
                <Switch
                  checked={settings.auto_generate_missing}
                  onCheckedChange={(checked) => handleSettingChange('auto_generate_missing', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Send email alerts when content issues are detected
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>

              {settings.email_notifications && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="email-threshold">Notification Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email-threshold"
                      type="number"
                      value={settings.email_threshold}
                      onChange={(e) => handleSettingChange('email_threshold', parseInt(e.target.value))}
                      className="w-24"
                      min="1"
                    />
                    <span className="text-sm text-gray-500">products with issues</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Send notification when this many products have missing content
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button 
              onClick={resetToDefaults} 
              variant="outline"
              className="flex-1"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Preview</CardTitle>
          <CardDescription>
            Based on your current settings, here's what will be flagged as missing or incomplete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">Meta Description</span>
              <Badge variant="destructive">Missing if &lt; {settings.min_meta_description_length} chars</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">Short Description</span>
              <Badge variant="secondary">Poor if &lt; {settings.min_short_description_words} words</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Image Alt Text</span>
              <Badge variant="outline">
                {settings.check_gallery_images ? 'All images checked' : 'Featured image only'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentHealthSettings;
