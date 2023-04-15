import { defineStore } from "pinia";
import { useConnectionStore } from '../stores/connection';
import { Ref, ref } from "vue";

import { Command, Concept, GraphMetadata, QueryItem } from '../types/types';
import constants from "../constants/constants";
import designToolboxConstants from "../components/design/designToolboxConstants";

export const useQueryStore  = defineStore('query', () => {
    const connectionStore = useConnectionStore();

    const whereClauseItems: Ref<QueryItem[]> = ref([]);
    const orderByClauseItems: Ref<QueryItem[]> = ref([]);
    const groupByClauseItems: Ref<QueryItem[]> = ref([]);

    function computeColumnSelectionSnippet (tableColumns: Concept[], queryColumns: Concept[]): string {
        let columnSelectionSnippet: string = '';
        let columnCount = 0;

        queryColumns.forEach(columnConcept => {
            columnCount = columnCount + 1;
            columnSelectionSnippet = columnSelectionSnippet.concat(columnConcept.conceptName).concat(', ');
        });
        
        if (columnCount === tableColumns.length) {
            return '*'
        } else {
            return columnSelectionSnippet.slice(0, columnSelectionSnippet.length - 2);
        }

    }

    function computeWhereClauseSnippet (): string {
        let whereClauseSnippet: string = constants.inputValues.empty;
        whereClauseItems.value.forEach(item => {
            if (item.toQuery) {
                let columnValue = getColumnValueForWhereClauseItem(item);
                whereClauseSnippet = whereClauseSnippet.concat(`${item.column} ${item.relation} ${columnValue} AND `);
            }
        });

        if (whereClauseSnippet) {
            whereClauseSnippet = ' WHERE '.concat(whereClauseSnippet.slice(0, whereClauseSnippet.length - 5));
        }

        return whereClauseSnippet;
    }

    function getColumnsFromTableAndQueryMetadata (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata): 
        { currentTable: Concept | undefined, tableColumns: Concept[] | undefined, queryColumns: Concept[] | undefined } {

        const currentTable: Concept | undefined = queryMetadata.tables.at(0);
        if (!currentTable) {
            return { currentTable, tableColumns: undefined, queryColumns: undefined };
        }

        const tableColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
        const queryColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);

        return { currentTable, tableColumns, queryColumns };
    }

    function getColumnValueForWhereClauseItem (item: QueryItem): boolean | number | string | undefined {
        if (item.value) {
            if (item.type === 'string') {
                return `'${item.value}'`;
            } else {
                return item.value;
            }
        } else if (item.valueSelect) {
            return item.valueSelect;
        } else if (item.chipValues) {   
            let chipValuesAsString = '( ';
            item.chipValues?.forEach((chip: string) => chipValuesAsString = chipValuesAsString.concat(chip).concat(', '));
            return chipValuesAsString.slice(0, chipValuesAsString.length - 2).concat(')');
        }
    }

    function generateCQLQuery (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata): string {
        const { currentTable, tableColumns, queryColumns } = getColumnsFromTableAndQueryMetadata(tableMetadata, queryMetadata);

        if (!currentTable || !tableColumns || !queryColumns || !tableColumns.length || !queryColumns.length) {
            return constants.inputValues.empty;
        }
        
        const cqlQuery = 'SELECT '
            .concat(computeColumnSelectionSnippet(tableColumns, queryColumns))
            .concat(` FROM ${connectionStore.currentKeyspace}.${currentTable.conceptName}`)
            .concat(computeWhereClauseSnippet())
            .concat(';');

        return cqlQuery;
    }

    function generateCQLQueryCommands (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata): Command[] {
        const { currentTable, tableColumns, queryColumns } = getColumnsFromTableAndQueryMetadata(tableMetadata, queryMetadata);

        if (!currentTable || !tableColumns || !queryColumns || !tableColumns.length || !queryColumns.length) {
            return [];
        }

        let commands: Command[] = [];
        let lineContent: string = constants.inputValues.empty;
        let lineNumber: number = 0;

        // Compute the first command line from the Cassandra Terminal
        // In this case, it is the column selection snippet
        lineContent = 
            designToolboxConstants.CQL_BASH_COMMAND
            .concat(' SELECT ')
            .concat(computeColumnSelectionSnippet(tableColumns, queryColumns))
            .concat(` FROM ${connectionStore.currentKeyspace}.${currentTable.conceptName}`)
        commands.push({ lineContent, lineNumber });

        // Compute the next command line from the Cassandra Terminal
        // In this case, it is the WHERE clause snippet
        const whereClauseSnippet = whereClauseItems.value.length ? computeWhereClauseSnippet() : constants.inputValues.empty;
        if (whereClauseSnippet) {
            lineContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(whereClauseSnippet);
            lineNumber = lineNumber + 1;
            commands.push({ lineContent, lineNumber });
        }

        return commands;
    }

    return {
        whereClauseItems,
        orderByClauseItems,
        groupByClauseItems,
        generateCQLQuery,
        generateCQLQueryCommands
    };
});