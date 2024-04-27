import Dagre from '@dagrejs/dagre';
import { stratify, tree } from 'd3-hierarchy';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Edge, Node } from 'reactflow';

export const LAYOUT_OPTIONS = [
  {
    value: 'dagre',
    label: 'Dagre',
  },
  {
    value: 'd3',
    label: 'D3',
  },
  {
    value: 'elk_vertical',
    label: 'Elk Vertical',
  },
  {
    value: 'elk_horizontal',
    label: 'Elk Horizontal',
  },
  {
    value: 'elk_radial',
    label: 'Elk Radial',
  },
  {
    value: 'elk_force',
    label: 'Elk Force',
  },
];

const dagreG = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export const updateDagreLayout = (
  nodes: Node[],
  edges: Edge[],
  options: any
) => {
  dagreG.setGraph({ ...options });

  edges.forEach((edge) => dagreG.setEdge(edge.source, edge.target));
  nodes.forEach((node: any) => dagreG.setNode(node.id, node));

  Dagre.layout(dagreG);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = dagreG.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const d3G = tree();

export const updateD3Layout = (nodes: Node[], edges: Edge[], options: any) => {
  if (nodes.length === 0) return { nodes, edges };

  const { width, height }: any = document
    .querySelector(`[data-id="${nodes[0].id}"]`)
    ?.getBoundingClientRect();
  const hierarchy = stratify()
    .id((node: any) => node.id)
    .parentId(
      (node: any) => edges.find((edge) => edge.target === node.id)?.source
    );
  const root = hierarchy(nodes);
  const layout = d3G.nodeSize([width * 2, height * 2])(root);

  return {
    nodes: layout.descendants().map((node: any) => ({
      ...node.data,
      position: { x: node.x, y: node.y },
    })),
    edges,
  };
};

const elk = new ELK();

const defaultElkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': 100,
  'elk.spacing.nodeNode': 80,
};

export const updateElkLayout = async (
  nodes: Node[],
  edges: Edge[],
  options: any
) => {
  const layoutOptions = { ...defaultElkOptions, ...options };
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: layoutOptions,
    children: nodes as any,
    edges: edges as any,
  };

  const { children } = await elk.layout(graph);

  if (children) {
    // By mutating the children in-place we saves ourselves from creating a
    // needless copy of the nodes array.
    nodes.forEach((node: any, index: number) => {
      node.position = { x: children[index].x, y: children[index].y };
    });
  }
  return { nodes, edges };
};
