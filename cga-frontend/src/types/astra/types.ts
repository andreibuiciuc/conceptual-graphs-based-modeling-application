type AstraClusteringOrder = 'ASC' | 'DESC';

interface AstraApiResponse {
    data?: any
    code?: number
    description: string
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
    columns: string
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

export {
    AstraApiResponse,
    AstraTableMetadata,
    AstraColumnDefinition,
};