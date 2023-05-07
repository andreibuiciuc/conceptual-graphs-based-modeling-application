import constants from "../constants/constants";
import { AggregateFunction, Concept, DataTableColumn, QueryConcepts, QueryItemColumnType } from "../types/types";
import { GraphMetadata, QueryItem } from "../types/types";

export function useMetadata() {

    // Composable responsible for validation and retrival of conceptual graph metadatum

    /**
     * Returns the relation type for the related column concept with the given column kind
     * @param columnKind the given column kind of the related concept
     * @param clusteringOrder the clustering order, if any, of the related column concept 
     * @returns relation type for the related column concept
     */
    const getRelationTypeForColumnConcept = (columnKind: string, clusteringOrder?: string): string  =>  {
      switch (columnKind) {
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


    /**
     * Computes the value of the referent concept for the given query items
     * @param queryItems query items used for computing the referent value (e.g, query items using for modeling the where clause)
     * @returns referent value computed based on the query items provided
     */
    const computeConceptReferentValue = (queryItems: QueryItem[]): string => {
      const initialValue = constants.inputValues.empty;
      
      let result = queryItems.reduce((accumulator: string, currentValue: QueryItem): string => {
        return accumulator.concat(currentValue.column).concat(` ${currentValue.relation} `).concat(` ${currentValue.value} AND `);
      }, initialValue);
      
      result = result.slice(0, result.length - 4);
      return result;
    };


    /**
     * Computes the value of the referent concept for order by items
     * @param queryItems query items of the order by clause
     */
    const computeConceptReferentValueForOrderByItems = (queryItems: QueryItem[]): string => {
      const initialValue = constants.inputValues.empty;
      
      let result = queryItems.reduce((accumulator: string, currentValue: QueryItem): string => {
        const orderType = currentValue.valueSelect ? currentValue.valueSelect : constants.inputValues.empty;
        return accumulator.concat(` ${orderType} AND `);
      }, initialValue);

      result = result.slice(0, result.length - 4);
      return result;
    };


    const computeConceptReferentValueForAggregateFunction = (aggregateFunctionName: AggregateFunction, queryConcepts: QueryConcepts): string => {
      const initialValue = constants.inputValues.empty;

      let result: string = queryConcepts.get[aggregateFunctionName].aggregatedColumns.reduce((accumulator: string, currentValue: Concept) => {
        if (currentValue.conceptName === 'all') {
          return accumulator.concat(`${aggregateFunctionName}(*), `);
        }
        return accumulator.concat(`${aggregateFunctionName}(${currentValue.conceptName}), `);
      }, initialValue);

      return result.slice(0, result.length - 2);
    }

    /**
     * Returns the input type of a column concept
     * @param column column concept
     * @param tableMetadata metadata of the table conceptual graph
     * @returns the input type of the provided column concept
     */
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


    /**
     * Returns the set of CQL operators for a column concept, based on its column kind
     * @param columnKind column kind of a column concept
     * @returns the set of CQL operators based on the column kind provided
     */
    const getCQLWhereOperatorsByColumnKind = (columnKind: string | undefined): string[] => {
      let operators: string[] = [];
      
      if (!columnKind) {
        return operators;
      }

      switch (columnKind) {
        // TODO: Check the constants and refactor
        case 'partition_key':
          operators = [constants.cqlOperators.EQUAL, constants.cqlOperators.IN];
          break;
        case constants.columnKinds.clustering:
          operators = [constants.cqlOperators.EQUAL, constants.cqlOperators.IN, constants.cqlOperators.LESS, constants.cqlOperators.LESS_EQUAL, 
                       constants.cqlOperators.GREATER, constants.cqlOperators.GREATER_EQUAL];
          break;
        case constants.columnKinds.regular:
          operators = [];
        default:
          break;
      }

      return operators;
    };


    /**
     * Maps the column concepts in the query metadata to their concept names and returns the result
     * @param queryMetadata metadata of the query conceptual graph
     * @returns the list of column concept names from the query metadata
     */
    const getQuerySelectionConceptNames = (queryMetadata: GraphMetadata, queryConcepts: QueryConcepts): string[] => {
      
      const currentTable: Concept | undefined = queryMetadata.tables.at(0);
      if (!currentTable) {
        return [];
      }
      
      const currentColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns) {
        return [];
      }

      let concepts = currentColumns.map((columnConcept: Concept) => columnConcept.conceptName);

      ['count', 'min', 'max', 'avg', 'sum'].forEach(aggregationFunctionName => {

        if (queryConcepts.get[aggregationFunctionName] && queryConcepts.get[<AggregateFunction>aggregationFunctionName].aggregatedColumns.length) {
          concepts = concepts
            .concat(queryConcepts.get[<AggregateFunction>aggregationFunctionName].aggregatedColumns
            .map(concept => {
              if (concept.conceptName === 'all') {
                return  `${aggregationFunctionName}(*)`;
              } else {
                return `${aggregationFunctionName}(${concept.conceptName})`;
              }
            }));
        }

      });

      return concepts;
    };

    
    /**
     * Computes the result table header for the query results modal
     * @param queryMetadata metadata of the query conceptual graph
     * @returns list of header columns
     */
    const getHeadersForQueryResults = (queryMetadata: GraphMetadata, queryConcepts: QueryConcepts): DataTableColumn[] => {
      const columnNames: string[] = getQuerySelectionConceptNames(queryMetadata, queryConcepts);
      const tableColumns: DataTableColumn[] = columnNames.map(column => {
        return { field: column, header: column } 
      });
      return tableColumns;
    }

    
    /**
     * Computes the count of partition and clustering columns in the table metadata
     * @param tableMetadata metadata of the table conceptual graph
     * @returns object containing the partition and clustering columns count 
     */
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


    /**
     * Return the column kind of a query item
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryItem query item 
     * @returns column kind of the query item, if exists in the metadata, otherwise, the result is undefined
     */
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


    /**
     * Filters and returns the query items with a given column kind
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryItems query items used for filtering
     * @param columnKind column kind used to filter the query items
     * @returns list of query items filtered by the given column kind
     */
    const getQueryItemsByColumnKind = (tableMetadata: GraphMetadata, queryItems: QueryItem[], columnKind: string): QueryItem[] => {
      return queryItems.filter((item: QueryItem) => {
        const columnKindForItem = getColumnKindForQueryItem(tableMetadata, item);
        return columnKindForItem === columnKind;
      });
    };


    /**
     * Checks if column concepts were selected for querying and there are no columns restricted in the WHERE clause
     * @param queryMetadata metadata of the query conceptual graph
     * @param whereQueryItems items of the where clause
     * @returns true, if columns were selected for querying and there are no columns restricted in the where clause, false otherwise
     */
    const checkIfColumnsAreSelectedAndNotRestricted = (queryMetadata: GraphMetadata, whereQueryItems: QueryItem[], orderByQueryItems: QueryItem[]): boolean => {
      const currentTable: Concept | undefined = queryMetadata.tables.at(0);
      if (!currentTable) {
        return false;
      }

      const currentQueryColumns: Concept[] | undefined = queryMetadata.columns.get(currentTable.conceptName);
      if (!currentQueryColumns) {
        return false;
      }

      return currentQueryColumns.length > 0 && whereQueryItems.length === 0 && orderByQueryItems.length === 0;
    };


    /**
     * Checks if all columns of a given column king are restricted in the WHERE, only if there is at least one column of that kind 
     * that is already restricted in the where clause. 
     * @param columnKind a given column kind
     * @param tableMetadata metadata of the table conceptual graph
     * @param whereQueryItems items if the where clause
     * @returns tuple consisting of the status and the error message
     */
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

      const areAnyPartitionOrClusteringColumnsRestricted = whereQueryItems.some((item: QueryItem) => {
        const columnKindForItem = getColumnKindForQueryItem(tableMetadata, item);
        if (columnKindForItem === columnKind) {
          return true;
        } else {
          return false;
        }
      });

      if (areAnyPartitionOrClusteringColumnsRestricted) {
        for (let index = 0; index < currentColumns.length; index ++) {
          const column = currentColumns[index];
          if (column.columnKind === columnKind) {
            const indexFromQuery = whereQueryItems.findIndex(x => x.column === column.conceptName);
            if (indexFromQuery < 0) {
              return [false, `cassandra require to restrict all ${columnKind} columns. the query will be rejected`];
            }
          }
        }
      }

      return [true, constants.inputValues.empty];
    };


    /**
     * Checks if all partition key columns are restricted in the WHERE clause
     * @param queryMetadata metadata of the query conceptual graph
     * @param restrictedPartitionColumns partition key columns currently restricted in the where clause
     * @returns tuple consisting of the status and the error message
     */
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

      if (restrictedPartitionColumns.length !== 0 && partitionColumnsCount === restrictedPartitionColumns.length) {
        return [true, constants.inputValues.empty];
      } else {
        return [false, 'all partition columns must be restricted in order to proceed'];
      }

    };

    
    /**
     * Validates the WHERE clause
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryMetadata metadata of the query conceptual graph
     * @param whereQueryItems items of the WHERE clause
     * @returns error message, if the WHERE clause is invalid, empty otherwise
     */
    const validateWhereClause = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[]): string => {

      let [status, errorMessage]: [boolean, string] = [true, constants.inputValues.empty];

      [status, errorMessage] = checkUnrestrictedColumns('partition_key', tableMetadata, whereQueryItems);
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
    

    /**
     * Validates the ORDER BY clause
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryMetadata metadata of the query conceptual graph
     * @param whereQueryItems items of the WHERE clause
     * @param orderByQueryItems items of the ORDER BY
     * @returns error message, if the ORDER BY clause is invalid, empty otherwise
     */
    const validateOrderByClause = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[], orderByQueryItems: QueryItem[]): string => {
      
      const restrictedPartitionColumns = getQueryItemsByColumnKind(tableMetadata, whereQueryItems, 'partition_key');
      const [status, errorMessage] = checkIfAllPartitionColumnsAreRestricted(queryMetadata, restrictedPartitionColumns);

      if (!status) {
        return errorMessage;
      }

      return constants.inputValues.empty;
    };


    /**
     * Validates the CQL query
     * @param tableMetadata metadata of the table conceptual graph
     * @param queryMetadata metadata of the query conceptual graph
     * @param whereQueryItems items of the WHERE clause
     * @param orderByQueryItems items of the ORDER BY clause
     * @returns tuple consisting of the error message and error code
     */
    const validateQuery = (tableMetadata: GraphMetadata, queryMetadata: GraphMetadata, whereQueryItems: QueryItem[], orderByQueryItems: QueryItem[]): [string, number] => {

      const areAllColumnsSelectedAndNotRestricted = checkIfColumnsAreSelectedAndNotRestricted(queryMetadata, whereQueryItems, orderByQueryItems);
      if (areAllColumnsSelectedAndNotRestricted) {
        return [constants.inputValues.empty, 0];
      }

      const whereClauseErrorMessage = whereQueryItems.length ? validateWhereClause(tableMetadata, queryMetadata, whereQueryItems) : '';
      if (whereClauseErrorMessage) {
        return [whereClauseErrorMessage, 0];
      }

      const orderByClauseErrorMessage = orderByQueryItems.length ? validateOrderByClause(tableMetadata, queryMetadata, whereQueryItems, orderByQueryItems) : '';
      if (orderByClauseErrorMessage) {
        return [orderByClauseErrorMessage, 1];
      }

      return [constants.inputValues.empty, 0];
    };

    
    return {
      computeConceptReferentValue,
      computeConceptReferentValueForAggregateFunction,
      computeConceptReferentValueForOrderByItems,
      getCQLWhereOperatorsByColumnKind,
      getRelationTypeForColumnConcept,
      getColumnInputType,
      getQuerySelectionConceptNames,
      getHeadersForQueryResults,
      getPartitionAndClusteringColumnsCount,
      validateQuery
    };
};