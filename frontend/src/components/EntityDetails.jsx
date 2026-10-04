function getEntityType(node) {
  const id = node.id;

  if (id === "rahul") return "PERSON";
  if (id.startsWith("laptop")) return "DEVICE";
  if (id === "report") return "FILE";
  if (id.startsWith("usb")) return "USB DEVICE";
  if (id === "ip") return "IP ADDRESS";

  return "ENTITY";
}

function getDescription(node) {
  const descriptions = {
    rahul: "User account associated with activity on Laptop-07.",
    laptop07: "Endpoint device used during the investigated activity.",
    report: "Sensitive document involved in access, USB transfer and network transfer events.",
    usb003: "Removable storage device connected to Laptop-07.",
    ip: "External network endpoint contacted by Laptop-07.",
  };

  return descriptions[node.id] || "Forensic entity identified in the investigation.";
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

            return (
              <div className="connection-item" key={edge.id}>
                <div className="connection-top">
                  <strong>{edge.label}</strong>
                </div>

                <p>
                  {edge.source === node.id ? "→" : "←"} {otherNode}
                </p>

                <small>{edge.data.reason}</small>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EntityDetails;