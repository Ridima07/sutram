
const ENTITY_NODE_MAP = {
  Rahul: "rahul",
  Amit: "amit",
  Priya: "priya",

  "Laptop-07": "laptop07",
  "Laptop-03": "laptop03",
  "Laptop-11": "laptop11",

  "confidential_report.pdf": "report",
  "financial_summary.xlsx": "financial-summary",
  "meeting_notes.docx": "meeting-notes",
  "notes.txt": "notes",
  "presentation.pptx": "presentation",

  "USB-003": "usb003",
  "USB-005": "usb005",

  "85.21.44.9": "ip",
  "172.16.4.22": "ip-amit",
};

function parseEntity(entity) {
  const separator = entity.indexOf(":");

  if (separator === -1) return null;

  const type = entity.slice(0, separator);
  const value = entity.slice(separator + 1);
  const nodeId = ENTITY_NODE_MAP[value];

  return nodeId ? { type, value, nodeId } : null;
}

export function correlationsToGraphEdges(correlations) {
  if (!Array.isArray(correlations)) {
    throw new Error("Correlations must be provided as an array.");
  }

  return correlations.flatMap((correlation, index) => {
    const entities = (correlation.sharedEntities ?? [])
      .map(parseEntity)
      .filter(Boolean);

    const find = (type) => entities.find((entity) => entity.type === type);

    const file = find("file");
    const device = find("device");
    const target = find("target");
    const ip = find("ip");

    // Prefer endpoints that describe the actual activity.
    let pair = null;

    if (target && file) {
      pair = [file, target];
    } else if (file && device) {
      pair = [device, file];
    } else if (device && ip) {
      pair = [device, ip];
    }

    if (!pair || pair[0].nodeId === pair[1].nodeId) {
      return [];
    }

    return [{
      id: `correlation-${index + 1}`,
      source: pair[0].nodeId,
      target: pair[1].nodeId,
      label: "CORROBORATED",
      data: {
        relation: correlation.relation,
        reason: `Records ${correlation.from} and ${correlation.to} corroborate an activity involving ${correlation.sharedEntities.join(", ")}.`,
        evidence: "computed-correlation",
        recordIds: [correlation.from, correlation.to],
        sharedEntities: correlation.sharedEntities ?? [],
        timeDifferenceSeconds: correlation.timeDifferenceSeconds,
        strength: correlation.strength,
        isComputed: true,
        isMock: false,
      },
    }];
  });
}
