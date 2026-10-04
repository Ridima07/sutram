export const nodes = [
  {
    id: "rahul",
    type: "default",
    data: { label: "👤 Rahul" },
    position: { x: 0, y: 150 },
  },
  {
    id: "laptop07",
    type: "default",
    data: { label: "💻 Laptop-07" },
    position: { x: 250, y: 150 },
  },
  {
    id: "report",
    type: "default",
    data: { label: "📄 confidential_report.pdf" },
    position: { x: 500, y: 70 },
  },
  {
    id: "usb003",
    type: "default",
    data: { label: "💾 USB-003" },
    position: { x: 800, y: 70 },
  },
  {
    id: "ip",
    type: "default",
    data: { label: "🌐 85.21.44.9" },
    position: { x: 500, y: 250 },
  },
];

export const edges = [
  {
    id: "e1",
    source: "rahul",
    target: "laptop07",
    label: "USED",
    data: {
      relation: "USED",
      reason: "Rahul logged into Laptop-07.",
      evidence: "system_log",
      recordId: "SYS-001",
      timestamp: "2026-09-21T02:41:03",
    },
  },
  {
    id: "e2",
    source: "rahul",
    target: "report",
    label: "ACCESSED",
    data: {
      relation: "ACCESSED",
      reason: "Rahul accessed confidential_report.pdf.",
      evidence: "system_log",
      recordId: "SYS-002",
      timestamp: "2026-09-21T02:42:17",
    },
  },
  {
    id: "e3",
    source: "laptop07",
    target: "usb003",
    label: "CONNECTED_TO",
    data: {
      relation: "CONNECTED_TO",
      reason: "USB-003 was connected to Laptop-07.",
      evidence: "usb_log",
      recordId: "USB-001",
      timestamp: "2026-09-21T02:43:02",
    },
  },
  {
    id: "e4",
    source: "report",
    target: "usb003",
    label: "COPIED_TO",
    data: {
      relation: "COPIED_TO",
      reason: "confidential_report.pdf was written to USB-003.",
      evidence: "usb_log",
      recordId: "USB-002",
      timestamp: "2026-09-21T02:44:03",
    },
  },
  {
    id: "e5",
    source: "laptop07",
    target: "ip",
    label: "CONNECTED_TO",
    data: {
      relation: "CONNECTED_TO",
      reason: "Laptop-07 established a connection with 85.21.44.9.",
      evidence: "network_log",
      recordId: "NET-001",
      timestamp: "2026-09-21T02:45:32",
    },
  },
  {
    id: "e6",
    source: "report",
    target: "ip",
    label: "TRANSFERRED",
    data: {
      relation: "TRANSFERRED",
      reason: "confidential_report.pdf was transferred to 85.21.44.9.",
      evidence: "network_log",
      recordId: "NET-002",
      timestamp: "2026-09-21T02:46:13",
    },
  },
];