import constants from "../constants/constants";
import { QueryItem } from "../types/types";

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

    const getCQLWhereOperatorsByColumnKind = (columnKind: string | undefined): string[] => {
      let operators: string[] = [];
      
      if (!columnKind) {
        return operators;
      }

      switch (columnKind) {
        // TODO: Check the constants and refactor
        case 'partition_key':
          operators = [constants.cqlOperators.EQUAL, constants.cqlOperators.NOT_EQUAL, 
                       constants.cqlOperators.IN, constants.cqlOperators.NOT_IN, 
                       constants.cqlOperators.CONTAINS, constants.cqlOperators.NOT_CONTAINS];
          break;
        case constants.columnKinds.clustering:
          operators = Object.values(constants.cqlOperators);
        case constants.columnKinds.regular:
          operators = Object.values(constants.cqlOperators).filter((operator: string) => ![constants.cqlOperators.IN, constants.cqlOperators.NOT_IN].includes(operator));
        default:
          break;
      }

      return operators;
    };

    // Functions for validating Cassandra query clauses
    const validateWhereClause = (items: QueryItem[]): string => {
      let isWhereClauseValid: boolean = true;

      // Unrestricted partition key columns


      return constants.inputValues.empty;
    };

    return {
      getConceptReferentValue,
      getCQLWhereOperatorsByColumnKind,
      getRelationTypeForColumnConcept
    };
};