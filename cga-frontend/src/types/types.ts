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

interface ConfigurableConcept extends Concept {
    isTableExpanded?: boolean
};

interface GraphMetadata {
    keyspace: Concept
    tables: ConfigurableConcept[]
    columns: Map<string, ConfigurableConcept[]>
    dataTypes: Map<string, ConfigurableConcept>
};

interface ColumnMetadata {
    column_name: string
    column_kind: string
    column_type: string
    clustering_order: string
};

enum QueryClause {
    WHERE = 'where',
    ORDER_BY = 'orderBy',
    GROUP_BY = 'groupBy',
};

interface QueryConcepts {
    [QueryClause.WHERE]: {
        conceptReferent: string
        conceptRelation: string
        columns: Concept[]
    }
};

interface QueryItem {
    column: string
    availableColumns?: Concept[]
    operators?: string[],
    relation?: string
    type?: QueryItemColumnType,
    value?: string 
    valueSelect?: string,
    currentChipValue?: string,
    chipValues?: any,
    tooltip?: string
    toQuery?: boolean
    // Validation
    isValueValid?: boolean
    valueErrorMessage?: string
};

// Utility types
interface Command {
    lineContent: string
    lineNumber: number
};

type ToastSeverity = 'success' | 'warn' | 'error' | 'info';
type ToastPosition = 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

type QueryItemColumnType = 'boolean' | 'float' | 'integer' | 'null' | 'other' | 'string';

interface DataTableColumn {
    field: string,
    header: string
};

interface D3Node {
    id: string,
    type: string,
};

interface D3Link {
    source: string,
    target: string
};

export {
    LoginCredentials,
    RegisterCredentials,
    //
    QueryClause,
    Concept,
    ConfigurableConcept,
    ColumnMetadata,
    QueryConcepts,
    QueryItem,
    GraphMetadata,
    QueryItemColumnType,
    //
    Command,
    DataTableColumn,
    ToastSeverity,
    ToastPosition,
    D3Link,
    D3Node,
};