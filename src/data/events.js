// Raw forensic events collected from multiple evidence sources.
// The events are intentionally out of chronological order.
// The reconstruction engine will sort them into the correct timeline.

export const rawEvents = [
  {
    id: "E-004",
    timestamp: "2026-09-21T02:44:02",
    type: "file_copy",
    title: "File copied to USB",
    description: "confidential_report.pdf was copied to USB-003.",
    subject: "Rahul",
    device: "Laptop-07",
    file: "confidential_report.pdf",
    evidenceIds: ["EV-003", "EV-001"]
  },

  {
    id: "E-001",
    timestamp: "2026-09-21T02:41:03",
    type: "login",
    title: "Login detected",
    description: "User Rahul logged into Laptop-07.",
    subject: "Rahul",
    device: "Laptop-07",
    evidenceIds: ["EV-001"]
  },

  {
    id: "E-006",
    timestamp: "2026-09-21T02:46:12",
    type: "network_transfer",
    title: "File transfer detected",
    description:
      "confidential_report.pdf was transferred through an external network connection.",
    subject: "Rahul",
    device: "Laptop-07",
    file: "confidential_report.pdf",
    ip: "85.21.44.9",
    evidenceIds: ["EV-004", "EV-001"]
  },

  {
    id: "E-003",
    timestamp: "2026-09-21T02:43:02",
    type: "usb_connection",
    title: "USB device connected",
    description: "USB-003 was connected to Laptop-07.",
    subject: "Rahul",
    device: "Laptop-07",
    usb: "USB-003",
    evidenceIds: ["EV-003", "EV-001"]
  },

  {
    id: "E-002",
    timestamp: "2026-09-21T02:42:17",
    type: "file_access",
    title: "File accessed",
    description: "confidential_report.pdf was accessed by Rahul.",
    subject: "Rahul",
    device: "Laptop-07",
    file: "confidential_report.pdf",
    evidenceIds: ["EV-001"]
  },

  {
    id: "E-005",
    timestamp: "2026-09-21T02:45:31",
    type: "external_connection",
    title: "External network connection",
    description: "Laptop-07 established a connection with an external IP.",
    subject: "Rahul",
    device: "Laptop-07",
    ip: "85.21.44.9",
    evidenceIds: ["EV-004"]
  }
];