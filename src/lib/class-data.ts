
export type Class = {
  time: string;
  subject: string;
  code: string;
  room: string;
  instructor: string;
  status: "Completed" | "In Progress" | "Upcoming";
};

export const classes: Class[] = [
  {
    time: "09:00 AM - 10:00 AM",
    subject: "Advanced Mathematics",
    code: "MTH-302",
    room: "301",
    instructor: "Dr. Alan Grant",
    status: "Completed",
  },
  {
    time: "10:00 AM - 11:00 AM",
    subject: "Quantum Physics",
    code: "PHY-410",
    room: "112",
    instructor: "Dr. Ellie Sattler",
    status: "In Progress",
  },
  {
    time: "11:00 AM - 12:00 PM",
    subject: "Shakespearean Literature",
    code: "LIT-201",
    room: "205",
    instructor: "Dr. Ian Malcolm",
    status: "Upcoming",
  },
  {
    time: "01:00 PM - 02:00 PM",
    subject: "Organic Chemistry",
    code: "CHM-223",
    room: "Lab 4",
    instructor: "Dr. Henry Wu",
    status: "Upcoming",
  },
];

export const getCurrentClass = () => {
    return classes.find(c => c.status === 'In Progress');
}

export const getNextClass = () => {
    return classes.find(c => c.status === 'Upcoming');
}
