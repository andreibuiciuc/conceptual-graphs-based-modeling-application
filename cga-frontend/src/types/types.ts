// Authentication types
interface LoginCredentials {
    email: string,
    password: string
};

interface RegisterCredentials extends LoginCredentials {
    firstname: string,
    lastname: string,
};

// Conceptual Graphs types
interface Concept {
    conceptName: string,
    conceptType: string
};

// Utility types
interface Command {
    lineContent: string,
    lineNumber: number
};

export {
    LoginCredentials,
    RegisterCredentials,
    Concept,
    Command
};