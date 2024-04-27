import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  MarkerType,
} from 'reactflow';
import { nanoid } from 'nanoid';
import {
  LAYOUT_OPTIONS,
  updateD3Layout,
  updateDagreLayout,
  updateElkLayout,
} from '../components/mindmap/lib/layout';

export type MindmapConfigState = {
  layoutOption: string;
  showMinimap: boolean;
};

type CopilotNode = {
  label: string;
  parentId: string;
};

export type RFMindmapState = {
  mindmapLoadingStatus?: string;
  mindmapNodes: Node[];
  mindmapEdges: Edge[];
  mindmapConfig: MindmapConfigState;
  mindmapCurrentFile?: any;
  mindmapSelectedNode?: Node;
  onMindmapNodesChange: OnNodesChange;
  onMindmapEdgesChange: OnEdgesChange;
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => void;
  updateMindmapNodeData: (nodeId: string, data: any) => void;
  deleteMindmapNode: (nodeId: string) => void;
  addMindmapNode: (node: Node, position: XYPosition) => void;
  setMindmapData: (nodes: Node[], edges: Edge[]) => void;
  setMindmapLayout: () => void;
  setMindmapConfig: (key: string, value: any) => void;
  setMindmapCurrentFile: (file: any) => void;
  setMindmapSelectedNode: (node?: Node) => void;
  addMindmapNodesFromCopilot: (nodes: CopilotNode[]) => void;
};

export const selector = (state: RFMindmapState) => ({
  loadingStatus: state.mindmapLoadingStatus,
  nodes: state.mindmapNodes,
  edges: state.mindmapEdges,
  config: state.mindmapConfig,
  currentFile: state.mindmapCurrentFile,
  selectedNode: state.mindmapSelectedNode,
  onNodesChange: state.onMindmapNodesChange,
  onEdgesChange: state.onMindmapEdgesChange,
  addChildNode: state.addMindmapChildNode,
  updateNodeData: state.updateMindmapNodeData,
  deleteNode: state.deleteMindmapNode,
  addNode: state.addMindmapNode,
  setData: state.setMindmapData,
  setLayout: state.setMindmapLayout,
  setConfig: state.setMindmapConfig,
  setCurrentFile: state.setMindmapCurrentFile,
  setSelectedNode: state.setMindmapSelectedNode,
  addNodesFromCopilot: state.addMindmapNodesFromCopilot,
});

const DEFAULT_MINDMAP_TYPE = 'mindmap';
const DEFAULT_ROOT_NAME = 'New Node';

export const DEFAULT_ROOT_NODE: Node = {
  id: 'root',
  type: DEFAULT_MINDMAP_TYPE,
  data: { label: DEFAULT_ROOT_NAME },
  position: { x: 0, y: 0 },
};

export const useMindmapSlice = (set: any, get: any) => {
  return {
    mindmapConfig: {
      layoutOption: LAYOUT_OPTIONS[4].value,
      showMinimap: true,
    },
    mindmapNodes: [],
    mindmapEdges: [],
    setMindmapConfig: (key: string, value: any) => {
      set({
        mindmapConfig: {
          ...get().mindmapConfig,
          [key]: value,
        },
      });
    },
    setMindmapData: (nodes: Node[], edges: Edge[]) => {
      set({
        mindmapNodes: nodes,
        mindmapEdges: edges,
      });
    },
    onMindmapNodesChange: (changes: NodeChange[]) => {
      set({
        mindmapNodes: applyNodeChanges(changes, get().mindmapNodes),
      });
    },
    onMindmapEdgesChange: (changes: EdgeChange[]) => {
      set({
        mindmapEdges: applyEdgeChanges(changes, get().mindmapEdges),
      });
    },
    addMindmapChildNode: (parentNode: Node, position: XYPosition) => {
      const newNode = {
        id: nanoid(),
        type: DEFAULT_MINDMAP_TYPE,
        data: { label: 'New Node' },
        position,
        parentNode: parentNode.id,
      };

      const newEdge = {
        id: nanoid(),
        source: parentNode.id,
        target: newNode.id,
      };

      set({
        mindmapNodes: [...get().mindmapNodes, newNode],
        mindmapEdges: [...get().mindmapEdges, newEdge],
      });
    },
    updateMindmapNodeData: (nodeId: string, data: any) => {
      set({
        mindmapNodes: get().mindmapNodes.map((node: Node) => {
          if (node.id === nodeId) {
            // it's important to create a new object here, to inform React Flow about the changes
            node.data = { ...node.data, ...data };
          }

          return node;
        }),
      });
    },
    deleteMindmapNode: (nodeId: string) => {
      set({
        mindmapNodes: get().mindmapNodes.filter(
          (node: Node) => node.id !== nodeId
        ),
        mindmapEdges: get().mindmapEdges.filter(
          (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      });
    },
    addMindmapNode: (node: Node, position: XYPosition) => {
      set({
        mindmapNodes: [
          ...get().mindmapNodes,
          { ...node, id: nanoid(), position },
        ],
      });
    },
    addMindmapNodesFromCopilot: async (nodes: CopilotNode[]) => {
      const getParentNode = (node: CopilotNode) => {
        const parentNode = get().mindmapNodes.find(
          (n: Node) => n.id === node.parentId
        );
        if (!parentNode) return null;
        return parentNode;
      };

      const newNodes = nodes.map((node, i: number) => {
        const parentNode = getParentNode(node);
        if (!parentNode) {
          return {
            ...DEFAULT_ROOT_NODE,
            data: { label: node.label },
          };
        }
        return {
          id: nanoid(),
          type: DEFAULT_MINDMAP_TYPE,
          data: { label: node.label },
          position: {
            x: parentNode.position.x + 10,
            y: parentNode.position.y + 10,
          },
          parentNode: parentNode.id,
        };
      });
      const newEdges = newNodes
        .map((node: Node) => {
          if (!node.parentNode) return null;
          return {
            id: nanoid(),
            source: node.parentNode,
            target: node.id,
          };
        })
        .filter((edge: Edge | null) => edge !== null) as Edge[];

      console.log('addMindmapNodesFromCopilot', nodes, newNodes, newEdges);

      // add new nodes to the map by timeout
      const updateNodes = [...get().mindmapNodes, ...newNodes];
      const updateEdges = [...get().mindmapEdges, ...newEdges];

      set({
        mindmapNodes: updateNodes,
        mindmapEdges: updateEdges,
      });

      // let layoutNodes: Node[] = [];
      // let layoutEdges: Edge[] = [];

      // const selectedLayoutOption = get().mindmapSelectedLayoutOption;
      // if (selectedLayoutOption === 'dagre') {
      //   const result = updateDagreLayout(updateNodes, updateEdges, {
      //     rankdir: 'TB',
      //     ranker: 'tight-tree',
      //     ranksep: 20,
      //     nodesep: 20,
      //   });
      //   layoutNodes = result.nodes;
      //   layoutEdges = result.edges;
      // } else if (selectedLayoutOption === 'd3') {
      //   const result = updateD3Layout(updateNodes, updateEdges, {});
      //   layoutNodes = result.nodes;
      //   layoutEdges = result.edges;
      // } else {
      //   let options = {};
      //   if (selectedLayoutOption === 'elk_vertical') {
      //     options = { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' };
      //   } else if (selectedLayoutOption === 'elk_horizontal') {
      //     options = {
      //       'elk.algorithm': 'layered',
      //       'elk.direction': 'RIGHT',
      //     };
      //   } else if (selectedLayoutOption === 'elk_radial') {
      //     options = { 'elk.algorithm': 'org.eclipse.elk.radial' };
      //   } else if (selectedLayoutOption === 'elk_force') {
      //     options = { 'elk.algorithm': 'org.eclipse.elk.force' };
      //   }
      //   const result = await updateElkLayout(updateNodes, updateEdges, options);
      //   layoutNodes = result.nodes;
      //   layoutEdges = result.edges;
      // }

      // set({
      //   mindmapNodes: layoutNodes,
      //   mindmapEdges: layoutEdges,
      // });
    },

    setMindmapCurrentFile: (file: any) => {
      set({
        mindmapCurrentFile: file,
      });
    },
    setMindmapSelectedNode: (node?: Node) => {
      set({
        mindmapSelectedNode: node,
      });
    },
  };
};
