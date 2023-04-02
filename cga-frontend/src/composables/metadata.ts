import constants from "../constants/constants";

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

    return {
        getRelationTypeForColumnConcept
    };
};