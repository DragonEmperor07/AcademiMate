import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, arrayUnion, setDoc, writeBatch } from 'firebase/firestore';

export type Student = {
  name: string;
  id: string;
  password?: string;
  status: 'Present' | 'Absent';
  attendedClasses?: string[];
};

let students: Student[] = [];
let listeners: ((students: Student[]) => void)[] = [];

const studentsCollection = collection(db, 'students');

onSnapshot(studentsCollection, snapshot => {
  students = snapshot.docs.map(doc => doc.data() as Student);
  notifyListeners();
}, error => {
    console.error("Error fetching student snapshots: ", error);
});

function notifyListeners() {
  listeners.forEach(listener => listener(students));
}

export function subscribe(callback: (students: Student[]) => void) {
  listeners.push(callback);
  callback(students); // Immediately send current data
  return function unsubscribe() {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function getStudents() {
  return students;
}

export async function validateStudent(studentId: string, password_param: string) {
  const studentDocRef = doc(db, 'students', studentId);
  const studentSnap = await getDoc(studentDocRef);
  
  if (!studentSnap.exists()) {
    return false;
  }
  const student = studentSnap.data() as Student;
  return student.password === password_param;
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  try {
    const studentDocRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentDocRef);
    if (studentSnap.exists()) {
      return studentSnap.data() as Student;
    }
    return null;
  } catch (error) {
    console.error("Error fetching student by ID: ", error);
    return null;
  }
}

export async function updateStudentStatus(studentId: string, newStatus: 'Present' | 'Absent', classCode?: string) {
    try {
        const studentDocRef = doc(db, 'students', studentId);
        const updateData: any = { status: newStatus };
        if (newStatus === 'Present' && classCode) {
            updateData.attendedClasses = arrayUnion(classCode);
        }
        await updateDoc(studentDocRef, updateData);
    } catch (error) {
        console.error("Error updating student status: ", error);
    }
}

export async function addStudent(student: Student) {
    try {
        const studentDocRef = doc(db, 'students', student.id);
        await setDoc(studentDocRef, student);
    } catch(error) {
        console.error("Error adding student: ", error);
    }
}

export async function resetAllStudentStatuses() {
    console.log("Resetting all student statuses to 'Absent'...");
    const batch = writeBatch(db);
    students.forEach(student => {
        const studentDocRef = doc(db, 'students', student.id);
        batch.update(studentDocRef, { status: 'Absent' });
    });
    try {
        await batch.commit();
        console.log("All student statuses reset.");
    } catch (error) {
        console.error("Error resetting student statuses: ", error);
    }
}
