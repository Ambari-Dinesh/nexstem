import { DAGNode, DAGEdge, DAGValidationResult } from '../types/graphTypes';

export function validateDAG(nodes: DAGNode[], edges: DAGEdge[]): DAGValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: At least 2 nodes
  if (nodes.length < 2) {
    errors.push('DAG must have at least 2 nodes');
  }

  // Rule 2: Since we prevent cycles during connection, we don't need to check for them here
  // This keeps the validation clean and focused on other rules

  // Rule 3: All nodes should be connected by at least one edge
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
  if (disconnectedNodes.length > 0 && nodes.length > 1) {
    warnings.push(`${disconnectedNodes.length} node(s) are not connected`);
  }

  // Rule 4: No self-loops (also prevented during connection)
  const selfLoops = edges.filter(edge => edge.source === edge.target);
  if (selfLoops.length > 0) {
    errors.push('Self-loops are not allowed');
  }

  // Rule 5: Check for multiple edges between same nodes
  const edgeMap = new Map<string, number>();
  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
  });

  const duplicateEdges = Array.from(edgeMap.entries()).filter(([_, count]) => count > 1);
  if (duplicateEdges.length > 0) {
    warnings.push('Multiple edges detected between same nodes');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}


export function getValidationStatusColor(validation: DAGValidationResult): string {
  if (!validation.isValid) return 'destructive';
  if (validation.warnings.length > 0) return 'warning';
  return 'success';
}

export function getValidationStatusText(validation: DAGValidationResult): string {
  if (!validation.isValid) return 'Invalid DAG';
  if (validation.warnings.length > 0) return 'Valid with warnings';
  return 'Valid DAG';
}