import { defineStore } from "pinia";
import { auth, usersCollection } from '../includes/firebase';
import { Ref, ref } from "vue";
import { LoginCredentials, RegisterCredentials } from "../types/types";
import { useUtils } from '../composables/utils';

export const useUserStore = defineStore('user', () => {
    const isUserLoggedIn: Ref<boolean> = ref(false);
    const userCredentials: Ref<any | null> = ref(null);

    const { openNotificationToast } = useUtils();

    async function register (registerCredentials: RegisterCredentials) {
        const userCredentials = await auth.createUserWithEmailAndPassword(registerCredentials.email, registerCredentials.password);
        await usersCollection.doc(userCredentials.user?.uid).set({
            firstname: registerCredentials.firstname,
            lastname: registerCredentials.lastname,
            email: registerCredentials.email
        });
        isUserLoggedIn.value = true;
    }

    async function login (loginCredentials: LoginCredentials) {
        await auth.signInWithEmailAndPassword(loginCredentials.email, loginCredentials.password);
        const userDocumentReference = usersCollection.doc(auth.currentUser?.uid);
        const userDocument = await userDocumentReference.get();
        if (userDocument.exists) {
            userCredentials.value = { ... userDocument.data() };
            isUserLoggedIn.value = true;
        } else {
            openNotificationToast('unexpected error occured', 'error');
        }
    }

    async function signOut () {
        await auth.signOut();
        isUserLoggedIn.value = false;
    }

    return {
        isUserLoggedIn,
        register,
        login,
        signOut
    };
});

// export default defineStore("user", {
//   state: () => ({
//     isUserLoggedIn: false,
//     userCredentials: null,
//   }),
//   actions: {
//     // Register the user by email and password using firebase sdk
//     register: async function (registerCredentials) {
//       const userCredentials = await auth.createUserWithEmailAndPassword(
//         registerCredentials.email,
//         registerCredentials.password
//       );
//       await usersCollection.doc(userCredentials.user.uid).set({
//         firstname: registerCredentials.firstname,
//         lastname: registerCredentials.lastname,
//         email: registerCredentials.email,
//       });
//       this.isUserLoggedIn = true;
//     },
//     // Sign in the user by email and password using firebase sdk
//     login: async function (loginCredentials) {
//       await auth.signInWithEmailAndPassword(
//         loginCredentials.email,
//         loginCredentials.password
//       );
//       const userDocumentRef = usersCollection.doc(auth.currentUser.uid);
//       userDocumentRef.get().then((userDocument) => {
//         if (userDocument.exists) {
//           this.userCredentials = { ...userDocument.data() };
//         }
//       });
//       this.isUserLoggedIn = true;
//     },
//     // Logout the user using firebase sdk
//     signOut: async function () {
//       await auth.signOut();
//       this.isUserLoggedIn = false;
//     },
//   },
// });
