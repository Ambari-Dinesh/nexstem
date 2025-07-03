import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, GitBranch, Zap, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { DAGValidationResult } from '../types/graphTypes';
import { getValidationStatusColor } from '../utils/validateDAG';

interface ToolbarProps {
  onAddNode: () => void;
  onAutoLayout: () => void;
  validation: DAGValidationResult;
  nodeCount: number;
  edgeCount: number;
}

export default function Toolbar({
  onAddNode,
  onAutoLayout,
  validation,
  nodeCount,
  edgeCount
}: ToolbarProps) {
  const getStatusIcon = () => {
    if (!validation.isValid) return <AlertCircle className="w-4 h-4" />;
    if (validation.warnings.length > 0) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusVariant = () => {
    const color = getValidationStatusColor(validation);
    return color === 'destructive' ? 'destructive' : 
           color === 'warning' ? 'secondary' : 'default';
  };

  return (
    <div className="bg-gradient-toolbar border-b border-toolbar-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Main actions */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-toolbar-foreground mr-6">
            Pipeline Editor
          </h1>
          
          <Button
            onClick={onAddNode}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
          
          <Button
            onClick={onAutoLayout}
            variant="outline"
            size="sm"
            disabled={nodeCount < 2}
            className="border-toolbar-border text-toolbar-foreground hover:bg-toolbar-foreground/10"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Auto Layout
          </Button>
        </div>

        {/* Right side - Status and stats */}
        <div className="flex items-center gap-4">
          {/* Graph stats */}
          <div className="flex items-center gap-3 text-sm text-toolbar-foreground/80">
            <span>{nodeCount} nodes</span>
            <span>•</span>
            <span>{edgeCount} edges</span>
          </div>

          {/* Validation status */}
          <Badge 
            variant={getStatusVariant()}
            className="flex items-center gap-2"
          >
            {getStatusIcon()}
            {!validation.isValid ? 'Invalid' : 
             validation.warnings.length > 0 ? 'Warnings' : 'Valid'}
          </Badge>
        </div>
      </div>

      {/* Error/Warning messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="px-6 pb-4">
          {validation.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-center gap-2 text-sm text-red-400 mb-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-center gap-2 text-sm text-yellow-400 mb-1">
              <AlertTriangle className="w-3 h-3" />
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}