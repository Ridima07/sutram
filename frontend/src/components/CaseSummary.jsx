function CaseSummary({ nodes, edges }) {
  const stats = [
    {
      label: "ENTITIES",
      value: nodes.length,
      description: "Tracked entities",
    },
    {
      label: "CONNECTIONS",
      value: edges.length,
      description: "Evidence relationships",
    },
    {
      label: "EVENTS",
      value: edges.length,
      description: "Recorded forensic events",
    },
    {
      label: "RISK SIGNAL",
      value: "HIGH",
      description: "Potential data exfiltration",
      risk: true,
    },
  ];

  return (
    <div className="case-summary">
      {stats.map((stat) => (
        <div
          className={`summary-card ${
            stat.risk ? "risk-card" : ""
          }`}
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