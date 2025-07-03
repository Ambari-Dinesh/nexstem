import dagre from 'dagre';
import { DAGNode, DAGEdge } from '../types/graphTypes';

export function applyAutoLayout(nodes: DAGNode[], edges: DAGEdge[]): DAGNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the layout
  dagreGraph.setGraph({ 
    rankdir: 'TB', // Top to bottom
    align: 'UL',   // Upper left alignment
    nodesep: 100,  // Horizontal separation between nodes
    ranksep: 80,   // Vertical separation between ranks
    marginx: 50,   // Margin on x-axis
    marginy: 50    // Margin on y-axis
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: 180,  // Standard node width
      height: 60   // Standard node height
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply new positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        // Dagre gives us the center position, but we need top-left
        x: nodeWithPosition.x - (nodeWithPosition.width || 180) / 2,
        y: nodeWithPosition.y - (nodeWithPosition.height || 60) / 2,
      },
    };
  });

  return layoutedNodes;
}

export function getLayoutBounds(nodes: DAGNode[]): { 
  minX: number; 
  minY: number; 
  maxX: number; 
  maxY: number; 
  width: number; 
  height: number; 
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const nodeWidth = 180;
  const nodeHeight = 60;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + nodeWidth);
    maxY = Math.max(maxY, y + nodeHeight);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}