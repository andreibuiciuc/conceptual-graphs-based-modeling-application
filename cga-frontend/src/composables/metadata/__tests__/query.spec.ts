import { ClusteringOption, GraphMetadata } from "@/types/types";
import { describe, test, beforeEach, expect } from "vitest";
import constants from '@/constants/constants';
import { Concept, Command } from "@/types/types";
import { useQuery } from "../query";
import { createPinia, setActivePinia } from "pinia";
import { useConnectionStore } from "@/stores/connection";

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
    tableMetadata.dataTypes.set('code', { conceptName: 'text', conceptType: constants.conceptTypes.dataType });
    tableMetadata.dataTypes.set('country', { conceptName: 'text', conceptType: constants.conceptTypes.dataType });
    tableMetadata.dataTypes.set('city', { conceptName: 'text', conceptType: constants.conceptTypes.dataType });

    clusteringOption.clusteringColumn = 'country';
    clusteringOption.clusteringOrder = 'DESC';

    return { tableMetadata, clusteringOption };

}

describe('query composable utils tests', () => {
    
    let generateQueryCommandsFunction: any;
    let generateQueryStringFunction: any;
    let connectionStore: any;

    beforeEach(() => {
        setActivePinia(createPinia());
        
        connectionStore = useConnectionStore();
        connectionStore.currentKeyspace = 'weather';
        
        const { generateQueryAsCommands, generateQueryAsString } = useQuery();
        generateQueryCommandsFunction = generateQueryAsCommands;
        generateQueryStringFunction = generateQueryAsString;
    });
    
    test('generate create table query with composite primary key', () => {

        const { tableMetadata, clusteringOption } = initializeTableMetadata();
        
        const queryCommands: Command[] = generateQueryCommandsFunction(tableMetadata, clusteringOption);
        
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
        expect(queryCommands.at(5).lineContent).toBe('      >> )');

        expect(queryCommands.at(6).lineNumber).toBe(6);
        expect(queryCommands.at(6).lineContent).toBe('      >> WITH CLUSTERING ORDER BY (country DESC)');

        expect(queryCommands.at(7).lineNumber).toBe(7);
        expect(queryCommands.at(7).lineContent).toBe('      >> );');

        const queryString: string = generateQueryStringFunction(queryCommands);

        expect(queryString).toBe('CREATE TABLE IF NOT EXISTS weather.weather_stations (code TEXT,country TEXT,city TEXT,PRIMARY KEY (code, country))WITH CLUSTERING ORDER BY (country DESC));')
    });
});