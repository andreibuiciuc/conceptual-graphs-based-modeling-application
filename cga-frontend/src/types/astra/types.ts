type AstraClusteringOrder = 'ASC' | 'DESC';
type AstraOperator = 'eq' | 'notEq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';

interface AstraApiResponse {
    data?: AstraTableMetadata | any
    code?: number
    description: string
}

interface AstraApiQueryResponse {
    count: number,
    rows: any[]
}

interface AstraColumnDefinition {
    name: string
    static: boolean
    typeDefinition: string
}

interface AstraPrimaryKey {
    clusteringKey: string[]
    partitionKey: string[]
}

interface AstraClusteringExpression {
    order: AstraClusteringOrder
    columns: string[]
}

interface AstraTableOptions {
    clusteringExpression: AstraClusteringExpression[]
    defaultTimeToLive: number
}

interface AstraTableMetadata {
    name: string
    keyspace: string
    columnDefinitions: AstraColumnDefinition[]
    primaryKey: AstraPrimaryKey
    tableOptions: AstraTableOptions
}

interface AstraQueryFilter {
    columnName: string,
    operator: AstraOperator,
    value: any[]
}

interface AstraQueryOrderByOption {
    column: string
}

interface AstraQueryPayload {
    columnNames: string[],
    filters: AstraQueryFilter[],
    orderBy?: AstraQueryOrderByOption
}

export {
    AstraApiResponse,
    AstraApiQueryResponse,
    AstraClusteringOrder,
    AstraColumnDefinition,
    AstraOperator,
    AstraTableMetadata,
    AstraQueryFilter,
    AstraQueryPayload
};