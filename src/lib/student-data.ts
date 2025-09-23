import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc, arrayUnion, setDoc } from 'firebase/firestore';

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
  const studentDocRef = doc(db, 'students', studentId);
  const studentSnap = await getDoc(studentDocRef);
  if (studentSnap.exists()) {
    return studentSnap.data() as Student;
  }
  return null;
}

export async function updateStudentStatus(studentId: string, newStatus: 'Present' | 'Absent', classCode?: string) {
  const studentDocRef = doc(db, 'students', studentId);
  const updateData: any = { status: newStatus };
  if (newStatus === 'Present' && classCode) {
    updateData.attendedClasses = arrayUnion(classCode);
  }
  await updateDoc(studentDocRef, updateData);
}

export async function addStudent(student: Student) {
    const studentDocRef = doc(db, 'students', student.id);
    await setDoc(studentDocRef, student);
}

export async function resetAllStudentStatuses() {
    const studentPromises = students.map(student => {
        const studentDocRef = doc(db, 'students', student.id);
        return updateDoc(studentDocRef, { status: 'Absent' });
    });
    await Promise.all(studentPromises);
}
