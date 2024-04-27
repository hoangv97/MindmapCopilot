import React, { useCallback, useState } from 'react';
import useStore from '../../store';
import { shallow } from 'zustand/shallow';
import { selector } from '../../store/mindmap';
import { useReactFlow } from 'reactflow';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  onOpenStyleDialog,
  ...props
}: any) {
  const { getNode } = useReactFlow();
  const { nodes, edges, setData, deleteNode, addNode } = useStore(
    selector,
    shallow
  );

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNode(node, position);
  }, [id, getNode]);

  const onDeleteNode = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(id);
    }
  }, [id]);

  const detachParent = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to detach this node from its parent?'
      )
    ) {
      setData(
        nodes,
        edges.filter((edge: any) => edge.target !== id)
      );
    }
  }, [id, nodes, edges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-10"
      {...props}
    >
      <Command className="rounded-lg border shadow-md">
        <CommandList>
          <CommandGroup heading={`Node: ${id}`}>
            <CommandItem>
              <div onClick={onOpenStyleDialog}>Style</div>
            </CommandItem>
            <CommandItem>
              <div onClick={detachParent}>Detach parent</div>
            </CommandItem>
            <CommandItem>
              <div onClick={duplicateNode}>Duplicate</div>
            </CommandItem>
            <CommandItem>
              <div onClick={onDeleteNode}>Delete</div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
