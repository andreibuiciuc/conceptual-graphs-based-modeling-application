import { defineStore } from "pinia";
import { auth, usersCollection } from '../includes/firebase';
import { Ref, ref } from "vue";
import { LoginCredentials, RegisterCredentials } from "../types/types";
import { useUtils } from '../composables/utils';

export const useUserStore = defineStore('user', () => {
    const isUserLoggedIn: Ref<boolean> = ref(false);
    const userCredentials: Ref<any | null> = ref(null);

    const { openNotificationToast } = useUtils();

    async function register (registerCredentials: RegisterCredentials): Promise<void> {
        const userCredentials = await auth.createUserWithEmailAndPassword(registerCredentials.email, registerCredentials.password);
        await usersCollection.doc(userCredentials.user?.uid).set({
            firstname: registerCredentials.firstname,
            lastname: registerCredentials.lastname,
            email: registerCredentials.email
        });
        isUserLoggedIn.value = true;
    }

    async function login (loginCredentials: LoginCredentials): Promise<void> {
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

    async function signOut (): Promise<void> {
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