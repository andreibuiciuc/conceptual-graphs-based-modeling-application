import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyByUnJWH5SwOpq_fZKAx1bUR2C6qeFiFZA",
    authDomain: "cassandra-cga.firebaseapp.com",
    projectId: "cassandra-cga",
    storageBucket: "cassandra-cga.appspot.com",
    messagingSenderId: "931674576947",
    appId: "1:931674576947:web:59aa32b8fc3e0436926b46"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.firestore();
const usersCollection = database.collection('users');

export {
    auth,
    database,
    usersCollection,
};