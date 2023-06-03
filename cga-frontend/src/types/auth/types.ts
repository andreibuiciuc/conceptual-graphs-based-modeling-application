interface LoginCredentials {
    readonly email: string
    password: string
};

interface RegisterCredentials extends LoginCredentials {
    firstname: string
    lastname: string
};

interface PasswordResetCredentials {
    email: string
}

export {
    LoginCredentials,
    RegisterCredentials,
    PasswordResetCredentials,
};