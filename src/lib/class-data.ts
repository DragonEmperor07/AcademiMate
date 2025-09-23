import { resetAllStudentStatuses } from "./student-data";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export type Class = {
  time: string;
  subject: string;
  code: string;
  room: string;
  instructor: string;
  status: "Completed" | "In Progress" | "Upcoming";
};

let classes: Class[] = [];
let listeners: ((classes: Class[], current: Class | undefined, next: Class | undefined) => void)[] = [];

const classesCollection = collection(db, 'classes');

onSnapshot(classesCollection, snapshot => {
  classes = snapshot.docs.map(doc => doc.data() as Class).sort((a, b) => {
    const timeA = parseTime(a.time)[0];
    const timeB = parseTime(b.time)[0];
    return timeA.getTime() - timeB.getTime();
  });
  updateClassStatuses(true); // Force update and notify on initial load/change from DB
});

function notifyListeners() {
  const current = getCurrentClass();
  const next = getNextClass();
  listeners.forEach(listener => listener(classes, current, next));
}

export function subscribe(callback: (classes: Class[], current: Class | undefined, next: Class | undefined) => void) {
  listeners.push(callback);
  callback(classes, getCurrentClass(), getNextClass()); // Immediately send current data
  return function unsubscribe() {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function getClasses() {
  return classes;
}

export async function addClass(newClass: Omit<Class, 'status'>) {
  const classWithStatus: Class = { ...newClass, status: "Upcoming" };
  const classDocRef = doc(db, 'classes', newClass.code);
  await setDoc(classDocRef, classWithStatus);
  updateClassStatuses();
}

export async function removeClass(classCode: string) {
  const classDocRef = doc(db, 'classes', classCode);
  await deleteDoc(classDocRef);
}

export const getCurrentClass = () => {
    return getClasses().find(c => c.status === 'In Progress');
}

export const getNextClass = () => {
    const upcomingClasses = getClasses()
        .filter(c => c.status === 'Upcoming');
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

export function updateClassStatuses(forceNotify = false) {
    const now = new Date();
    let changed = false;
    const currentInProgressClass = getCurrentClass();

    getClasses().forEach(classItem => {
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
            const classToUpdate = classes.find(c => c.code === classItem.code);
            if (classToUpdate) {
                classToUpdate.status = newStatus;
                // Note: This only changes local state. A better implementation might update this in Firestore.
                // For now, we assume time-based status is sufficient.
                changed = true;
            }
        }
    });

    const newInProgressClass = getCurrentClass();
    if (newInProgressClass && newInProgressClass.code !== currentInProgressClass?.code) {
        resetAllStudentStatuses();
    }

    if (changed || forceNotify) {
        notifyListeners();
    }
}

// Set an interval to check class statuses periodically
setInterval(() => {
    updateClassStatuses();
}, 60000);
