import constants from '@/constants/constants';
import { AstraOperator, AstraQueryFilter, AstraQueryPayload } from "@/types/astra/types";
import { QueryItem, GraphMetadata, QueryConcepts, Concept } from "@/types/types";

export function useMetadata() {
    
    // Composable responsible for handling metadata for Astra DB communication

    /**
     * Converts a query item operator to an astra db operator
     * @param operator given query item operator
     * @returns the corresponding astra db operator
     */
    const convertQueryItemOperatorToAstraOperator = (operator: string): AstraOperator => {
        switch (operator) {
          case constants.cqlOperators.EQUAL:
            return "eq";
          case constants.cqlOperators.LESS:
            return "lt";
          case constants.cqlOperators.LESS_EQUAL:
            return "lte";
          case constants.cqlOperators.GREATER:
            return "gt";
          case constants.cqlOperators.GREATER_EQUAL:
            return 'gte';
          case constants.cqlOperators.IN:
            return "in";
        }
      };
  
  
      /**
       * Computes a filtering object for running filtered queries on Astra DB
       * @param whereClauseItems current where clause items 
       * @returns object containing the filtering conditions
       */
      const getAstraQueryFilters = (whereClauseItems: QueryItem[]): AstraQueryFilter[] => {
        let filters: AstraQueryFilter[] = [];
        whereClauseItems.forEach((item: QueryItem) => {
          filters.push({
            columnName: item.column,
            operator: convertQueryItemOperatorToAstraOperator(item.relation),
            value: item.chipValues && item.chipValues.length > 0 ? [... item.chipValues] : (item.value ? [item.value] : [])
          });
        });
        return filters;
      };
  
  
      /**
       * Computes the payload object for running filtered queries on Astra DB
       * @param queryMetadata metadata of the query conceptual graph
       * @param whereClauseItems current where clause items
       * @param queryConcepts current query concepts
       * @returns payload object for running filtered queries on Astra DB
       */
      const createAstraQueryPayload = (queryMetadata: GraphMetadata, whereClauseItems: QueryItem[], queryConcepts: QueryConcepts): AstraQueryPayload => {
        let queryPayload: AstraQueryPayload = {
          columnNames: queryMetadata.columns.get(queryMetadata.tables.at(0).conceptName).map((concept: Concept) => concept.conceptName),
          filters: getAstraQueryFilters(whereClauseItems),
        };
  
        if (queryConcepts.orderBy.columns.length) {
          queryPayload.orderBy = {
            column: queryConcepts.orderBy.columns.at(0).conceptName
          };
        }
  
        return queryPayload;
      }

    return {
        convertQueryItemOperatorToAstraOperator,
        getAstraQueryFilters,
        createAstraQueryPayload,
    };
    
};