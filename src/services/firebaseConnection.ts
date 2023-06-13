
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDu74_Dv01omw8Ux0aPm2p17RiFhXYNkPE",
  authDomain: "tarefas-plus-ec960.firebaseapp.com",
  projectId: "tarefas-plus-ec960",
  storageBucket: "tarefas-plus-ec960.appspot.com",
  messagingSenderId: "682092891590",
  appId: "1:682092891590:web:fd3ecc1156f839573376c7"
};

const firebaseApp = initializeApp(firebaseConfig);


const db = getFirestore(firebaseApp);
export { db };