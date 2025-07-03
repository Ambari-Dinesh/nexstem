import { Node, Edge, MarkerType } from '@xyflow/react';

export interface DAGNode extends Node {
  id: string;
  type: 'pipeline';
  position: { x: number; y: number };
  data: {
    label: string;
  };
}

export interface DAGEdge extends Edge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep';
  animated?: boolean;
  style?: React.CSSProperties;
  markerEnd?: {
    type: MarkerType;
    width?: number;
    height?: number;
    color?: string;
  };
}

export interface DAGValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DAGData {
  nodes: DAGNode[];
  edges: DAGEdge[];
}