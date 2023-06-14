import { ClusteringOption, GraphMetadata, QueryConcepts, QueryItem } from "@/types/types";
import { describe, test, beforeEach, expect } from "vitest";
import constants from '@/constants/constants';
import { Concept, Command } from "@/types/types";
import { useQuery } from "../query";
import { createPinia, setActivePinia } from "pinia";
import { useConnectionStore } from "@/stores/connection";
import { useQueryStore } from "@/stores/query";

const defaultGraphMetadata: GraphMetadata = {
    keyspace: constants.defaultConcept,
    tables: [],
    columns: new Map<string, Concept[]>(),
    dataTypes: new Map<string, Concept>()
};

const defaultClusteringOption: ClusteringOption = {
    clusteringColumn: constants.inputValues.empty,
    clusteringOrder: 'ASC',
}

const initializeTableMetadata = (): { tableMetadata: GraphMetadata, clusteringOption: ClusteringOption } => {
    const tableMetadata: GraphMetadata = structuredClone(defaultGraphMetadata);
    const clusteringOption: ClusteringOption = structuredClone(defaultClusteringOption);

    tableMetadata.keyspace = { conceptName: 'weather', conceptType: constants.conceptTypes.keyspace, relation: constants.relationTypes.hasMore };
    tableMetadata.tables.push({ conceptName: 'weather_stations', conceptType: constants.conceptTypes.table });
    tableMetadata.columns.set('weather_stations', [
        {
            conceptName: 'code',
            conceptType: constants.conceptTypes.column,
            columnKind: 'partition_key',
            relation: constants.relationTypes.hasPartitionKey
        },
        {
            conceptName: 'country',
            conceptType: constants.conceptTypes.column,
            columnKind: constants.columnKinds.clustering,
            relation: constants.relationTypes.hasClusteringKeyDesc,
        },
        {
            conceptName: 'city',
            conceptType: constants.conceptTypes.column,
            columnKind: constants.columnKinds.regular,
            relation: constants.relationTypes.isOptional,
        }
    ]);
    tableMetadata.dataTypes.set('code', { conceptName: 'text', conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType });
    tableMetadata.dataTypes.set('country', { conceptName: 'text', conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType });
    tableMetadata.dataTypes.set('city', { conceptName: 'text', conceptType: constants.conceptTypes.dataType, relation: constants.relationTypes.hasType });

    clusteringOption.clusteringColumn = 'country';
    clusteringOption.clusteringOrder = 'DESC';

    return { tableMetadata, clusteringOption };

}

const initializeQueryMetadata = (tableMetadata: GraphMetadata, selectedColumnNames: string[]): GraphMetadata => {
    const queriedTable: Concept = tableMetadata.tables.at(0);
    const queryMetadata = structuredClone(defaultGraphMetadata);

    queryMetadata.keyspace = tableMetadata.keyspace;
    queryMetadata.tables.push(queriedTable);
    queryMetadata.columns.set(queriedTable.conceptName, []);

    selectedColumnNames.forEach((columnName: string) => {
        const columnConcept = tableMetadata.columns.get(queriedTable.conceptName).find(x => x.conceptName === columnName);
        queryMetadata.columns.get(queriedTable.conceptName).push(columnConcept)
    });

    return queryMetadata;
};

const initializeDataForQuery = (selectAllColumns: boolean = false) => {
    const { tableMetadata, clusteringOption } = initializeTableMetadata();

    tableMetadata.columns.get('weather_stations').push({
        conceptName: 'name',
        conceptType: constants.conceptTypes.column,
        columnKind: 'partition_key',
        relation: constants.relationTypes.hasPartitionKey
    });

    let selectedColumns: string[] = [];
    if (selectAllColumns) {
        selectedColumns = tableMetadata.columns.get(tableMetadata.tables.at(0).conceptName).map(x => x.conceptName);
    } else {
        selectedColumns = tableMetadata.columns.get(tableMetadata.tables.at(0).conceptName).filter(x => x.columnKind === 'partition_key').map(x => x.conceptName);
    }

    const queryMetadata: GraphMetadata = initializeQueryMetadata(tableMetadata, selectedColumns);
    const queryConcepts: QueryConcepts = structuredClone(constants.defaultQueryConcepts);

    return { tableMetadata, queryMetadata, queryConcepts };
}

describe('query composable utils tests', () => {
    
    let connectionStore: any;
    let queryStore: any;
    let queryFunctions: any;

    beforeEach(() => {
        setActivePinia(createPinia());
        
        connectionStore = useConnectionStore();
        queryStore = useQueryStore();
        connectionStore.currentKeyspace = 'weather';
        
        queryFunctions = useQuery();
    });

    test('create table query - simple primary key, no clustering order', () => {
        const {tableMetadata, clusteringOption } = initializeTableMetadata();

        const queryCommands: Command[] = queryFunctions.generateQueryAsCommands(tableMetadata, defaultClusteringOption);

        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> CREATE TABLE IF NOT EXISTS weather.weather_stations (');

        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> code TEXT,');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> country TEXT,');

        expect(queryCommands.at(3).lineNumber).toBe(3);
        expect(queryCommands.at(3).lineContent).toBe('      >> city TEXT,');

        expect(queryCommands.at(4).lineNumber).toBe(4);
        expect(queryCommands.at(4).lineContent).toBe('      >> PRIMARY KEY (code, country)');
        
        expect(queryCommands.at(5).lineNumber).toBe(5);
        expect(queryCommands.at(5).lineContent).toBe('      >> );');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);

        expect(queryString).toBe('CREATE TABLE IF NOT EXISTS weather.weather_stations (code TEXT, country TEXT, city TEXT, PRIMARY KEY (code, country));')
    });

    test('create table query - simple primary key, with clustering order', () => {
        const {tableMetadata, clusteringOption } = initializeTableMetadata();

        const queryCommands: Command[] = queryFunctions.generateQueryAsCommands(tableMetadata, clusteringOption);

        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> CREATE TABLE IF NOT EXISTS weather.weather_stations (');

        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> code TEXT,');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> country TEXT,');

        expect(queryCommands.at(3).lineNumber).toBe(3);
        expect(queryCommands.at(3).lineContent).toBe('      >> city TEXT,');

        expect(queryCommands.at(4).lineNumber).toBe(4);
        expect(queryCommands.at(4).lineContent).toBe('      >> PRIMARY KEY (code, country)');

        expect(queryCommands.at(5).lineNumber).toBe(5);
        expect(queryCommands.at(5).lineContent).toBe('      >> )')

        expect(queryCommands.at(6).lineNumber).toBe(6);
        expect(queryCommands.at(6).lineContent).toBe('      >> WITH CLUSTERING ORDER BY (country DESC)');

        expect(queryCommands.at(7).lineNumber).toBe(7);
        expect(queryCommands.at(7).lineContent).toBe('      >> );');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);

        expect(queryString).toBe('CREATE TABLE IF NOT EXISTS weather.weather_stations (code TEXT, country TEXT, city TEXT, PRIMARY KEY (code, country)) WITH CLUSTERING ORDER BY (country DESC));')
    });
    
    test('create table query - composite primary key, with more partition keys', () => {

        const { tableMetadata, clusteringOption } = initializeTableMetadata();
        tableMetadata.columns.get('weather_stations').push({
            conceptName: 'name',
            conceptType: constants.conceptTypes.column,
            columnKind: 'partition_key',
            relation: constants.relationTypes.hasPartitionKey
        });
        tableMetadata.dataTypes.set('name', {
            conceptName: 'text',
            conceptType: constants.conceptTypes.dataType,
            relation: constants.relationTypes.hasType
        });
        
        const queryCommands: Command[] = queryFunctions.generateQueryAsCommands(tableMetadata, defaultClusteringOption);
        
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> CREATE TABLE IF NOT EXISTS weather.weather_stations (');

        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> code TEXT,');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> country TEXT,');

        expect(queryCommands.at(3).lineNumber).toBe(3);
        expect(queryCommands.at(3).lineContent).toBe('      >> city TEXT,');

        expect(queryCommands.at(4).lineNumber).toBe(4);
        expect(queryCommands.at(4).lineContent).toBe('      >> name TEXT,');

        expect(queryCommands.at(5).lineNumber).toBe(5);
        expect(queryCommands.at(5).lineContent).toBe('      >> PRIMARY KEY ((code, name), country)');

        expect(queryCommands.at(6).lineNumber).toBe(6);
        expect(queryCommands.at(6).lineContent).toBe('      >> );');
        
        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);

        expect(queryString).toBe('CREATE TABLE IF NOT EXISTS weather.weather_stations (code TEXT, country TEXT, city TEXT, name TEXT, PRIMARY KEY ((code, name), country));')
    });

    test('create table query - composite primary key, with more clustering keys', () => {

        const { tableMetadata, clusteringOption } = initializeTableMetadata();
        tableMetadata.columns.get('weather_stations').push({
            conceptName: 'name',
            conceptType: constants.conceptTypes.column,
            columnKind: 'partition_key',
            relation: constants.relationTypes.hasPartitionKey
        });
        tableMetadata.dataTypes.set('name', {
            conceptName: 'text',
            conceptType: constants.conceptTypes.dataType,
            relation: constants.relationTypes.hasType
        });

        const index = tableMetadata.columns.get('weather_stations').findIndex(x => x.conceptName === 'city');
        tableMetadata.columns.get('weather_stations')[index].columnKind = constants.columnKinds.clustering;

        const queryCommands: Command[] = queryFunctions.generateQueryAsCommands(tableMetadata, defaultClusteringOption);
        
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> CREATE TABLE IF NOT EXISTS weather.weather_stations (');

        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> code TEXT,');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> country TEXT,');

        expect(queryCommands.at(3).lineNumber).toBe(3);
        expect(queryCommands.at(3).lineContent).toBe('      >> city TEXT,');

        expect(queryCommands.at(4).lineNumber).toBe(4);
        expect(queryCommands.at(4).lineContent).toBe('      >> name TEXT,');

        expect(queryCommands.at(5).lineNumber).toBe(5);
        expect(queryCommands.at(5).lineContent).toBe('      >> PRIMARY KEY ((code, name), (country, city))');

        expect(queryCommands.at(6).lineNumber).toBe(6);
        expect(queryCommands.at(6).lineContent).toBe('      >> );');
        
        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);

        expect(queryString).toBe('CREATE TABLE IF NOT EXISTS weather.weather_stations (code TEXT, country TEXT, city TEXT, name TEXT, PRIMARY KEY ((code, name), (country, city)));')
    });

    test('select query - simple select of all columns', () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery(true);
        
        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT * FROM weather.weather_stations');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);
        expect(queryString).toBe('SELECT * FROM weather.weather_stations');
    });

    test('select query - simple select of only partition keys', () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery();

        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT code, name FROM weather.weather_stations');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);
        expect(queryString).toBe('SELECT code, name FROM weather.weather_stations');
    });

    test('select query - select with where clause', () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery();

        const whereClauseItems: QueryItem[] = [];
        whereClauseItems.push(
            {
                column: 'code',
                relation: '=',
                value: '001',
                toQuery: true,
                type: 'string'
            },
            {
                column: 'name',
                relation: '=',
                value: 'TEST',
                toQuery: true,
                type: 'string'
            }
        );
        queryStore.whereClauseItems = JSON.parse(JSON.stringify(whereClauseItems));
        
        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT code, name FROM weather.weather_stations');
        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> WHERE code = \'001\' AND name = \'TEST\'');
        
        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);
        expect(queryString).toBe('SELECT code, name FROM weather.weather_stations WHERE code = \'001\' AND name = \'TEST\'');
    });

    test('select query - select with where and order by clauses',  () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery();

        queryMetadata.columns.get(queryMetadata.tables.at(0).conceptName).push({
            conceptName: 'country',
            conceptType: constants.conceptTypes.column,
            columnKind: constants.columnKinds.clustering
        });

        const whereClauseItems: QueryItem[] = [];
        whereClauseItems.push(
            {
                column: 'code',
                relation: '=',
                value: '001',
                toQuery: true,
                type: 'string'
            },
            {
                column: 'name',
                relation: '=',
                value: 'TEST',
                toQuery: true,
                type: 'string'
            }
        );
        queryStore.whereClauseItems = JSON.parse(JSON.stringify(whereClauseItems));

        const orderByClauseItems: QueryItem[] = [];
        orderByClauseItems.push({
            column: 'country',
            valueSelect: 'desc',
            toQuery: true,
        });
        queryStore.orderByClauseItems = JSON.parse(JSON.stringify(orderByClauseItems));
        
        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT code, name, country FROM weather.weather_stations');
        
        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> WHERE code = \'001\' AND name = \'TEST\'');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> ORDER BY country DESC');
    });

    test('select query - select with where, group by clause and order by clauses',  () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery();

        queryMetadata.columns.get(queryMetadata.tables.at(0).conceptName).push({
            conceptName: 'country',
            conceptType: constants.conceptTypes.column,
            columnKind: constants.columnKinds.clustering
        });

        const whereClauseItems: QueryItem[] = [];
        whereClauseItems.push(
            {
                column: 'code',
                relation: '=',
                value: '001',
                toQuery: true,
                type: 'string'
            },
            {
                column: 'name',
                relation: '=',
                value: 'TEST',
                toQuery: true,
                type: 'string'
            }
        );
        queryStore.whereClauseItems = JSON.parse(JSON.stringify(whereClauseItems));

        const groupByClauseItems: QueryItem[] = [];
        groupByClauseItems.push({
            column: 'name',
            toQuery: true,
        });
        queryStore.groupByClauseItems = JSON.parse(JSON.stringify(groupByClauseItems));

        const orderByClauseItems: QueryItem[] = [];
        orderByClauseItems.push({
            column: 'country',
            valueSelect: 'desc',
            toQuery: true,
        });
        queryStore.orderByClauseItems = JSON.parse(JSON.stringify(orderByClauseItems));
        
        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT code, name, country FROM weather.weather_stations');
        
        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> WHERE code = \'001\' AND name = \'TEST\'');

        expect(queryCommands.at(2).lineNumber).toBe(2);
        expect(queryCommands.at(2).lineContent).toBe('      >> GROUP BY name');

        expect(queryCommands.at(3).lineNumber).toBe(3);
        expect(queryCommands.at(3).lineContent).toBe('      >> ORDER BY country DESC');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);
        expect(queryString).toBe('SELECT code, name, country FROM weather.weather_stations WHERE code = \'001\' AND name = \'TEST\' GROUP BY name ORDER BY country DESC');
    });

    test('select query - select with group by and aggregation function', () => {
        const { tableMetadata, queryMetadata, queryConcepts } = initializeDataForQuery();

        queryMetadata.columns.get(queryMetadata.tables.at(0).conceptName).push({
            conceptName: 'country',
            conceptType: constants.conceptTypes.column,
            columnKind: constants.columnKinds.clustering
        });

        const groupByClauseItems: QueryItem[] = [];
        groupByClauseItems.push({
            column: 'country',
            toQuery: true,
        });
        queryStore.groupByClauseItems = JSON.parse(JSON.stringify(groupByClauseItems));

        const aggregateFunctionsItems: QueryItem[] = [];
        aggregateFunctionsItems.push({
            column: 'all',
            valueSelect: 'count',
            toQuery: true
        });
        queryStore.aggregateFunctionsItems = JSON.parse(JSON.stringify(aggregateFunctionsItems));


        const queryCommands: Command[] = queryFunctions.generateSelectQueryAsCommands(tableMetadata, queryMetadata, queryConcepts);
        expect(queryCommands.at(0).lineNumber).toBe(0);
        expect(queryCommands.at(0).lineContent).toBe('cqlsh >> SELECT code, name, country, COUNT(*) FROM weather.weather_stations');
        expect(queryCommands.at(1).lineNumber).toBe(1);
        expect(queryCommands.at(1).lineContent).toBe('      >> GROUP BY country');

        const queryString: string = queryFunctions.generateQueryAsString(queryCommands);
        expect(queryString).toBe('SELECT code, name, country, COUNT(*) FROM weather.weather_stations GROUP BY country');
    });
});