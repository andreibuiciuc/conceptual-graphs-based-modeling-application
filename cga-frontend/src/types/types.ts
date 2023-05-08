
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
    OUT = 'out',
    GET = 'get'
};

enum ClusteringOrder {
    ASCENDING = 'ASC',
    DESCENDING = 'DESC'
};

type AggregateFunction = 'count' | 'min' | 'max' | 'avg' | 'sum';


type AggregateClause = {
    [_ in AggregateFunction]: {
        conceptReferent: string
        aggregatedColumns: Concept[]
    }
};


type SelectClause = {
    conceptReferent: string
    conceptRelation: string
    columns: Concept[]
};


interface QueryConcepts {
    [QueryClause.WHERE]: SelectClause
    [QueryClause.GROUP_BY]: SelectClause
    [QueryClause.ORDER_BY]: SelectClause
    [QueryClause.GET]: AggregateClause
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

type ClusteringOption = {
    clusteringColumn: string
    clusteringOrder: string
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
    conceptName: string
    conceptType: string,
};

interface D3Link {
    source: number,
    target: number
};

export {
    //
    QueryClause,
    Concept,
    ConfigurableConcept,
    ColumnMetadata,
    QueryConcepts,
    QueryItem,
    GraphMetadata,
    QueryItemColumnType,
    ClusteringOption,
    AggregateFunction,
    //
    Command,
    DataTableColumn,
    ToastSeverity,
    ToastPosition,
    D3Link,
    D3Node,
};