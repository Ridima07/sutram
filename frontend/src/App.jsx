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

import { nodes, edges } from "./data/graphData";

import "./index.css";

const filters = [
  "ALL",
  "PEOPLE",
  "DEVICES",
  "FILES",
  "USB",
  "IP",
];

function getNodeType(node) {
  if (node.id === "rahul") return "PEOPLE";
  if (node.id.startsWith("laptop")) return "DEVICES";
  if (node.id === "report") return "FILES";
  if (node.id.startsWith("usb")) return "USB";
  if (node.id === "ip") return "IP";

  return "ALL";
}

function getNodeClass(node) {
  const type = getNodeType(node);

  if (type === "PEOPLE") {
    return "graph-node person-node";
  }

  if (type === "DEVICES") {
    return "graph-node device-node";
  }

  if (type === "FILES") {
    return "graph-node file-node";
  }

  if (type === "USB") {
    return "graph-node usb-node";
  }

  if (type === "IP") {
    return "graph-node ip-node";
  }

  return "graph-node";
}

function App() {
  const [selectedNode, setSelectedNode] =
    useState(null);

  const [selectedEdge, setSelectedEdge] =
    useState(null);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  /*
   * Find the nodes that directly match
   * the selected entity type.
   */
  const matchingNodeIds = new Set(
    nodes
      .filter(
        (node) =>
          activeFilter === "ALL" ||
          getNodeType(node) === activeFilter
      )
      .map((node) => node.id)
  );

  /*
   * For a focused filter, also include
   * nodes connected to the matching node.
   */
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
            .flatMap((edge) => [
              edge.source,
              edge.target,
            ]),
        ]
  );

  const filteredNodes = nodes.filter(
    (node) => visibleNodeIds.has(node.id)
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

  const handleTimelineClick = (edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const highlightedNodes =
    filteredNodes.map((node) => {
      const connected =
        selectedEdge &&
        (node.id === selectedEdge.source ||
          node.id === selectedEdge.target);

      const selected =
        selectedNode &&
        node.id === selectedNode.id;

      const highlighted =
        connected || selected;

      return {
        ...node,

        className: getNodeClass(node),

        style: {
          background: highlighted
            ? "#eff6ff"
            : "#ffffff",

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

          opacity:
            selectedEdge && !connected
              ? 0.38
              : 1,

          transition:
            "all 0.2s ease",
        },
      };
    });

  const highlightedEdges =
    filteredEdges.map((edge) => {
      const selected =
        selectedEdge?.id === edge.id;

      const risky =
        edge.id === "e2" ||
        edge.id === "e4" ||
        edge.id === "e6";

      return {
        ...edge,

        type: "smoothstep",

        animated:
          selected || risky,

        style: {
          stroke: selected
            ? "#2563eb"
            : risky
            ? "#f97316"
            : selectedEdge
            ? "#cbd5e1"
            : "#64748b",

          strokeWidth:
            selected
              ? 4
              : risky
              ? 2.5
              : 2,

          opacity:
            selectedEdge && !selected
              ? 0.3
              : 1,
        },

        labelStyle: {
          fill: selected
            ? "#2563eb"
            : risky
            ? "#c2410c"
            : "#334155",

          fontSize:
            selected || risky
              ? 11
              : 10,

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

          <p>
            Digital Forensics Investigation Framework
          </p>
        </div>

        <div className="case-info">

          <span>
            CASE-001
          </span>

          <span className="status">
            ● ACTIVE
          </span>

        </div>

      </header>

      <main className="workspace">

        <section className="graph-section">

          <CaseSummary
            nodes={nodes}
            edges={edges}
          />

          <div className="section-header">

            <div>
              <h2>
                Evidence Graph
              </h2>

              <p>
                Explore entities and evidence
                connections
              </p>
            </div>

            <div className="legend">

              <span>
                👤 Person
              </span>

              <span>
                💻 Device
              </span>

              <span>
                📄 File
              </span>

              <span>
                💾 USB
              </span>

              <span>
                🌐 IP
              </span>

            </div>

          </div>

          <div className="filter-bar">

            <span className="filter-label">
              FOCUS
            </span>

            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-button ${
                  activeFilter === filter
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleFilter(filter)
                }
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
                  INVESTIGATING CONNECTION
                </span>

                <strong>
                  {selectedEdge.source}
                  {" → "}
                  {selectedEdge.target}
                </strong>

                <button
                  onClick={() =>
                    setSelectedEdge(null)
                  }
                >
                  Clear
                </button>

              </div>
            )}

            <ReactFlow
              nodes={highlightedNodes}
              edges={highlightedEdges}
              fitView
              fitViewOptions={{
                padding: 0.2,
              }}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            >

              <Background
                gap={20}
                size={1}
              />

              <Controls />

              <MiniMap />

            </ReactFlow>

          </div>

          <Timeline
            edges={edges}
            selectedEdge={selectedEdge}
            onEventClick={handleTimelineClick}
          />

        </section>

        <aside className="details-panel">

          {selectedEdge ? (
            <ConnectionDetails
              edge={selectedEdge}
            />
          ) : selectedNode ? (
            <EntityDetails
              node={selectedNode}
              edges={edges}
            />
          ) : (
            <div className="empty-state">

              <div className="empty-icon">
                🔎
              </div>

              <h3>
                Investigate the evidence
              </h3>

              <p>
                Click an entity, connection, or
                timeline event to inspect its
                forensic details.
              </p>

            </div>
          )}

        </aside>

      </main>

    </div>
  );
}

export default App;