import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB-tSQq71CKhIaj9c7G1TvOxGPkFHUgWJE",
    authDomain: "studio-767749027-15eff.firebaseapp.com",
    projectId: "studio-767749027-15eff",
    storageBucket: "studio-767749027-15eff.appspot.com",
    messagingSenderId: "105808288109",
    appId: "1:105808288109:web:b5244088f1ed66409ce264",
    measurementId: ""
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);


const initialStudents = [
  { name: 'Alice', id: 'S001', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Bob', id: 'S002', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Charlie', id: 'S003', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Diana', id: 'S004', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Ethan', id: 'S005', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Fiona', id: 'S006', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'George', id: 'S007', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Hannah', id: 'S008', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Ian', id: 'S009', password: 'password', status: 'Absent', attendedClasses: [] },
  { name: 'Jane Doe', id: 'S010', password: 'password', status: 'Absent', attendedClasses: [] },
];

const initialClasses = [
    { time: '09:00 AM - 10:00 AM', subject: 'Calculus I', code: 'MATH101', room: 'A101', instructor: 'Dr. Smith' },
    { time: '10:30 AM - 11:30 AM', subject: 'Introduction to Physics', code: 'PHY101', room: 'B203', instructor: 'Dr. Jones' },
    { time: '01:00 PM - 02:00 PM', subject: 'Creative Writing', code: 'ENG220', room: 'C305', instructor: 'Prof. Williams' },
    { time: '02:30 PM - 03:30 PM', subject: 'Data Structures', code: 'CS301', room: 'D102', instructor: 'Dr. Brown' },
];

async function seedInitialData() {
    try {
        const studentsCollection = collection(db, 'students');
        const classesCollection = collection(db, 'classes');

        // Check if students are already seeded
        const studentSnapshot = await getDocs(studentsCollection);
        if (studentSnapshot.empty) {
            console.log("Seeding initial student data...");
            const studentBatch = writeBatch(db);
            initialStudents.forEach(s => {
                const docRef = doc(studentsCollection, s.id);
                studentBatch.set(docRef, s);
            });
            await studentBatch.commit();
            console.log("Student data seeded.");
        }

        // Check if classes are already seeded
        const classSnapshot = await getDocs(classesCollection);
        if (classSnapshot.empty) {
            console.log("Seeding initial class data...");
            const classBatch = writeBatch(db);
            initialClasses.forEach(c => {
                const docRef = doc(classesCollection, c.code);
                classBatch.set(docRef, c);
            });
            await classBatch.commit();
            console.log("Class data seeded.");
        }
    } catch (error) {
        console.error("Error seeding data: ", error);
    }
}

// Seed data on initial load
seedInitialData();


export { db };
