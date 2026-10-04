import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

function EvidenceGraph({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
}) {
  const styledNodes = nodes.map((node) => ({
    ...node,

    style: {
      background: "#ffffff",
      border: "2px solid #2563eb",
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#172033",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
      minWidth: "150px",
      textAlign: "center",
    },
  }));

  const styledEdges = edges.map((edge) => ({
    ...edge,

    type: "smoothstep",

    animated: false,

    style: {
      stroke: "#64748b",
      strokeWidth: 2,
    },

    labelStyle: {
      fill: "#334155",
      fontSize: 10,
      fontWeight: 600,
    },

    labelBgStyle: {
      fill: "#ffffff",
      fillOpacity: 0.9,
    },
  }));

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
    >
      <Background
        gap={20}
        size={1}
      />

      <Controls />

      <MiniMap />
    </ReactFlow>
  );
}

export default EvidenceGraph;