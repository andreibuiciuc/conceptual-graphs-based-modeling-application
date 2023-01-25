<template>
  <div class="tf-tree conceptual-graph">
    <ul v-if="keyspaceConcept" class="conceptual-graph-root">
      <!-- Keyspace level-->
      <li>
        <div class="tf-nc keyspace-concept" v-if="keyspaceConcept">
          <span class="concept-type">{{ keyspaceConcept.conceptType }}:</span>
          <span class="concept-name">{{ keyspaceConcept.conceptName }}</span>
        </div>
        <span class="tf-nc conceptual-graph-relation"> 
          {{ keyspaceRelation }}
        </span>
        <ul>
          <!-- Table level -->
          <li v-for="tableConcept in tableConcepts" :key="tableConcept.conceptName">
            <div class="tf-nc">
              <span class="concept-type">{{ tableConcept.conceptType }}:</span> 
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
            </div>
            <ul>
              <!-- Column level -->
              <li v-for="columnConcept in columnConcepts[tableConcept.conceptName]">
                <div class="tf-nc conceptual-graph-relation">
                  <span class="concept-name">{{ columnConcept.relation }}</span>
                </div>
                <div class="tf-nc">
                  <span class="concept-type">{{ columnConcept.conceptType }}:</span>
                  <span class="concept-name">{{ columnConcept.conceptName }}</span>
                </div>
                <ul>
                  <!-- Type level -->
                  <li>
                    <div class="tf-nc conceptual-graph-relation">
                      <span class="concept-name">hasType</span>
                    </div>
                    <div class="tf-nc last">
                      <span class="concept-type">{{ dataTypes[columnConcept.conceptName].conceptType }}:</span>
                      <span class="concept-name">{{ dataTypes[columnConcept.conceptName].conceptName }}</span>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="js">
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
    relations: [],
    columns: {},
    dataTypes: {},
    //
    keyspaceConcept: null,
    tableConcepts: [],
    columnConcepts: {},
    dataTypes: {}
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
        default:
          return constants.relationTypes.isOptional;
      }
    },
    parseKeyspaceMetadata: function () {
      // Create keyspace concept.
      const keyspaceConcept = {
        conceptType: constants.conceptTypes.keyspace,
        conceptName: this.keyspaceMetadata.keyspace_name
      };
      this.keyspaceConcept = Object.assign({}, keyspaceConcept);

      // Create concept for each table in the keyspace.
      this.keyspaceMetadata.tables.forEach(table => {
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
          this.dataTypes[columnConcept.conceptName] = { ...typeConcept, relation: constants.relationTypes.hasType };
        });
      });
    },
    resetKeyspaceMetadata: function () {
      this.keyspaceMetadata = Object.assign({}, constants.defaultKeyspaceMetadata);
      this.keyspaceConcept = null;
      this.tableConcepts = [];
      this.columnConcepts = {};
      this.dataTypes = {};
    },
    retrieveKeyspaceMetadata: function () {
      if (this.keyspaceName) {
        this.resetKeyspaceMetadata();
        manageRequest(constants.requestTypes.GET, "keyspace", {
          keyspace_name: this.keyspaceName
        })
          .then((response) => {
            if (response) {
              this.keyspaceMetadata = Object.assign({}, response.data.keyspace_metadata);
              this.parseKeyspaceMetadata();
            }
          });
      } else {
        this.resetKeyspaceMetadata();
      }
    },
  },
  computed: {
    keyspaceRelation: function () {
      return this.tableConcepts.length > 1 ? constants.relationTypes.hasMore : constants.relationTypes.has;
    },
    columnRelation: function () {
      return constants.relationTypes.hasType;
    }
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

<style lang="sass">
@use '@/assets/styles/_containers.sass'
@use '@/assets/styles/_variables.sass'


.tf-nc
  margin-bottom: 1.5em

.tf-tree li ul
  margin: 0.5em 0

.last.tf-nc::after
  content: none !important

.keyspace-concept
  margin-bottom: 1em

.concept-type
  color: variables.$cassandra-blue
  font-weight: bold
  margin-right: 0.25em

.conceptual-graph
  @include containers.flex-container($align-items: center, $justify-content: center) 
  width: 100%
  height: 100%
  overflow: auto
  margin-top: 2em

  .conceptual-graph-root
    overflow: auto
  
  .conceptual-graph-relation
    border-radius: 1.5em
    font-style: italic

</style>