import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export { db };
