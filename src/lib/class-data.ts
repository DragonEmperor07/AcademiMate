import { resetAllStudentStatuses } from "./student-data";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

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
    const timeParts = newClass.time.split(' - ');
    const formattedStartTime = formatTime(timeParts[0]);
    const formattedEndTime = formatTime(timeParts[1]);

    const classWithStatus: Class = { 
        ...newClass, 
        time: `${formattedStartTime} - ${formattedEndTime}`,
        status: "Upcoming" 
    };
    const classDocRef = doc(db, 'classes', newClass.code);
    await setDoc(classDocRef, classWithStatus);
    updateClassStatuses(true);
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


// Helper to format 24-hour time to AM/PM
function formatTime(time24: string): string {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12; // Convert 0 to 12
    const formattedMinutes = m < 10 ? `0${m}` : m;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}


export async function updateClassStatuses(forceNotify = false) {
    const now = new Date();
    let changed = false;
    const currentInProgressClassCode = getCurrentClass()?.code;
    const batch = writeBatch(db);
    let hasUpdates = false;

    const querySnapshot = await getDocs(classesCollection);

    querySnapshot.forEach(doc => {
        const classItem = doc.data() as Class;
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
            const classDocRef = doc.ref;
            batch.update(classDocRef, { status: newStatus });
            hasUpdates = true;
            changed = true;
        }
    });

    if (hasUpdates) {
        await batch.commit();
    }

    const newInProgressClass = classes.find(c => c.status === 'In Progress');

    if (newInProgressClass && newInProgressClass.code !== currentInProgressClassCode) {
        await resetAllStudentStatuses();
        changed = true;
    }

    if (changed || forceNotify) {
        notifyListeners();
    }
}


// Set an interval to check class statuses periodically
setInterval(() => {
    updateClassStatuses();
}, 15000); // Check every 15 seconds
