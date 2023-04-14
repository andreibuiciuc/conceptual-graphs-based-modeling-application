import constants from "../constants/constants";
import { Concept, QueryItemColumnType } from "../types/types";
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

    // Functions for validating Cassandra query clauses
    const validateWhereQuery = (tableMetadata: GraphMetadata, whereQueryItems: QueryItem[]): string => {
      let [status, errorMessage]: [boolean, string] = [true, constants.inputValues.empty];
      
      [status, errorMessage] = checkUnrestrictedColumns('partition_key', tableMetadata, whereQueryItems);
      if (status) {
        debugger
        return errorMessage;
      }

      [status, errorMessage] = checkUnrestrictedColumns(constants.columnKinds.clustering, tableMetadata, whereQueryItems);
      if (!status) {
        return errorMessage;
      }

      return constants.inputValues.empty;
    };

    const checkUnrestrictedColumns = (columnKind: string, tableMetadata: GraphMetadata, whereQueryItems: QueryItem[]): [boolean, string] => {

      // Unrestricted columns
      // Check to see if all partition / clustering columns are selected in the query items

      const currentTable: Concept | undefined = tableMetadata.tables.at(0);
      if (!currentTable) {
        return [false, 'no table provided for querying data.'];
      }
      
      const currentColumns: Concept[] | undefined = tableMetadata.columns.get(currentTable.conceptName);
      if (!currentColumns || !currentColumns.length) {
        return [false, 'no column provided for querying data.'];
      }

      for (let index = 0; index < currentColumns.length; index ++) {
        const column = currentColumns[index];
        if (column.columnKind === columnKind) {
          const indexFromQuery = whereQueryItems.findIndex(x => x.column === column.conceptName);
          if (indexFromQuery < 0) {
            return [false, 'cassandra require to restrict all partition key columns. The query will be rejected when run'];
          }
        }
      }

      return [true, constants.inputValues.empty];
    }

    return {
      getConceptReferentValue,
      getCQLWhereOperatorsByColumnKind,
      getRelationTypeForColumnConcept,
      getColumnInputType,
      validateWhereQuery
    };
};