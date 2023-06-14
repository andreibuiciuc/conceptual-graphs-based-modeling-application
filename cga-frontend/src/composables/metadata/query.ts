
import constants from "../../constants/constants";
import { Concept, Command, GraphMetadata, QueryItem, QueryConcepts } from "../../types/types";
import { ClusteringOption } from '../../types/types';
import designToolboxConstants from "../../components/design/designToolboxConstants";
import { useConnectionStore } from "../../stores/connection";
import { useQueryStore } from "../../stores/query";
import { useMetadata } from './metadata';

enum CassandraKeyType {
    PARTITION_KEY = "partition_key",
    CLUSTERING_KEY = "clustering"
};

export function useQuery() {

    // Composable responsible for generating CQL queries

    const connectionStore = useConnectionStore();
    const queryStore = useQueryStore();

    const { getPartitionAndClusteringColumnsCount } = useMetadata();


    /**
     * Creates and adds a command to the commands array
     * @param commands result array of commands
     * @param lineContent the content of the current command
     */
    const addCQLCommandLine = (commands: Command[], lineContent: string, isColumnDefinition: boolean = false, isSelectClauseLine: boolean = false): void => {
        const lineNumber = commands.length;
        commands.push({ lineNumber, lineContent, isColumnDefinition, isSelectClauseLine });
    };


    /**
     * Computes the first line of the CREATE TABLE CQL statement as a Command and adds it to the commands array
     * @param tableMetadata metadata of the table conceptual graph
     * @param commands result array of commands
     */
    const computeCreateTableDefinitionLine = (tableMetadata: GraphMetadata, commands: Command[]): void => {
   
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


    /**
     * Computes the column definition lines of the CREATE TABLE CQL statement as Commands and adds them to the commands array
     * @param tableMetadata metadata of the table conceptual graph
     * @param commands result array of commands
     */
    const computeColumnDefinitionLines = (tableMetadata: GraphMetadata, commands: Command[]): void => {

        const currentTable: Concept | undefined = tableMetadata.tables.at(0);
        if (!currentTable) {
            return ;
        }
        
        const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
        if (!currentColumns) {
            return ;
        }

        // Apply space after each column declaration, except for the first column.
        let applySpaceAfterColumnDefinition = false;

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

            addCQLCommandLine(commands, columnDefinitionLine, applySpaceAfterColumnDefinition);

            applySpaceAfterColumnDefinition = true;
        });
        
    };


    /**
     * Computes the primary key definition line of the CREATE TABLE CQL statement as a Command and adds it to the commands array
     * @param tableMetadata metadata of the table conceptual graph
     * @param commands result array of commands
     */
    const computePrimaryKeyDefinitionLine = (tableMetadata: GraphMetadata, commands: Command[]): void => { 
        
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

            tableKeysDefinitionLine = tableKeysDefinitionLine.concat(partitionColumnsSnippet).concat(', ').concat(clusteringColumnsSnippet).concat(')');

        } else {
            partitionColumnsSnippet = partitionColumnsSnippet.slice(1, partitionColumnsSnippet.length - 1);
            tableKeysDefinitionLine = tableKeysDefinitionLine.concat(partitionColumnsSnippet).concat(')');
        }   
        

        addCQLCommandLine(commands, tableKeysDefinitionLine, true);
    };


    /**
     * Helper function that computes the partition / clustering columns snippet of the primary key definition line of the CREATE TABLE CQL statement
     * @param currentColumns column concepts of the table concepual graph
     * @param isClusteringColumnsSnippet flag for determining which primary key snippet to compute
     * @returns the partition / clustering columns snippet of the primary key
     */
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


    /**
     * Computes the clustering option definition lines of the CREATE TABLE CQL statement as Commands and adds them to the commands array
     * @param clusteringOption option regarding the clustering index
     * @param commands result array of commands
     */
    const computeClusteringOptionDefintionLines = (clusteringOption: ClusteringOption, commands: Command[]) => {
        if (clusteringOption.clusteringColumn && clusteringOption.clusteringOrder) {
            addCQLCommandLine(commands, designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(')'));
            const clusteringOptionLine = `WITH CLUSTERING ORDER BY (${clusteringOption.clusteringColumn} ${clusteringOption.clusteringOrder})`;
            addCQLCommandLine(commands, designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(clusteringOptionLine), true);
        }
    };

    
    /**
     * Computes the ending line of the CREATE TABLE CQL statement and adds it to the commands array
     * @param commands result array of commands
     */
    const computeCQLEndingLine = (commands: Command[]) => {
        const cqlEndingLine = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(");");
        addCQLCommandLine(commands, cqlEndingLine);
    };
    

    /**
     * Computes the selection of columns line of the SELECT CQL statement and adds it to the commands array
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryMetadata metadata of the query conceptual graph
     * @param commands result array of commands
     */
    const computeSelectStartingLine = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, commands: Command[], queryConcepts: QueryConcepts): void => {
        const currentTable: Concept | undefined = queryMetadata.tables.at(0);
        if (!currentTable) {
            return ;
        }

        const tableColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
        const queryColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);
        if (!tableColumns || !queryColumns) {
            return ;
        }

        let lineContent: string = designToolboxConstants.CQL_BASH_COMMAND.concat(' SELECT ');
        let columnCount: number = 0;

        queryColumns.forEach((columnConcept: Concept) => {
            columnCount = columnCount + 1;
            lineContent = lineContent.concat(columnConcept.conceptName).concat(', ');
        });

        if (columnCount === tableColumns.length) {
            lineContent = designToolboxConstants.CQL_BASH_COMMAND.concat(' SELECT *');
        } else {
            lineContent = lineContent.slice(0, lineContent.length - 2);
        }

        const aggregationFunctionsSnippet = computeAggregationFunctionSnippet();
        if (aggregationFunctionsSnippet) {
            lineContent = lineContent.concat(', ').concat(aggregationFunctionsSnippet);
        }

        lineContent = lineContent.concat(` FROM ${connectionStore.currentKeyspace}.${currentTable.conceptName}`)
        addCQLCommandLine(commands, lineContent);
    };

    /**
     * Computes the aggregation functions snippet for the SELECT CQL statement.
     * @param queryConcepts concepts related to the query
     * @returns string snippet of the aggregation functions
     */
    const computeAggregationFunctionSnippet = (): string => {
        let aggregationFunctionsSnippet = '';
        
        queryStore.aggregateFunctionsItems.forEach((item: QueryItem) => {
            if (item.toQuery) {
                const aggregationColumn = item.column === 'all' ? '*' : item.column;
                aggregationFunctionsSnippet = aggregationFunctionsSnippet.concat(`${item.valueSelect.toUpperCase()}(${aggregationColumn}), `);
            }
        });
        aggregationFunctionsSnippet = aggregationFunctionsSnippet.slice(0, aggregationFunctionsSnippet.length - 2);

        return aggregationFunctionsSnippet;  
    };


    /**
     * Computes the WHERE clause line of the SELECT CQL statement and adds it to the commands array
     * @param commands result array of commands
     */
    const computeWhereClauseLine = (commands: Command[]): void => {
        let lineContent: string = constants.inputValues.empty;

        queryStore.whereClauseItems.forEach((item: QueryItem) => {
            if (item.toQuery) {
                let itemValue = getColumnValueForWhereClauseItem(item);
                if (itemValue) {
                    lineContent = lineContent.concat(`${item.column} ${item.relation} ${itemValue} AND `);
                }
            }
        });

        if (lineContent) {
            lineContent = lineContent.slice(0, lineContent.length - 5);
            lineContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat('WHERE ').concat(lineContent);
            addCQLCommandLine(commands, lineContent, false, true);
        }
    };


    /**
     * Computes the ORDER BY clause line of the SELECT CQL statement and adds it to the commands array
     * @param commands result array of commands
     */
    const computeOrderByClauseLine = (commands: Command[]): void => {
        let lineContent: string = constants.inputValues.empty;

        queryStore.orderByClauseItems.forEach((item: QueryItem) => {
            if (item.toQuery) {
                lineContent = lineContent.concat(`${item.column} ${item.valueSelect?.toUpperCase()} AND `);
            }
        });

        if (lineContent) {
            lineContent = lineContent.slice(0, lineContent.length - 5);
            lineContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat('ORDER BY ').concat(lineContent);
            addCQLCommandLine(commands, lineContent, false, true);
        }
    };


    const computeGroupByClauseLine = (commands: Command[]): void => {
        let lineContent: string = constants.inputValues.empty;

        queryStore.groupByClauseItems.forEach((item: QueryItem) => {
            if (item.toQuery) {
                lineContent = lineContent.concat(`${item.column}, `);
            }
        });

        if (lineContent) {
            lineContent = lineContent.slice(0, lineContent.length - 2);
            lineContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat('GROUP BY ').concat(lineContent);
            addCQLCommandLine(commands, lineContent, false, true);
        }
    };

    /**
     * Helper function that computes the column value of a WHERE clause query item as a string
     * @param item WHERE clause query item
     * @returns the value of the WHERE clause query item
     */
    const getColumnValueForWhereClauseItem = (item: QueryItem): string | undefined => {
        if (item.value) {
            if (item.type === 'string') {
                return `'${item.value}'`;
            } else {
                return item.value.toString();
            }
        } else if (item.valueSelect) {
            return item.valueSelect;
        } else if (item.chipValues) {
            let chipValuesAsString: string = '( ';
            item.chipValues.forEach((chip: string) => chipValuesAsString = chipValuesAsString.concat(chip).concat(', '));
            return chipValuesAsString.slice(0, chipValuesAsString.length - 2).concat(')');
        }
    }


    /**
     * Generates the CREATE TABLE CQL as Commands
     * @param tableMetadata metadata of the table conceptual graph
     * @param clusteringOption option regarding the clustering index
     * @returns result array of commands
     */
    const generateQueryAsCommands = (tableMetadata: GraphMetadata, clusteringOption: ClusteringOption): Command[] => {
        let commands: Command[] = [];
        
        computeCreateTableDefinitionLine(tableMetadata, commands);
        computeColumnDefinitionLines(tableMetadata, commands);
        computePrimaryKeyDefinitionLine(tableMetadata, commands);
        computeClusteringOptionDefintionLines(clusteringOption, commands);
        computeCQLEndingLine(commands);
        
        return commands;
    };


    /**
     * Generates the SELECT CQL statement as Commands
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryMetadata metadata of the query conceptual graph
     * @returns result array of commands
     */
    const generateSelectQueryAsCommands = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, queryConcepts: QueryConcepts): Command[] => {
        let commands: Command[] = [];

        computeSelectStartingLine(tableMetadata, queryMetadata, commands, queryConcepts);

        if (queryStore.whereClauseItems.length) {
            computeWhereClauseLine(commands);
        }

        if (queryStore.groupByClauseItems.length) {
            computeGroupByClauseLine(commands);
        }

        if (queryStore.orderByClauseItems.length) {
            computeOrderByClauseLine(commands);
        }

        return commands;
    };


    /**
     * Generates the CREATE TABLE CQL statement based on computed commands
     * @param commands commands consisting of lines of the CREATE TABLE CQL statement
     * @returns the CREATE TABLE CQL statement as a string
     */
    const generateQueryAsString = (commands: Command[]): string => {
        const queryFromCommands = commands.reduce((accumulator, currentCommand) => {

            if (currentCommand.isColumnDefinition || currentCommand.isSelectClauseLine) {
                return accumulator.concat(' ' + currentCommand.lineContent);
            }
            return accumulator.concat(currentCommand.lineContent);

        }, constants.inputValues.empty);
        return queryFromCommands.replace(designToolboxConstants.CQL_COMMAND_REGEX, constants.inputValues.empty);
    }

    return {
        generateQueryAsCommands,
        generateQueryAsString,
        generateSelectQueryAsCommands
    };
}