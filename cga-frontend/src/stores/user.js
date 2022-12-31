import { defineStore } from "pinia";
import { auth, usersCollection } from '@/includes/firebase';


export default defineStore("user", {
    state: () => ({
        isUserLoggedIn: false
    }),
    actions: {
        // Register the user by email and password using firebase sdk
        register: async function (registerCredentials) {
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
        // Login the user
        login: async function (loginCredentials) {

        }
    }
});