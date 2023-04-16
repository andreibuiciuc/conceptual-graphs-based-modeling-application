
import constants from "../constants/constants";
import { Concept, Command, GraphMetadata } from "../types/types";
import { ClusteringOption } from '../types/types';
import designToolboxConstants from "../components/design/designToolboxConstants";
import { useConnectionStore } from "../stores/connection";
import { useMetadata } from '../composables/metadata';

enum CassandraKeyType {
    PARTITION_KEY = "partition_key",
    CLUSTERING_KEY = "clustering"
};

export function useQuery() {

    // Composable responsible for generating CQL queries

    const connectionStore = useConnectionStore();
    const { getPartitionAndClusteringColumnsCount } = useMetadata();
    
    // Helper functions related to the generating of the CREATE TABLE CQL statement 

    const addCQLCommandLine = (commands: Command[], lineContent: string): void => {
        const lineNumber = commands.length;
        commands.push({ lineNumber, lineContent });
    };

    const computeCreateTableDefinitionLine = (tableMetadata: GraphMetadata, commands: Command[]): void => {

        /*
         * Computes the first line of the CREATE TABLE CQL statement
         */

        const currentTable: Concept | undefined = tableMetadata.tables.at(0);
        let createTableDefinitionLine: string;
        
        if (!currentTable) {
            createTableDefinitionLine = constants.inputValues.empty;
        } else {
            createTableDefinitionLine = designToolboxConstants.CQL_BASH_COMMAND
                    .concat(designToolboxConstants.CQL_CREATE_TABLE_SNIPPET)
                    .concat(`${connectionStore.currentKeyspace}.${currentTable.conceptName} (`);
        }

        addCQLCommandLine(commands, createTableDefinitionLine);
    };

    const computeColumnDefinitionLines = (tableMetadata: GraphMetadata, commands: Command[]): void => {
        
        /*
         * Computes the column definition lines of the CREATE TABLE CQL statement
         */

        const currentTable: Concept | undefined = tableMetadata.tables.at(0);
        if (!currentTable) {
            return ;
        }
        
        const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
        if (!currentColumns) {
            return ;
        }

        currentColumns.forEach((columnConcept: Concept) => {
            const dataTypeConcept: Concept | undefined = tableMetadata.dataTypes.get(columnConcept.conceptName);
            let columnDefinitionLine: string;
            
            if (!dataTypeConcept) {
                columnDefinitionLine = constants.inputValues.empty;
            } else {
                columnDefinitionLine = designToolboxConstants.CQL_BASH_BLANK_COMMAND
                    .concat(columnConcept.conceptName)
                    .concat(` ${dataTypeConcept.conceptName.toUpperCase()},`)
            }

            addCQLCommandLine(commands, columnDefinitionLine);
        });
        
    };

    const computePrimaryKeyDefinitionLine = (tableMetadata: GraphMetadata, commands: Command[]): void => { 
        
        /*
         * Computes the primary key definition line of the CREATE TABLE CQL statement
         */


        const currentTable: Concept | undefined = tableMetadata.tables.at(0);
        if (!currentTable) {
            return ;
        }

        const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
        if (!currentColumns) {
            return ;
        }
        
        let tableKeysDefinitionLine = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat('PRIMARY KEY (');
        let partitionColumnsSnippet: string = constants.inputValues.empty, clusteringColumnsSnippet: string = constants.inputValues.empty;

        const { partitionColumnsCount, clusteringColumnCount } = getPartitionAndClusteringColumnsCount(tableMetadata);

        if (partitionColumnsCount) {
            partitionColumnsSnippet = computeKeysSnippet(currentColumns, false);

            if (partitionColumnsCount == 1) {
                partitionColumnsSnippet = partitionColumnsSnippet.slice(1, partitionColumnsSnippet.length - 1);
            }
        } 

        if (clusteringColumnCount) {
            clusteringColumnsSnippet = computeKeysSnippet(currentColumns, true);

            if (clusteringColumnCount == 1) {
                clusteringColumnsSnippet = clusteringColumnsSnippet.slice(1, clusteringColumnsSnippet.length - 1);
            }
        }

        tableKeysDefinitionLine = tableKeysDefinitionLine.concat(partitionColumnsSnippet).concat(', ').concat(clusteringColumnsSnippet).concat(')');
        
        addCQLCommandLine(commands, tableKeysDefinitionLine);
    };

    const computeKeysSnippet = (currentColumns: Concept[], isClusteringColumnsSnippet: boolean): string => {

        let keySnippet: string = '(';

        currentColumns.forEach((columnConcept: Concept) => {
            if (isClusteringColumnsSnippet) {
                if (columnConcept.columnKind === CassandraKeyType.CLUSTERING_KEY) {
                    keySnippet = keySnippet.concat(columnConcept.conceptName).concat(', ');
                }
            } else {
                if (columnConcept.columnKind === CassandraKeyType.PARTITION_KEY) {
                    keySnippet = keySnippet.concat(columnConcept.conceptName).concat(', ');
                }
            }
        });

        return keySnippet.slice(0, keySnippet.length - 2).concat(')');
    };

    const computeClusteringOptionDefintionLines = (clusteringOption: ClusteringOption, commands: Command[]) => {
        addCQLCommandLine(commands, designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(')'));
        const clusteringOptionLine = `WITH CLUSTERING ORDER BY (${clusteringOption.clusteringColumn} ${clusteringOption.clusteringOrder})`;
        addCQLCommandLine(commands, designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(clusteringOptionLine));

    };

    const computeCQLEndingLine = (commands: Command[]) => {
        const cqlEndingLine = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(");");
        addCQLCommandLine(commands, cqlEndingLine);
    }

    // Wrapper functions related to the generating of the CREATE TABLE CQL statement
    const generateQueryAsCommands = (tableMetadata: GraphMetadata, clusteringOption: ClusteringOption): Command[] => {
        let commands: Command[] = [];
        
        computeCreateTableDefinitionLine(tableMetadata, commands);
        computeColumnDefinitionLines(tableMetadata, commands);
        computePrimaryKeyDefinitionLine(tableMetadata, commands);
        computeClusteringOptionDefintionLines(clusteringOption, commands);
        computeCQLEndingLine(commands);
        
        return commands;
    };

    const generateQueryAsString = (commands: Command[]) => {
        const queryFromCommands = commands.reduce((accumulator, currentValue) => accumulator.concat(currentValue.lineContent), constants.inputValues.empty);
        return queryFromCommands.replace(designToolboxConstants.CQL_COMMAND_REGEX, constants.inputValues.empty);
    }

    return {
        generateQueryAsCommands,
        generateQueryAsString
    };
}