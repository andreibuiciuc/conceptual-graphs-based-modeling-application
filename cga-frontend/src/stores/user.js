import { defineStore } from "pinia";
import { auth, usersCollection } from '@/includes/firebase';

export default defineStore("user", {
    state: () => ({
        isUserLoggedIn: false,
        userCredentials: null
    }),
    actions: {
        // Register the user by email and password using firebase sdk
        register: async function (registerCredentials) {
            // TODO: Handle the request
            const userCredentials = await auth.createUserWithEmailAndPassword(
                registerCredentials.email, registerCredentials.password
            );
            await usersCollection.doc(userCredentials.user.uid).set({
                firstname: registerCredentials.firstname,
                lastname: registerCredentials.lastname,
                email: registerCredentials.email
            });
            this.isUserLoggedIn = true;
        },
        // Sign in the user by email and password using firebase sdk
        login: async function (loginCredentials) {
            // TODO: Handle the request
            await auth.signInWithEmailAndPassword(loginCredentials.email, loginCredentials.password);
            const userDocumentRef = usersCollection.doc(auth.currentUser.uid);
            userDocumentRef.get().then((userDocument) => {
                if (userDocument.exists) {
                    this.userCredentials = { ... userDocument.data() };
                }
            });
            this.isUserLoggedIn = true;
        },
        // Logout the user using firebase sdk
        signOut: async function () {
            await auth.signOut();
            this.isUserLoggedIn = false;
        }
    }
});