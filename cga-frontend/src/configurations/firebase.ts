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
  CONFIGURATION: 'configurations',
  TABLE_GRAPHS: 'table-graphs'
};

const FORCE_CONFIGURATIONS_DOC_ID = 'forceConfig';

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.firestore();
const usersCollection = database.collection(firebaseCollections.USERS);
const configurationsCollection = database.collection(firebaseCollections.CONFIGURATION);

export { 
  auth,
  database, 
  usersCollection, 
  configurationsCollection,
  FORCE_CONFIGURATIONS_DOC_ID
};
