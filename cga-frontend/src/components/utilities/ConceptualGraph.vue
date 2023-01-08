<template>
  <div ref="conceptualGraph" id="cg">
    <svg :width="canvasWidth" :height="canvasHeight">
      <g class="relations"></g>
      <g class="concepts"></g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

import constants from "@/constants/constants";
import { manageRequest } from "@/includes/requests";

export default {
  name: "ConceptualGraph",
  props: {
    keyspaceName: {
      type: String
    }
  },
  data: () => ({
    keyspaceMetadata: null,
    concepts: [],
    relations: [],
    treeData: {},
    canvasWidth: 500,
    canvasHeight: 500,
    svg: null
  }),
  methods: {
    // These methods handle the retrieves of entities
    getRelationTypeForColumnConcept: function (columnKind, clusteringOrder) {
      switch (columnKind) {
        case constants.columnKinds.partitionKey:
          return constants.relationTypes.hasPartitionKey;
        case constants.columnKinds.clustering:
          return clusteringOrder === constants.clusteringOrders.ascending 
            ? constants.relationTypes.hasClusteringKeyASC 
            : constants.relationTypes.hasClusteringKeyDESC
        case constants.columnKinds.regular:
          return constants.relationTypes.isOptional;
        default:
          break;
      }
    },
    parseKeyspaceMetadata: function () {
      // Create keyspace concept.
      const keyspaceConcept = {
        conceptType: constants.conceptTypes.keyspace,
        conceptName: this.keyspaceMetadata.keyspace_name
      };
      this.concepts.push(keyspaceConcept);

      // Create concept for each table in the keyspace.
      this.keyspaceMetadata.tables.forEach(table => {

        // Create table concept.
        const tableConcept = { 
          conceptType: constants.conceptTypes.table,
          name: table.table, 
        };
        this.concepts.push(tableConcept);

        // Create a relation between the keyspace and the table concepts.
        const keyspaceToTableRelation = {
          relationType: constants.relationTypes.hasMore,
          source: keyspaceConcept,
          target: tableConcept
        };
        this.relations.push(keyspaceToTableRelation);

        table.columns.forEach(column => {
          
          // Create column concept.
          const columnConcept = {
            conceptType: constants.conceptTypes.column,
            name: column.column_name
          };
          this.concepts.push(columnConcept);
          
          // Create a relation between the table and column concepts.
          const relationType = this.getRelationTypeForColumnConcept(column.column_kind, column.clustering_order)
          const tabletoColumnRelation = {
            relationType,
            source: tableConcept,
            target: columnConcept
          };
          this.relations.push(tabletoColumnRelation);

          // Create concept for the column type.
          const typeConcept = {
            conceptType: constants.conceptTypes.dataType,
            name: column.column_type
          };
          this.concepts.push(typeConcept);

          // Create relation for the column and data type concepts.
          const columnToTypeRelation = {
            relationType: constants.relationTypes.hasType,
            source: columnConcept,
            target: typeConcept
          };
          this.relations.push(columnToTypeRelation);
        });
      });
    },
    retrieveKeyspaceMetadata: function () {
      if (this.keyspaceName) {
        this.concepts = [];
        this.relations = [];
        this.keyspaceMetadata = Object.assign({}, constants.defaultKeyspaceMetadata);

        manageRequest(constants.requestTypes.GET, "keyspace", {
          keyspace_name: this.keyspaceName
        })
          .then((response) => {
            if (response) {
              this.keyspaceMetadata = Object.assign({}, response.data.keyspace_metadata);
              this.parseKeyspaceMetadata();
              this.createCGRepresentation();
            }
          });
      }
    },
    createCGRepresentation: function () {
    },
  },
  watch: {
    keyspaceName: function () {
      this.retrieveKeyspaceMetadata();
    }
  },
  created: function () {
    this.keyspaceMetadata = Object.assign({}, constants.defaultKeyspaceMetadata);
  }
}
</script>