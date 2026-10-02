// Synthetic file-access observations.
// This source independently records activity involving files.

export const fileAccessLog = [
  {
    source: "file_access_log",
    recordId: "FILE-001",
    timestamp: "2026-09-21T02:42:17",
    user: "Rahul",
    device: "Laptop-07",
    action: "READ",
    file: "confidential_report.pdf"
  },

  {
    source: "file_access_log",
    recordId: "FILE-002",
    timestamp: "2026-09-21T02:44:02",
    user: "Rahul",
    device: "Laptop-07",
    action: "COPY",
    file: "confidential_report.pdf",
    destination: "USB-003"
  },

  {
    source: "file_access_log",
    recordId: "FILE-003",
    timestamp: "2026-09-21T02:46:12",
    user: "Rahul",
    device: "Laptop-07",
    action: "TRANSFER",
    file: "confidential_report.pdf",
    destination: "85.21.44.9"
  }
];