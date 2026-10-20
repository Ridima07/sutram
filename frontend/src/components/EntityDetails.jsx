
const FILE_NODE_IDS = new Set([
  "report",
  "financial-summary",
  "meeting-notes",
  "notes",
  "presentation",
]);

function getEntityType(node) {
  const id = node.id;

  if (["rahul", "amit", "priya"].includes(id)) return "PERSON";
  if (id.startsWith("laptop")) return "DEVICE";
  if (FILE_NODE_IDS.has(id)) return "FILE";
  if (id.startsWith("usb")) return "USB DEVICE";
  if (id === "ip" || id.startsWith("ip-")) return "IP ADDRESS";

  return "ENTITY";
}

function getDescription(node) {
  const descriptions = {
    rahul: "User account associated with activity on Laptop-07.",
    amit: "User account associated with activity on Laptop-03.",
    priya: "User account associated with activity on Laptop-11.",

    laptop07: "Endpoint device associated with the investigated activity.",
    laptop03: "Endpoint device associated with financial-summary.xlsx and related events.",
    laptop11: "Endpoint device associated with meeting_notes.docx and related events.",

    report: "Confidential document appearing in access, removable-storage, and network-transfer correlations.",
    "financial-summary": "Spreadsheet associated with file access and other correlated events.",
    "meeting-notes": "Document associated with correlated endpoint activity.",
    notes: "Text file associated with a correlated endpoint activity.",
    presentation: "Presentation file associated with a correlated endpoint activity.",

    usb003: "Removable storage device associated with Laptop-07 activity.",
    usb005: "Removable storage device associated with Laptop-03 activity.",

    ip: "Network endpoint associated with Laptop-07 activity.",
    "ip-amit": "Network endpoint associated with Laptop-03 activity.",
  };

  return (
    descriptions[node.id] ||
    "Forensic entity identified in the investigation."
  );
}

function EntityDetails({ node, edges }) {
  const relatedEdges = edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id
  );

  return (
    <div className="details-content">
      <div className="details-header">
        <span className="eyebrow">{getEntityType(node)}</span>
        <h2>{node.data.label}</h2>
        <p className="entity-description">{getDescription(node)}</p>
      </div>

      <div className="detail-card">
        <span>ENTITY ID</span>
        <strong>{node.id}</strong>
      </div>

      <div className="section-title">
        <h3>Evidence Connections</h3>
        <span>{relatedEdges.length}</span>
      </div>

      {relatedEdges.length === 0 ? (
        <p className="muted">No connected evidence found.</p>
      ) : (
        <div className="connection-list">
          {relatedEdges.map((edge) => {
            const otherNode =
              edge.source === node.id ? edge.target : edge.source;

            const isComputed = edge.data?.isComputed === true;

            return (
              <div className="connection-item" key={edge.id}>
                <div className="connection-top">
                  <strong>{edge.label || edge.data?.relation}</strong>
                  <span>
                    {isComputed ? "COMPUTED" : "MOCK"}
                  </span>
                </div>

                <p>
                  {edge.source === node.id ? "→" : "←"} {otherNode}
                </p>

                <small>
                  {edge.data?.reason || "No explanation available."}
                </small>

                {isComputed && (
                  <small>
                    Records: {(edge.data.recordIds || []).join(" ↔ ")}
                  </small>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EntityDetails;
