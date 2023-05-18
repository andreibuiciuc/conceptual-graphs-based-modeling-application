import { defineStore } from "pinia";
import { auth, usersCollection } from '../includes/firebase';
import { Ref, ref } from "vue";
import { LoginCredentials, RegisterCredentials } from '@/types/auth/types';
import { useUtils } from '../composables/utils';

export const useUserStore = defineStore('user', () => {
    const isUserLoggedIn: Ref<boolean> = ref(false);
    const userCredentials: Ref<any | null> = ref(null);
    const isPasswordResetEmailSent: Ref<boolean> = ref(false);

    const { openNotificationToast } = useUtils();

    async function register (registerCredentials: RegisterCredentials): Promise<void> {
        userCredentials.value = await auth.createUserWithEmailAndPassword(registerCredentials.email, registerCredentials.password);
        await usersCollection.doc(userCredentials.value.user?.uid).set({
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

    async function resetPasswordViaEmail (email: string): Promise<void> {
        try {
            await auth.sendPasswordResetEmail(email);
        } catch (error: any) {
            throw(error);
        }
    };

    return {
        isUserLoggedIn,
        isPasswordResetEmailSent,
        register,
        login,
        signOut,
        resetPasswordViaEmail
    };
});