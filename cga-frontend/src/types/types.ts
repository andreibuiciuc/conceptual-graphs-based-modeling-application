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
    relation?: string
};

enum QueryClause {
    WHERE = "where",
    ORDER_BY = "orderBy",
    GROUP_BY = "groupBy"
};

interface QueryConcepts {
    [QueryClause.WHERE]: {
        conceptReferent: string,
        conceptRelation: string,
        columns: Concept[]
    }
};

interface QueryItem {
    column: string,
    relation?: string,
    value?: string 
    toQuery?: boolean
};

// Utility types
interface Command {
    lineContent: string,
    lineNumber: number
};

export {
    LoginCredentials,
    RegisterCredentials,
    //
    QueryClause,
    Concept,
    QueryConcepts,
    QueryItem,
    //
    Command
};