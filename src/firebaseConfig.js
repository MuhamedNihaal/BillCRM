import { initializeApp } from "firebase/app";
// import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAm9WMqdsiBUhbam2GxOTBYia_Zh8X1avA",
  authDomain: "asap-student-7b4b4.firebaseapp.com",
  projectId: "asap-student-7b4b4",
  storageBucket: "asap-student-7b4b4.appspot.com",
  messagingSenderId: "992253004464",
  appId: "1:992253004464:web:c1cb41008fd06f3c150975",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);

const messaging = () => {};

export { messaging, app };
// BDGBXYM5KlTgPokfiP8c9qehauRu8VHUk-OvvjgaNcCRy4k8rpS-3Pv70xYtG9kUwYExB7aJuqx5qkDrX7W4aG0
