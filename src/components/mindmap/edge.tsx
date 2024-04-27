import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  MarkerType,
  getBezierPath,
} from 'reactflow';
import React from 'react';
import EdgeLabelDialog from './dialogs/edges/label';

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, data } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY: sourceY + 0,
    targetX,
    targetY,
  });

  const [edgeLabelDialogOpen, setEdgeLabelDialogOpen] = React.useState(false);

  return (
    <>
      <BaseEdge path={edgePath} {...props} />
      {/* <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan absolute p-1 text-xs font-bold bg-slate-500 z-10"
          onClick={() => {
            setEdgeLabelDialogOpen(true);
          }}
        >
          {data?.label || ''}
        </div>
      </EdgeLabelRenderer>
      {edgeLabelDialogOpen && (
        <EdgeLabelDialog
          onSave={() => {}}
          onClose={() => {
            setEdgeLabelDialogOpen(false);
          }}
        />
      )} */}
    </>
  );
}

export default MindMapEdge;
