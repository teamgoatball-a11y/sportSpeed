import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBpTnqmHPSHVOjoKRG--ltWtKyyUdifRGE",
    authDomain: "sportslive-bb868.firebaseapp.com",
    projectId: "sportslive-bb868",
    storageBucket: "sportslive-bb868.firebasestorage.app",
    messagingSenderId: "324346474525",
    appId: "1:324346474525:web:9cd01f6ab5cc259eb816f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log("Fetching settings/general from Firestore...");
    try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("SUCCESS:", JSON.stringify(docSnap.data(), null, 2));
        } else {
            console.log("Document does not exist");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
