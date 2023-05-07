interface LoginCredentials {
    readonly email: string
    password: string
};

interface RegisterCredentials extends LoginCredentials {
    firstname: string
    lastname: string
};

export {
    LoginCredentials,
    RegisterCredentials
};