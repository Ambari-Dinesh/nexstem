import React, { useState, useCallback, useEffect } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';

import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import JSONPreview from '../components/JSONPreview';
import { DAGNode, DAGEdge, DAGData } from '../types/graphTypes';
import { validateDAG } from '../utils/validateDAG';
import { applyAutoLayout } from '../utils/autoLayout';

const initialNodes: DAGNode[] = [];
const initialEdges: DAGEdge[] = [];

let nodeIdCounter = 1;
let edgeIdCounter = 1;

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DAGNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<DAGEdge>(initialEdges);
  const [validation, setValidation] = useState(validateDAG([], []));

  // Update validation whenever nodes or edges change
  useEffect(() => {
    const newValidation = validateDAG(nodes, edges);
    setValidation(newValidation);
  }, [nodes, edges]);

  const handleAddNode = useCallback(() => {
    const label = prompt('Enter node label:', `Task ${nodeIdCounter}`);
    if (!label) return;

    const newNode: DAGNode = {
      id: `node-${nodeIdCounter++}`,
      type: 'pipeline',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const handleConnect = useCallback(
    (params: Connection) => {
      const newEdge: DAGEdge = {
        id: `edge-${edgeIdCounter++}`,
        source: params.source!,
        target: params.target!,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: 'hsl(var(--edge-default))'
        },
        style: {
          strokeWidth: 2,
          stroke: 'hsl(var(--edge-default))'
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleDeleteElements = useCallback(
    (elements: { nodes?: Node[]; edges?: Edge[] }) => {
      if (elements.nodes) {
        const nodeIdsToDelete = new Set(elements.nodes.map(n => n.id));
        setNodes((nds) => nds.filter(n => !nodeIdsToDelete.has(n.id)));
        // Also delete edges connected to deleted nodes
        setEdges((eds) => eds.filter(e => 
          !nodeIdsToDelete.has(e.source) && !nodeIdsToDelete.has(e.target)
        ));
      }
      
      if (elements.edges) {
        const edgeIdsToDelete = new Set(elements.edges.map(e => e.id));
        setEdges((eds) => eds.filter(e => !edgeIdsToDelete.has(e.id)));
      }
    },
    [setNodes, setEdges]
  );

  const handleAutoLayout = useCallback(() => {
    if (nodes.length < 2) return;
    
    const layoutedNodes = applyAutoLayout(nodes, edges);
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  const dagData: DAGData = {
    nodes,
    edges,
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        onAddNode={handleAddNode}
        onAutoLayout={handleAutoLayout}
        validation={validation}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDeleteElements={handleDeleteElements}
        />
        
        <div className="w-80 p-4 bg-muted/30 border-l border-border overflow-auto">
          <JSONPreview data={dagData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
