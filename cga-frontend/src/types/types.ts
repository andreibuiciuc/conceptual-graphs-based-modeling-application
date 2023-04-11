// Authentication types
interface LoginCredentials {
    email: string
    password: string
};

interface RegisterCredentials extends LoginCredentials {
    firstname: string
    lastname: string
};

// Conceptual Graphs types
interface Concept {
    conceptName: string
    conceptType: string
    relation?: string
    columnKind?: string
};

interface GraphMetadata {
    keyspace: Concept
    tables: Concept[]
    columns: Map<string, Concept[]>
    dataTypes: Map<string, Concept>
};

interface ColumnMetadata {
    column_name: string
    column_kind: string
    column_type: string
    clustering_order: string
};

enum QueryClause {
    WHERE = "where",
    ORDER_BY = "orderBy",
    GROUP_BY = "groupBy",
};

interface QueryConcepts {
    [QueryClause.WHERE]: {
        conceptReferent: string
        conceptRelation: string
        columns: Concept[]
    }
};

interface QueryItem {
    // Configuration
    column: string
    relation?: string
    value?: string 
    valueSelect?: string,
    tooltip?: string
    toQuery?: boolean
    operators?: string[],
    currentChipValue?: string,
    chipValues?: any,
    // Validation
    isColumnValid?: boolean,
    isOperatorValid?: boolean,
    isValueValid?: boolean
};

// Utility types
interface Command {
    lineContent: string
    lineNumber: number
};

export {
    LoginCredentials,
    RegisterCredentials,
    //
    QueryClause,
    Concept,
    ColumnMetadata,
    QueryConcepts,
    QueryItem,
    GraphMetadata,
    //
    Command
};