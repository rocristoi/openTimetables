import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "hidden",
    authDomain: "hidden",
    projectId: "hidden",
    storageBucket: "hidden",
    messagingSenderId: "hidden",
    appId: "hidden",
    measurementId: "hidden"
  };

  
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  
