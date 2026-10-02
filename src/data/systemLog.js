// Synthetic system-log observations.
// These are raw observations from one evidence source.
// They do not contain the final reconstructed incident.

export const systemLog = [
  {
    source: "system_log",
    recordId: "SYS-001",
    timestamp: "2026-09-21T02:41:03",
    user: "Rahul",
    device: "Laptop-07",
    action: "LOGIN"
  },

  {
    source: "system_log",
    recordId: "SYS-002",
    timestamp: "2026-09-21T02:42:17",
    user: "Rahul",
    device: "Laptop-07",
    action: "FILE_ACCESS",
    file: "confidential_report.pdf"
  },

  {
    source: "system_log",
    recordId: "SYS-003",
    timestamp: "2026-09-21T02:45:31",
    user: "Rahul",
    device: "Laptop-07",
    action: "NETWORK_CONNECTION",
    ip: "85.21.44.9"
  }
];