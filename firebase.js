import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBR65QmnV-bm5aYEEKd8WVf3lg8sI95T1k",
    authDomain: "usermanager-e1d8c.firebaseapp.com",
    projectId: "usermanager-e1d8c",
    storageBucket: "usermanager-e1d8c.appspot.com",
    messagingSenderId: "599485221757",
    appId: "1:599485221757:web:c5bbdcbc30208d235a9a14",
    measurementId: "G-TB6CQXWY1M"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app); // Khởi tạo Firestore

// Export Firestore and other services
export { db, analytics };