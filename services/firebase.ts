// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; 
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCcouCwkYuPN-fQsvTzvQOP_0y2l-8-KBg",
  authDomain: "poii-b8465.firebaseapp.com",
  projectId: "poii-b8465",
  storageBucket: "poii-b8465.firebasestorage.app",
  messagingSenderId: "426483813416",
  appId: "1:426483813416:web:8080d013b78fd282ae391d",
  measurementId: "G-ZESF4WF55R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  

export const auth = getAuth(app);
export { app, analytics };
