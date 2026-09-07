
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ContentHealthEmptyStateProps {
  onRefresh: () => void;
}

const ContentHealthEmptyState: React.FC<ContentHealthEmptyStateProps> = ({ onRefresh }) => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold">No Health Data Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Run a content health scan to analyze your products and identify missing SEO fields.
          </p>
          <Button onClick={onRefresh}>
            Start Content Health Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentHealthEmptyState;
