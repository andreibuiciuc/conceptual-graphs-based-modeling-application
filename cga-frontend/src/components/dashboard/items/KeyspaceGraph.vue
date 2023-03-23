<template>
  <conceptual-graph :inverted="false"
                    :keyspace-concept="keyspaceConcept" 
                    :table-concepts="tableConcepts" 
                    :column-concepts="columnConcepts"
                    :data-type-concepts="dataTypeConcepts" />
</template>

<script lang="js">
import constants from '@/constants/constants';
import { manageRequest } from "@/includes/requests";
import ConceptualGraph from "../../utilities/ConceptualGraph.vue";

export default {
  name: "KeyspaceGraph",
  components: {
    ConceptualGraph
  },
  props: {
    selectedKeyspace: constants.inputValues.empty
  },
  data: () => ({
    keyspaceConcept: null,
    tableConcepts: [],
    columnConcepts: [],
    dataTypeConcepts: []
  }),
  methods: {
    getRelationTypeForColumnConcept: function (columnKind, clusteringOrder) {
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
    },
    // These methods are related to the retrieve of the Keyspace metadata
    parseKeyspaceMetadata: function (keyspaceMetadata) {
      // Create keyspace concept.
      const keyspaceConcept = {
        conceptType: constants.conceptTypes.keyspace,
        conceptName: keyspaceMetadata.keyspace_name
      };
      this.keyspaceConcept = Object.assign({}, keyspaceConcept);

      // Create concept for each table in the keyspace.
      keyspaceMetadata.tables.forEach(table => {
        // Create table concept.
        const tableConcept = { 
          conceptType: constants.conceptTypes.table,
          conceptName: table.table, 
        };
        // Create a relation between the keyspace and the table concepts.
        this.tableConcepts.push({ ...tableConcept });

        this.columnConcepts[tableConcept.conceptName] = [];
        table.columns.forEach(column => {
          // Create column concept.
          const columnConcept = {
            conceptType: constants.conceptTypes.column,
            conceptName: column.column_name
          };
          // Create a relation between the table and column concepts.
          const relationType = this.getRelationTypeForColumnConcept(column.column_kind, column.clustering_order)
          this.columnConcepts[tableConcept.conceptName].push({ ...columnConcept, relation: relationType });
          // Create concept for the column type.
          const typeConcept = {
            conceptType: constants.conceptTypes.dataType,
            conceptName: column.column_type
          };
          // Create relation for the column and data type concepts.
          this.dataTypeConcepts[columnConcept.conceptName] = { ...typeConcept, relation: constants.relationTypes.hasType };
        });
      });
    },
    resetKeyspaceMetadata: function () {
      this.keyspaceConcept = null;
      this.tableConcepts = [];
      this.columnConcepts = {};
      this.dataTypeConcepts = {};
    },
    retrieveKeyspaceMetadata: function () {
      if (this.selectedKeyspace) {
        this.resetKeyspaceMetadata();
        manageRequest(constants.requestTypes.GET, "keyspace", {
          keyspace_name: this.selectedKeyspace
        })
          .then((response) => {
            if (response) {
              this.parseKeyspaceMetadata(response.data.keyspace_metadata);
            }
          });
      } else {
        this.resetKeyspaceMetadata();
      }
    },
  },
  watch: {
    'selectedKeyspace': function() {
      this.retrieveKeyspaceMetadata();
    }
  }
}
</script>