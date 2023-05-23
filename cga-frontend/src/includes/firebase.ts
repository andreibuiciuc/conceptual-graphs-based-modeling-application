import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseCollections = {
  USERS: 'users',
  CONCEPTUAL_GRAPHS: 'conceptual-graphs',
  TABLE_GRAPHS: 'table-graphs'
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.firestore();
const usersCollection = database.collection(firebaseCollections.USERS);
const conceptualGraphsCollection = database.collection(firebaseCollections.CONCEPTUAL_GRAPHS);
const tableGraphsCollection = database.collection(firebaseCollections.TABLE_GRAPHS);

export { 
  auth,
  database, 
  usersCollection, 
  conceptualGraphsCollection, 
  tableGraphsCollection 
};
