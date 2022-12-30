import { defineStore } from "pinia";
import { auth, usersCollection } from '@/includes/firebase';


export default defineStore("user", {
    state: () => ({
        isUserLoggedIn: false
    }),
    actions: {
        register: async function (registerCredentials) {
            await auth.createUserWithEmailAndPassword(
                registerCredentials.email, registerCredentials.password
            );

            await usersCollection.add({
                firstname: registerCredentials.firstname,
                lastname: registerCredentials.lastname,
                email: registerCredentials.email
            });

            this.isUserLoggedIn = true;
        }
    }
});