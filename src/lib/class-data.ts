import { resetAllStudentStatuses } from "./student-data";

export type Class = {
  time: string;
  subject: string;
  code: string;
  room: string;
  instructor: string;
  status: "Completed" | "In Progress" | "Upcoming";
};

export let classes: Class[] = [
  {
    time: "09:00 AM - 10:00 AM",
    subject: "Advanced Mathematics",
    code: "MTH-302",
    room: "301",
    instructor: "Dr. Alan Grant",
    status: "Upcoming",
  },
  {
    time: "10:00 AM - 11:00 AM",
    subject: "Quantum Physics",
    code: "PHY-410",
    room: "112",
    instructor: "Dr. Ellie Sattler",
    status: "Upcoming",
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

let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function subscribe(callback: () => void) {
  listeners.push(callback);
  return function unsubscribe() {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function getClasses() {
    return classes;
}

export function addClass(newClass: Class) {
  classes.push(newClass);
  updateClassStatuses();
  notifyListeners();
}

export function removeClass(classCode: string) {
  classes = classes.filter(c => c.code !== classCode);
  notifyListeners();
}

export const getCurrentClass = () => {
    return classes.find(c => c.status === 'In Progress');
}

export const getNextClass = () => {
    const upcomingClasses = classes
        .filter(c => c.status === 'Upcoming')
        .sort((a, b) => {
            const timeA = parseTime(a.time)[0];
            const timeB = parseTime(b.time)[0];
            return timeA.getTime() - timeB.getTime();
        });
    return upcomingClasses[0];
}

function parseTime(timeString: string): [Date, Date] {
    const [startTimeStr, endTimeStr] = timeString.split(' - ');
    
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    const [startHour, startMinute] = startTimeStr.slice(0, -3).split(':').map(Number);
    const startMeridiem = startTimeStr.slice(-2);
    
    let adjustedStartHour = startHour;
    if (startMeridiem === 'PM' && startHour < 12) {
        adjustedStartHour += 12;
    } else if (startMeridiem === 'AM' && startHour === 12) {
        adjustedStartHour = 0;
    }
    
    startDate.setHours(adjustedStartHour, startMinute, 0, 0);

    const [endHour, endMinute] = endTimeStr.slice(0, -3).split(':').map(Number);
    const endMeridiem = endTimeStr.slice(-2);

    let adjustedEndHour = endHour;
    if (endMeridiem === 'PM' && endHour < 12) {
        adjustedEndHour += 12;
    } else if (endMeridiem === 'AM' && endHour === 12) {
        adjustedEndHour = 0;
    }

    endDate.setHours(adjustedEndHour, endMinute, 0, 0);
    
    return [startDate, endDate];
}

export function updateClassStatuses() {
    const now = new Date();
    let changed = false;
    let wasNewClassInProgress = false;

    classes.forEach(classItem => {
        const [startTime, endTime] = parseTime(classItem.time);
        const oldStatus = classItem.status;
        let newStatus: Class['status'] = 'Upcoming';

        if (now >= startTime && now < endTime) {
            newStatus = 'In Progress';
        } else if (now >= endTime) {
            newStatus = 'Completed';
        } else {
            newStatus = 'Upcoming';
        }
        
        if (oldStatus !== newStatus) {
            classItem.status = newStatus;
            changed = true;
            if (newStatus === 'In Progress' && oldStatus !== 'In Progress') {
                wasNewClassInProgress = true;
            }
        }
    });

    if (wasNewClassInProgress) {
        resetAllStudentStatuses();
    } else if (changed) {
        notifyListeners();
    }
}
