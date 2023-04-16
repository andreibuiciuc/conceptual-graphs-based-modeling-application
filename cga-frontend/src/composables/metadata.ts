import constants from "../constants/constants";
import { Concept, DataTableColumn, QueryItemColumnType } from "../types/types";
import { GraphMetadata, QueryItem } from "../types/types";

export function useMetadata() {

    // Functions for computing metadata properties
    const getRelationTypeForColumnConcept = (columnKind: string, clusteringOrder: string = constants.inputValues.empty): string  =>  {
      switch (columnKind) {
          // TODOL Check the constants and refactor
          case "partition_key":
            return constants.relationTypes.hasPartitionKey;
          case constants.columnKinds.clustering:
            return clusteringOrder === constants.clusteringOrders.ascending
              ? constants.relationTypes.hasClusteringKeyASC
              : constants.relationTypes.hasClusteringKeyDESC
          case constants.columnKinds.regular:
          default:
            return constants.relationTypes.isOptional;
        }
    };

    const getConceptReferentValue = (queryItems: QueryItem[]) => {
      const initialValue = constants.inputValues.empty;
      let result = queryItems.reduce((accumulator: string, currentValue: QueryItem): string => {
        return accumulator.concat(currentValue.column).concat(` ${currentValue.relation} `).concat(` ${currentValue.value} AND `);
      }, initialValue);
      
      result = result.slice(0, result.length - 4);
      return result;
    };

    const getColumnInputType = (column: Concept, tableMetadata?: GraphMetadata): QueryItemColumnType => {
      if (!tableMetadata) {
        return 'other';
      }

      const typeConcept = tableMetadata.dataTypes.get(column.conceptName);
      if (!typeConcept) {
        return 'other';
      }

      if (['int', 'bigint', 'smallint', 'tinyint'].includes(typeConcept.conceptName)) {
        return 'integer';
      } else if (['float', 'double', 'float'].includes(typeConcept.conceptName)) {
        return 'float';
      } else if (['string', 'ascii', 'text'].includes(typeConcept.conceptName)) {
        return 'string';
      } else if (typeConcept.conceptName === 'boolean') {
        return 'boolean';
      } else {
        return 'other';
      }

    };

    const getCQLWhereOperatorsByColumnKind = (columnKind: string | undefined): string[] => {
      let operators: string[] = [];
      
      if (!columnKind) {
        return operators;
      }

      switch (columnKind) {
        // TODO: Check the constants and refactor
        case 'partition_key':
          operators = [constants.cqlOperators.EQUAL, constants.cqlOperators.IN, constants.cqlOperators.CONTAINS];
          break;
        case constants.columnKinds.clustering:
          operators = Object.values(constants.cqlOperators);
          break;
        case constants.columnKinds.regular:
          operators = Object.values(constants.cqlOperators).filter((operator: string) => ![constants.cqlOperators.IN].includes(operator));
        default:
          break;
      }

      return operators;
    };

    const getQuerySelectionConceptNames = (queryMetadata: GraphMetadata): string[] => {
      
      const currentTable: Concept | undefined = queryMetadata.tables.at(0);
      if (!currentTable) {
        return [];
      }
      
      const currentColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns) {
        return [];
      }

      return currentColumns.map(columnConcept => columnConcept.conceptName);
    };

    const getHeadersForQueryResults = (queryMetadata: GraphMetadata): DataTableColumn[] => {
      const columnNames: string[] = getQuerySelectionConceptNames(queryMetadata);
      const tableColumns: DataTableColumn[] = columnNames.map(column => {
        return { field: column, header: column } 
      });
      return tableColumns;
    }

    const getPartitionAndClusteringColumnsCount = (tableMetadata: GraphMetadata): { [key: string]: number } => {
      const initialCount = { partitionColumnsCount: 0, clusteringColumnCount: 0 };
      
      const currentTableConcept: Concept | undefined = tableMetadata.tables.at(0);
      if (!currentTableConcept) {
        return initialCount;
      }

      const columnConcepts: Concept[] | undefined = tableMetadata.columns.get(currentTableConcept.conceptName)
      if (!columnConcepts) {
        return initialCount;
      }
    
      return columnConcepts.reduce((accumulator, currentValue) => {
        if (currentValue.columnKind === 'partition_key') {
          accumulator.partitionColumnsCount += 1;
        } else if (currentValue.columnKind === constants.columnKinds.clustering) {
          accumulator.clusteringColumnCount += 1;
        }
        return accumulator;
      }, initialCount);
    };

    const getColumnKindForQueryItem = (tableMetadata: GraphMetadata, queryItem: QueryItem): string | undefined => {
      const currentTable: Concept | undefined = tableMetadata.tables.at(0);
      if (!currentTable) {
        return constants.inputValues.empty;
      }

      const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns) {
        return constants.inputValues.empty;
      }

      const columnForItem: Concept | undefined = currentColumns.find((columnConcept: Concept) => columnConcept.conceptName === queryItem.column);
      if (!columnForItem) {
        return constants.inputValues.empty;
      }

      return columnForItem.columnKind;

    };

    const getQueryItemsByColumnKind = (tableMetadata: GraphMetadata, queryItems: QueryItem[], columnKind: string): QueryItem[] => {
      return queryItems.filter((item: QueryItem) => {
        const columnKindForItem = getColumnKindForQueryItem(tableMetadata, item);
        return columnKindForItem === columnKind;
      });
    };

    // Functions for validating Cassandra 'where' query clauses
    const validateWhereClause = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[]): string => {

      let [status, errorMessage]: [boolean, string] = [true, constants.inputValues.empty];

      [status, errorMessage] = checkUnrestrictedColumns('partition_key', tableMetadata, whereQueryItems);
      if (!status) {
        return errorMessage;
      }

      [status, errorMessage] = checkUnrestrictedColumns(constants.columnKinds.clustering, tableMetadata, whereQueryItems);
      if (!status) {
        return errorMessage;
      }

      const restrictedPartitionColumns = getQueryItemsByColumnKind(tableMetadata, whereQueryItems, 'partition_key');
      const restrictedClusteringColumns = getQueryItemsByColumnKind(tableMetadata, whereQueryItems, constants.columnKinds.clustering);
      const restrictedRegularColumns = getQueryItemsByColumnKind(tableMetadata, whereQueryItems, constants.columnKinds.regular);

      if (restrictedClusteringColumns.length || restrictedRegularColumns.length) {
        [status, errorMessage] = checkIfAllPartitionColumnsAreRestricted(queryMetadata, restrictedPartitionColumns);
        if (!status) {
          return errorMessage;
        }
      }

      return constants.inputValues.empty;
    };

    const checkIfSelectAllAndNoFiltering = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[]): boolean => {

      // 
      // Check to see if all columns are selected in the query and are not filtered

      const currentTable: Concept | undefined = queryMetadata.tables.at(0);
      if (!currentTable) {
        return false;
      }

      const currentTableColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
      const currentQueryColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);

      if (!currentTableColumns || !currentQueryColumns) {
        return false;
      }

      const areAllColumnsSelected = currentTableColumns.length === currentQueryColumns.length && whereQueryItems.length === 0;
      
      return areAllColumnsSelected;

    };

    const checkUnrestrictedColumns = (columnKind: string, tableMetadata: GraphMetadata, whereQueryItems: QueryItem[]): [boolean, string] => {

      // Unrestricted columns
      // Check to see if all partition / clustering columns are selected in the query items
      // If the where clause restricts one partition / clustering column, then it should restrict all of them

      const currentTable: Concept | undefined = tableMetadata.tables.at(0);
      if (!currentTable) {
        return [false, 'no table provided for querying data'];
      }
      
      const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns || !currentColumns.length) {
        return [false, 'no columns provided for querying data'];
      }

      // Check to see if there is any partition / clustering column restricted in the where clause items.
      const areAnyPartitionOrClusteringColumnsRestricted = whereQueryItems.some((item: QueryItem) => {
        const columnKindForItem = getColumnKindForQueryItem(tableMetadata, item);
        if (columnKindForItem === columnKind) {
          return true;
        } else {
          return false;
        }
      });

      // If there is one partition / clustering column restricted in the where clause items, then all such column should be restricted
      if (areAnyPartitionOrClusteringColumnsRestricted) {
        for (let index = 0; index < currentColumns.length; index ++) {
  
          const column = currentColumns[index];
          if (column.columnKind === columnKind) {
            const indexFromQuery = whereQueryItems.findIndex(x => x.column === column.conceptName);
            if (indexFromQuery < 0) {
              return [false, 'cassandra require to restrict all partition key columns. the query will be rejected'];
            }
          }
        }
      }

      return [true, constants.inputValues.empty];
    };

    const checkIfAllPartitionColumnsAreRestricted = (queryMetadata: GraphMetadata, restrictedPartitionColumns: QueryItem[]): [boolean, string] => {

      const currentTable: Concept | undefined = queryMetadata.tables.at(0);
      if (!currentTable) {
        return [false, 'no table selected for query'];
      }

      const currentColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns) {
        return [false, 'no columns selected for query'];
      }

      const partitionColumnsCount = currentColumns.reduce((accumulator: number, currentConcept: Concept) => {
        if (currentConcept.columnKind === 'partition_key') {
          return accumulator + 1;
        } else {
          return accumulator;
        }
      }, 0);

      if (partitionColumnsCount === restrictedPartitionColumns.length) {
        return [true, constants.inputValues.empty];
      } else {
        return [false, 'all partition columns must be restricted in order to proceed'];
      }

    };

    // Functions for validating Cassandra 'order by' query clauses
    const validateOrderByClause = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[], orderByQueryItems: QueryItem[]): string => {
      
      const restrictedPartitionColumns = getQueryItemsByColumnKind(tableMetadata, whereQueryItems, 'partition_key');
      const [status, errorMessage] = checkIfAllPartitionColumnsAreRestricted(queryMetadata, restrictedPartitionColumns);

      if (!status) {
        return errorMessage;
      }

      return constants.inputValues.empty;
    };


    // Wrapper functions for validating Cassandra queries
    const validateQuery = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[], orderByQueryItems: QueryItem[]): [string, number] => {

      const areAllColumnsSelectedAndNotRestricted = checkIfSelectAllAndNoFiltering(tableMetadata, queryMetadata, whereQueryItems);
      if (areAllColumnsSelectedAndNotRestricted) {
        return [constants.inputValues.empty, 0];
      }

      const whereClauseErrorMessage = validateWhereClause(tableMetadata, queryMetadata, whereQueryItems);
      if (whereClauseErrorMessage) {
        return [whereClauseErrorMessage, 0];
      }

      const orderByClauseErrorMessage = validateOrderByClause(tableMetadata, queryMetadata, whereQueryItems, orderByQueryItems);
      if (orderByClauseErrorMessage) {
        return [orderByClauseErrorMessage, 1];
      }

      return [constants.inputValues.empty, 0];
    };

    return {
      getConceptReferentValue,
      getCQLWhereOperatorsByColumnKind,
      getRelationTypeForColumnConcept,
      getColumnInputType,
      getQuerySelectionConceptNames,
      getHeadersForQueryResults,
      getPartitionAndClusteringColumnsCount,
      validateQuery
    };
};