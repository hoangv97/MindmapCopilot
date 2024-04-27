import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Node,
  NodeOrigin,
  OnConnectEnd,
  OnConnectStart,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import useStore from '../../store';
import { DEFAULT_ROOT_NODE, selector } from '../../store/mindmap';
import ContextMenu from './context-menu';
import FilesDialog from './dialogs/files/list';
import SaveFileDialog from './dialogs/files/save';
import MindMapEdge from './edge';
import {
  createFile,
  getCurrentFile,
  saveCurrentFile,
  updateFile,
} from './lib/data';
import { LAYOUT_OPTIONS } from './lib/layout';
import MindMapNode from './node';
import NodeDetail from './node-detail';
import NodeStyleDialog from './dialogs/nodes/style';
import FlashcardListDialog from './dialogs/flashcards/list';
import {
  useMakeCopilotReadable,
  useCopilotAction,
} from '@copilotkit/react-core';

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = {
  // stroke: '#F6AD55',
  strokeWidth: 1,
};
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

interface MindmapProps {
  isFullScreen: boolean;
}

const Mindmap = ({ isFullScreen }: MindmapProps) => {
  const [menu, setMenu] = useState<any>(null);
  const ref = useRef<any>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addChildNode,
    addNode,
    setData,
    loadingStatus,
    config,
    setConfig,
    currentFile,
    setCurrentFile,
    setSelectedNode,
    updateNodeData,
    addNodesFromCopilot,
  } = useStore(selector, shallow);
  const connectingNodeId = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openFileListDialog, setOpenFileListDialog] = useState(false);
  const [nodeStyleDialog, setNodeStyleDialog] = useState({
    open: false,
    nodeId: '',
    nodeData: {},
  });
  const [flashcardListDialogOpen, setFlashcardListDialogOpen] = useState(false);

  const store = useStoreApi();
  const { screenToFlowPosition, setViewport, fitView } = useReactFlow();
  const autoSaveInterval = useRef<any>(null);

  useEffect(() => {
    const currentFile = getCurrentFile();
    if (currentFile) {
      onRestore(currentFile);
    }
  }, []);

  const getChildNodePosition = useCallback(
    (event: MouseEvent, parentNode?: Node) => {
      const { domNode } = store.getState();

      if (
        !domNode ||
        // we need to check if these properties exist, because when a node is not initialized yet,
        // it doesn't have a positionAbsolute nor a width or height
        !parentNode?.positionAbsolute ||
        !parentNode?.width ||
        !parentNode?.height
      ) {
        return;
      }

      const panePosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
      return {
        x:
          panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
        y:
          panePosition.y -
          parentNode.positionAbsolute.y +
          parentNode.height / 2,
      };
    },
    [screenToFlowPosition]
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      } else {
        const parentNode = (event.target as Element).parentElement;
        const parentIsNode = parentNode?.classList.contains('react-flow__node');
        const targetNodeId = parentNode?.getAttribute('data-id');
        if (
          parentNode &&
          parentIsNode &&
          connectingNodeId.current &&
          targetNodeId
        ) {
          setData(nodes, [
            ...edges,
            {
              id: nanoid(),
              source: connectingNodeId.current,
              target: targetNodeId,
            },
          ]);
        }
      }
    },
    [getChildNodePosition]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
        data: node.data,
      });
    },
    [setMenu]
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onSaveAsNewFile = useCallback(
    (state: any) => {
      if (rfInstance) {
        const data = rfInstance.toObject();
        const file = createFile(state.name, data);
        setCurrentFile(file);
        saveCurrentFile(file.id);
      }
    },
    [rfInstance, setCurrentFile]
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const data = rfInstance.toObject();
      // console.log('save data', data);
      updateFile(currentFile.id, data);
    }
  }, [rfInstance, currentFile]);

  const onRestore = useCallback(
    (file: any) => {
      const restoreFlow = async () => {
        setCurrentFile(file);
        saveCurrentFile(file.id);
        const flow = JSON.parse(file.data);

        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setData(flow.nodes || [], flow.edges || []);
          setViewport({ x, y, zoom });
        }
      };

      restoreFlow();
    },
    [setData, setViewport, setCurrentFile]
  );

  useEffect(() => {
    // auto save
    if (currentFile) {
      autoSaveInterval.current = setInterval(() => {
        onSave();
      }, 5000);
    } else {
      clearInterval(autoSaveInterval.current);
    }
    return () => {
      clearInterval(autoSaveInterval.current);
    };
  }, [currentFile, onSave]);

  // Copilot integration
  useMakeCopilotReadable(JSON.stringify(nodes));

  useCopilotAction({
    name: 'addNodes',
    description: 'Add some nodes to the mindmap',
    parameters: [
      {
        name: 'nodes',
        type: 'object[]',
        description: 'The nodes to add',
        attributes: [
          {
            name: 'label',
            type: 'string',
            description: 'The name of the node',
          },
          {
            name: 'parentId',
            type: 'string',
            description: 'The id of the parent node based on provided nodes',
          },
        ],
      },
    ],
    handler: (props) => {
      const { nodes } = props;
      addNodesFromCopilot(nodes);
    },
  });

  return (
    <>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={nodeOrigin}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Straight}
        fitView
        onNodeClick={(event, node) => {
          console.log('onNodeClick', node);
          setSelectedNode(node);
        }}
      >
        <Background />
        {menu && (
          <ContextMenu
            onClick={onPaneClick}
            onOpenStyleDialog={() => {
              setNodeStyleDialog({
                open: true,
                nodeId: menu.id,
                nodeData: menu.data,
              });
              setMenu(null);
            }}
            {...menu}
          />
        )}
        {nodeStyleDialog.open && (
          <NodeStyleDialog
            nodeId={nodeStyleDialog.nodeId}
            nodeData={nodeStyleDialog.nodeData}
            onSave={(nodeId, data) => {
              updateNodeData(nodeId, data);
            }}
            onClose={() => {
              setNodeStyleDialog({ open: false, nodeId: '', nodeData: {} });
            }}
          />
        )}
        <Controls />
        <Panel position="top-left">
          <div className="flex gap-2 z-50">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    onClick={() => {
                      if (
                        currentFile &&
                        !window.confirm(
                          'Are you sure you want to create a new file?'
                        )
                      ) {
                        return;
                      }
                      setCurrentFile(undefined);
                      saveCurrentFile('');
                      setData([], []);
                      setSelectedNode();
                      setViewport({ x: 0, y: 0, zoom: 1 });
                    }}
                  >
                    New File <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => setOpenFileListDialog(true)}>
                    Files <MenubarShortcut>⌘O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={onSave} disabled={!currentFile}>
                    Save <MenubarShortcut>⌘S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => setOpenSaveDialog(true)}>
                    Save as new file
                  </MenubarItem>
                  <MenubarItem onClick={() => {}} disabled={!currentFile}>
                    Export
                  </MenubarItem>
                  <MenubarItem onClick={() => {}}>Import</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    onClick={() => {
                      addNode(
                        { ...DEFAULT_ROOT_NODE, id: nanoid() },
                        { x: 0, y: 0 }
                      );
                    }}
                  >
                    Add node
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() => {
                      setFlashcardListDialogOpen(true);
                    }}
                  >
                    Show flashcards
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Search</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarSub>
                    <MenubarSubTrigger>Layout Options</MenubarSubTrigger>
                    <MenubarSubContent>
                      {LAYOUT_OPTIONS.map((option) => (
                        <MenubarCheckboxItem
                          key={option.value}
                          checked={config.layoutOption === option.value}
                          onClick={() =>
                            setConfig('layoutOption', option.value)
                          }
                        >
                          {option.label}
                        </MenubarCheckboxItem>
                      ))}
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarItem>Update Layout</MenubarItem>
                  <MenubarSeparator />
                  <MenubarCheckboxItem
                    checked={config.showMinimap}
                    onCheckedChange={(val) => setConfig('showMinimap', val)}
                  >
                    Show Minimap
                  </MenubarCheckboxItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            {openSaveDialog && (
              <SaveFileDialog
                onSave={onSaveAsNewFile}
                onClose={() => setOpenSaveDialog(false)}
              />
            )}
            {openFileListDialog && (
              <FilesDialog
                onRestore={onRestore}
                onClose={() => setOpenFileListDialog(false)}
              />
            )}
            {flashcardListDialogOpen && (
              <FlashcardListDialog
                onClose={() => setFlashcardListDialogOpen(false)}
              />
            )}
          </div>
        </Panel>
        <Panel position="top-right">
          <div className="flex gap-2">
            {!!currentFile && <div>{currentFile.name}</div>}
            {!!loadingStatus && <div>{loadingStatus}</div>}
          </div>
        </Panel>
        {!nodes.length && (
          <Panel position="top-center">
            <div className="text-2xl text-gray-500">
              Start by clicking: Edit - Add Node
            </div>
          </Panel>
        )}
        {!!config.showMinimap && isFullScreen && <MiniMap />}
        <NodeDetail />
      </ReactFlow>
    </>
  );
};

export default ({ isFullScreen }: MindmapProps) => {
  return (
    <ReactFlowProvider>
      <Mindmap isFullScreen={isFullScreen} />
    </ReactFlowProvider>
  );
};
