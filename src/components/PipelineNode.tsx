import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { DAGNode } from '../types/graphTypes';

const PipelineNode = memo(({ data, selected }: NodeProps<DAGNode>) => {
  return (
    <div className="relative group">
      {/* Input handle (left side) - incoming connections only */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ left: -6 }}
      />
      
      {/* Node content */}
      <div className={`
        px-4 py-3 rounded-lg min-w-[160px] text-center
        bg-card border-2 transition-all duration-200
        ${selected 
          ? 'border-primary shadow-glow' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
        }
      `}>
        <div className="font-medium text-sm text-card-foreground">
          {data.label}
        </div>
        
        {/* Visual indicators for connection direction */}
        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span className="opacity-60">←</span>
          <span className="opacity-60">→</span>
        </div>
      </div>
      
      {/* Output handle (right side) - outgoing connections only */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ right: -6 }}
      />
    </div>
  );
});

PipelineNode.displayName = 'PipelineNode';

export default PipelineNode;