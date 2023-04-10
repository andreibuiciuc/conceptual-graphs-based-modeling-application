import constants from "../constants/constants";
import { QueryItem } from "../types/types";

export function useMetadata() {

    const getRelationTypeForColumnConcept = (columnKind: string, clusteringOrder: string = constants.inputValues.empty): string  =>  {
      switch (columnKind) {
          case constants.columnKinds.partitionKey:
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

      // TODO: Check the constants
      switch (columnKind) {
        case 'partition_key':
          operators = [constants.cqlOperators.EQUAL, constants.cqlOperators.NOT_EQUAL, constants.cqlOperators.IN, constants.cqlOperators.NOT_CONTAINS];
          break;
        default:
          break;
      }

      return operators;
    };

    return {
      getConceptReferentValue,
      getCQLWhereOperatorsByColumnKind,
      getRelationTypeForColumnConcept
    };
};