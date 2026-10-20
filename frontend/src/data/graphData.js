
export const nodes = [
  // People
  { id: "rahul", data: { label: "👤 Rahul" }, position: { x: 0, y: 150 } },
  { id: "amit", data: { label: "👤 Amit" }, position: { x: 0, y: 350 } },
  { id: "priya", data: { label: "👤 Priya" }, position: { x: 0, y: 550 } },

  // Devices
  { id: "laptop07", data: { label: "💻 Laptop-07" }, position: { x: 250, y: 150 } },
  { id: "laptop03", data: { label: "💻 Laptop-03" }, position: { x: 250, y: 350 } },
  { id: "laptop11", data: { label: "💻 Laptop-11" }, position: { x: 250, y: 550 } },

  // Files
  { id: "report", data: { label: "📄 confidential_report.pdf" }, position: { x: 500, y: 70 } },
  { id: "financial-summary", data: { label: "📄 financial_summary.xlsx" }, position: { x: 500, y: 280 } },
  { id: "meeting-notes", data: { label: "📄 meeting_notes.docx" }, position: { x: 500, y: 500 } },
  { id: "notes", data: { label: "📄 notes.txt" }, position: { x: 500, y: 170 } },
  { id: "presentation", data: { label: "📄 presentation.pptx" }, position: { x: 500, y: 380 } },

  // USB devices
  { id: "usb003", data: { label: "🔌 USB-003" }, position: { x: 800, y: 100 } },
  { id: "usb005", data: { label: "🔌 USB-005" }, position: { x: 800, y: 350 } },

  // Network endpoints
  { id: "ip", data: { label: "🌐 85.21.44.9" }, position: { x: 800, y: 200 } },
  { id: "ip-amit", data: { label: "🌐 172.16.4.22" }, position: { x: 800, y: 500 } },
];

export const edges = [
  {
    id: "e1", source: "rahul", target: "laptop07", label: "USED",
    data: {
      relation: "USED",
      reason: "Rahul logged into Laptop-07.",
      evidence: "system_log",
      recordId: "SYS-001",
      timestamp: "2026-09-21T02:41:03",
      isComputed: false,
      isMock: true,
    },
  },
  {
    id: "e2", source: "rahul", target: "report", label: "ACCESSED",
    data: {
      relation: "ACCESSED",
      reason: "Rahul accessed confidential_report.pdf.",
      evidence: "system_log",
      recordId: "SYS-002",
      timestamp: "2026-09-21T02:42:17",
      isComputed: false,
      isMock: true,
    },
  },
  {
    id: "e3", source: "laptop07", target: "usb003", label: "CONNECTED_TO",
    data: {
      relation: "CONNECTED_TO",
      reason: "USB-003 was connected to Laptop-07.",
      evidence: "usb_log",
      recordId: "USB-001",
      timestamp: "2026-09-21T02:43:02",
      isComputed: false,
      isMock: true,
    },
  },
  {
    id: "e4", source: "report", target: "usb003", label: "COPIED_TO",
    data: {
      relation: "COPIED_TO",
      reason: "confidential_report.pdf was written to USB-003.",
      evidence: "usb_log",
      recordId: "USB-002",
      timestamp: "2026-09-21T02:44:03",
      isComputed: false,
      isMock: true,
    },
  },
  {
    id: "e5", source: "laptop07", target: "ip", label: "CONNECTED_TO",
    data: {
      relation: "CONNECTED_TO",
      reason: "Laptop-07 established a connection with 85.21.44.9.",
      evidence: "network_log",
      recordId: "NET-001",
      timestamp: "2026-09-21T02:45:32",
      isComputed: false,
      isMock: true,
    },
  },
  {
    id: "e6", source: "report", target: "ip", label: "TRANSFERRED",
    data: {
      relation: "TRANSFERRED",
      reason: "confidential_report.pdf was transferred to 85.21.44.9.",
      evidence: "network_log",
      recordId: "NET-002",
      timestamp: "2026-09-21T02:46:13",
      isComputed: false,
      isMock: true,
    },
  },
];
