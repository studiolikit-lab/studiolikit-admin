import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_AUTH_DOMAIN",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_STORAGE_BUCKET",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
  apiKey: "AIzaSyCcpy7zfVazSqBOKAHaEexfnpL4FGZiqKE",
  authDomain: "studiolikit-fa602.firebaseapp.com",
  projectId: "studiolikit-fa602",
  storageBucket: "studiolikit-fa602.firebasestorage.app",
  messagingSenderId: "560624580288",
  appId: "1:560624580288:web:0a6686ac8e8242c13c5f25",
  measurementId: "G-RE6ENF6FNJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
