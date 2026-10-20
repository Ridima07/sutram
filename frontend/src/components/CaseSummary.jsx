
function CaseSummary({ nodes, edges }) {
  const computedEdges = edges.filter(
    (edge) => edge.data?.isComputed === true
  );

  const mockEdges = edges.filter(
    (edge) => edge.data?.isMock === true
  );

  const stats = [
    {
      label: "ENTITIES",
      value: nodes.length,
      description: "Tracked entities",
    },
    {
      label: "CONNECTIONS",
      value: edges.length,
      description: `${computedEdges.length} computed · ${mockEdges.length} mock`,
    },
    {
      label: "CORRELATED PAIRS",
      value: computedEdges.length,
      description: "Cross-source record correlations",
    },
    {
      label: "RISK SIGNAL",
      value: "HIGH",
      description: "Potential data exfiltration indicators",
      risk: true,
    },
  ];

  return (
    <div className="case-summary">
      {stats.map((stat) => (
        <div
          className={`summary-card ${stat.risk ? "risk-card" : ""}`}
          key={stat.label}
        >
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.description}</small>
        </div>
      ))}
    </div>
  );
}

export default CaseSummary;
