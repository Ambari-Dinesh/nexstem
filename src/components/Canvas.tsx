import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  OnNodesChange,
  OnEdgesChange,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PipelineNode from './PipelineNode';
import { DAGNode, DAGEdge } from '../types/graphTypes';

// Helper function to check if a set of edges would create a cycle
function checkForCycle(nodes: DAGNode[], edges: { source: string; target: string }[]): boolean {
  const adjacencyList = new Map<string, string[]>();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // Build adjacency list
  nodes.forEach(node => adjacencyList.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  // DFS to detect cycles
  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // Back edge found, cycle detected
    }
    if (visited.has(nodeId)) {
      return false; // Already processed
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check all nodes for cycles
  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) {
      return true;
    }
  }

  return false;
}

const nodeTypes = {
  pipeline: PipelineNode,
};

interface CanvasProps {
  nodes: DAGNode[];
  edges: DAGEdge[];
  onNodesChange: OnNodesChange<DAGNode>;
  onEdgesChange: OnEdgesChange<DAGEdge>;
  onConnect: (connection: Connection) => void;
  onDeleteElements: (elements: { nodes?: Node[]; edges?: Edge[] }) => void;
}

function CanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDeleteElements
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Handle node/edge deletion on Delete key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          onDeleteElements({ 
            nodes: selectedNodes, 
            edges: selectedEdges 
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, onDeleteElements]);

  const isValidConnection = useCallback((connection: Connection) => {
    // Enforce connection rules: must connect from source (right) to target (left)
    // This is automatically handled by React Flow when using handles with correct positions
    
    // Prevent self-loops
    if (connection.source === connection.target) {
      return false;
    }

    // Prevent duplicate connections
    const existingEdge = edges.find(
      edge => 
        edge.source === connection.source && 
        edge.target === connection.target
    );
    
    if (existingEdge) {
      return false;
    }

    // Check if this connection would create a cycle
    const wouldCreateCycle = checkForCycle(
      nodes,
      [...edges, {
        id: 'temp',
        source: connection.source!,
        target: connection.target!
      }]
    );
    
    return !wouldCreateCycle;
  }, [edges, nodes]);

  const handleConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        onConnect(params);
      }
    },
    [onConnect, isValidConnection]
  );

  // Fit view when auto layout is applied
  const handleFitView = useCallback(() => {
    setTimeout(() => {
      fitView({ duration: 500, padding: 0.1 });
    }, 50);
  }, [fitView]);

  // Auto-fit when nodes change significantly (like auto layout)
  useEffect(() => {
    if (nodes.length > 0) {
      const hasLayoutPositions = nodes.some(node => 
        node.position.x !== 0 || node.position.y !== 0
      );
      if (hasLayoutPositions) {
        handleFitView();
      }
    }
  }, [nodes.length, handleFitView]);

  return (
    <div className="flex-1 h-full bg-canvas-bg" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        className="bg-canvas-bg"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { 
            strokeWidth: 2,
            stroke: 'hsl(var(--edge-default))'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'hsl(var(--edge-default))'
          }
        }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-canvas-bg"
        />
        <Controls 
          className="bg-card border border-border shadow-custom-lg"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-card border border-border shadow-custom-lg"
          zoomable
          pannable
          nodeColor={(node) => {
            return node.selected ? 'hsl(var(--primary))' : 'hsl(var(--muted))';
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}