
import { useState } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import EntityDetails from "./components/EntityDetails";
import ConnectionDetails from "./components/ConnectionDetails";
import Timeline from "./components/Timeline";
import CaseSummary from "./components/CaseSummary";

import { nodes } from "./data/graphData";
import { edges as mockEdges } from "./data/graphData";

import { systemLog } from "../../src/data/systemLog.js";
import { fileAccessLog } from "../../src/data/fileAccessLog.js";
import { usbLog } from "../../src/data/usbLog.js";
import { networkLog } from "../../src/data/networkLog.js";

import { normalizeEvents } from "../../src/logic/normalizeEvents.js";
import { correlateEvents } from "../../src/logic/correlateEvents.js";
import { correlationsToGraphEdges } from "../../src/logic/graphAdapter.js";

import "./index.css";

const rawRecords = [
  ...systemLog,
  ...fileAccessLog,
  ...usbLog,
  ...networkLog,
];

const normalizedEvents = normalizeEvents(rawRecords);
const computedCorrelations = correlateEvents(normalizedEvents);
const computedEdges = correlationsToGraphEdges(computedCorrelations);

const edges = [...mockEdges, ...computedEdges];

const FILE_NODE_IDS = new Set([
  "report",
  "financial-summary",
  "meeting-notes",
  "notes",
  "presentation",
]);

const filters = ["ALL", "PEOPLE", "DEVICES", "FILES", "USB", "IP"];

function getNodeType(node) {
  if (["rahul", "amit", "priya"].includes(node.id)) {
    return "PEOPLE";
  }

  if (node.id.startsWith("laptop")) return "DEVICES";
  if (FILE_NODE_IDS.has(node.id)) return "FILES";
  if (node.id.startsWith("usb")) return "USB";
  if (node.id === "ip" || node.id.startsWith("ip-")) return "IP";

  return "ALL";
}

function getNodeClass(node) {
  const type = getNodeType(node);

  if (type === "PEOPLE") return "graph-node person-node";
  if (type === "DEVICES") return "graph-node device-node";
  if (type === "FILES") return "graph-node file-node";
  if (type === "USB") return "graph-node usb-node";
  if (type === "IP") return "graph-node ip-node";

  return "graph-node";
}

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const matchingNodeIds = new Set(
    nodes
      .filter(
        (node) =>
          activeFilter === "ALL" ||
          getNodeType(node) === activeFilter
      )
      .map((node) => node.id)
  );

  const visibleNodeIds = new Set(
    activeFilter === "ALL"
      ? nodes.map((node) => node.id)
      : [
          ...matchingNodeIds,
          ...edges
            .filter(
              (edge) =>
                matchingNodeIds.has(edge.source) ||
                matchingNodeIds.has(edge.target)
            )
            .flatMap((edge) => [edge.source, edge.target]),
        ]
  );

  const filteredNodes = nodes.filter((node) =>
    visibleNodeIds.has(node.id)
  );

  const filteredEdges =
    activeFilter === "ALL"
      ? edges
      : edges.filter(
          (edge) =>
            visibleNodeIds.has(edge.source) &&
            visibleNodeIds.has(edge.target)
        );

  const handleNodeClick = (_, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const highlightedNodes = filteredNodes.map((node) => {
    const connected =
      selectedEdge &&
      (node.id === selectedEdge.source ||
        node.id === selectedEdge.target);

    const selected = selectedNode?.id === node.id;
    const highlighted = connected || selected;

    return {
      ...node,
      className: getNodeClass(node),
      style: {
        background: highlighted ? "#eff6ff" : "#ffffff",
        border: highlighted
          ? "2px solid #2563eb"
          : "1px solid #dbe2ea",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#172033",
        minWidth: "150px",
        textAlign: "center",
        boxShadow: highlighted
          ? "0 0 0 4px rgba(37, 99, 235, 0.12), 0 5px 14px rgba(37, 99, 235, 0.16)"
          : "0 3px 10px rgba(0, 0, 0, 0.07)",
        opacity: selectedEdge && !connected ? 0.38 : 1,
        transition: "all 0.2s ease",
      },
    };
  });

  const highlightedEdges = filteredEdges.map((edge) => {
    const selected = selectedEdge?.id === edge.id;
    const computed = edge.data?.isComputed === true;

    const risky =
      !computed &&
      ["e2", "e4", "e6"].includes(edge.id);

    return {
      ...edge,
      type: "smoothstep",
      animated: selected || risky,
      style: {
        stroke: selected
          ? "#2563eb"
          : computed
          ? "#7c3aed"
          : risky
          ? "#f97316"
          : selectedEdge
          ? "#cbd5e1"
          : "#64748b",
        strokeWidth: selected ? 4 : computed || risky ? 2.5 : 2,
        strokeDasharray: computed ? "6 4" : undefined,
        opacity: selectedEdge && !selected ? 0.3 : 1,
      },
      labelStyle: {
        fill: selected
          ? "#2563eb"
          : computed
          ? "#7c3aed"
          : risky
          ? "#c2410c"
          : "#334155",
        fontSize: selected || computed || risky ? 11 : 10,
        fontWeight: 700,
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.95,
      },
    };
  });

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>SUTRAM</h1>
          <p>Digital Forensics Investigation Framework</p>
        </div>

        <div className="case-info">
          <span>CASE-001</span>
          <span className="status">● ACTIVE</span>
        </div>
      </header>

      <main className="workspace">
        <section className="graph-section">
          <CaseSummary nodes={nodes} edges={edges} />

          <div className="section-header">
            <div>
              <h2>Evidence Graph</h2>
              <p>Explore entities and evidence connections</p>
            </div>

            <div className="legend">
              <span>👤 Person</span>
              <span>💻 Device</span>
              <span>📄 File</span>
              <span>🔌 USB</span>
              <span>🌐 IP</span>
            </div>
          </div>

          <div className="filter-bar">
            <span className="filter-label">FOCUS</span>

            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-button ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => handleFilter(filter)}
              >
                {filter}
              </button>
            ))}

            {activeFilter !== "ALL" && (
              <span className="focus-indicator">
                FOCUSED: {activeFilter}
              </span>
            )}
          </div>

          <div className="graph-container">
            {selectedEdge && (
              <div className="graph-focus-banner">
                <span>
                  {selectedEdge.data?.isComputed
                    ? "COMPUTED CORRELATION"
                    : "MOCK RELATIONSHIP"}
                </span>

                <strong>
                  {selectedEdge.source} → {selectedEdge.target}
                </strong>

                <button onClick={() => setSelectedEdge(null)}>
                  Clear
                </button>
              </div>
            )}

            <ReactFlow
              nodes={highlightedNodes}
              edges={highlightedEdges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            >
              <Background gap={20} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          <div className="legend">
            <span>━━ Original mock relationship</span>
            <span style={{ color: "#7c3aed" }}>
              - - - Computed correlation
            </span>
          </div>

          {/* Keep the existing timeline on mock edges for now.
              Computed correlations will be added after its data
              handling is updated. */}
          <Timeline
  edges={edges}
  selectedEdge={selectedEdge}
  onEventClick={handleEdgeClick}
/>
        </section>

        <aside className="details-panel">
          {selectedEdge ? (
            <ConnectionDetails edge={selectedEdge} />
          ) : selectedNode ? (
            <EntityDetails node={selectedNode} edges={edges} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <h3>Investigate the evidence</h3>
              <p>
                Click an entity, connection, or timeline event to
                inspect its forensic details.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
