import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileJson, ChevronDown, ChevronUp } from 'lucide-react';
import { DAGData } from '../types/graphTypes';

interface JSONPreviewProps {
  data: DAGData;
}

export default function JSONPreview({ data }: JSONPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card border-border shadow-custom-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileJson className="w-5 h-5 text-primary" />
          JSON Preview
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="pt-0">
          <div className="relative">
            <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-96 font-mono">
              <code className="text-muted-foreground">
                {jsonString}
              </code>
            </pre>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{data.nodes.length} nodes</span>
              <span>{data.edges.length} edges</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}