<template>
  <div class="conceptual-graph">
    <ul v-if="keyspaceName" class="root">
      <!-- Keyspace level-->
      <li>
        <div v-if="keyspaceName" class="concept">
          <span class="concept-type">R:</span>
          <span class="concept-name">{{ keyspaceName }}</span>
        </div>
        <ul>
          <!-- Tables level -->
          <li v-for="tableConcept in tables" :key="tableConcept.conceptName">
            <div class="concept">
              <span class="concept-type">{{ tableConcept.conceptType }}:</span> 
              <span class="concept-name">{{ tableConcept.conceptName }}</span>
            </div>
            <ul>
              <!-- Columns level -->
              <li v-for="columnConcept in columns[tableConcept.conceptName]">
                <div class="concept">
                  <span class="concept-type">{{ columnConcept.conceptType }}:</span>
                  <span class="concept-name">{{ columnConcept.conceptName }}</span>
                </div>
                <ul>
                  <!-- Type level -->
                  <li>
                    <div class="concept">
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
    tables: [],
    columns: {},
    dataTypes: {},
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
          conceptName: table.table, 
        };
        this.concepts.push(tableConcept);
        this.tables.push(tableConcept);
        
        // Create a relation between the keyspace and the table concepts.
        const keyspaceToTableRelation = {
          relationType: constants.relationTypes.hasMore,
          source: keyspaceConcept,
          target: tableConcept
        };
        this.relations.push(keyspaceToTableRelation);

        this.columns[tableConcept.conceptName] = [];
        table.columns.forEach(column => {
          
          // Create column concept.
          const columnConcept = {
            conceptType: constants.conceptTypes.column,
            conceptName: column.column_name
          };
          this.concepts.push(columnConcept);
          this.columns[tableConcept.conceptName].push(columnConcept)
          
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
            conceptName: column.column_type
          };
          this.concepts.push(typeConcept);
          this.dataTypes[columnConcept.conceptName] = typeConcept;

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
    resetKeyspaceMetadata: function () {
      this.concepts = [];
      this.relations = [];
      this.keyspaceMetadata = Object.assign({}, constants.defaultKeyspaceMetadata);
      this.tables = [];
      this.columns = [];
      this.dataTypes = [];
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
    createCGRepresentation: function () {
      // TODO!!!
      if (this.svg) {
        d3.select("svg").remove();
        this.svg = null;
      }

      // this.canvasWidth = this.$refs.conceptualGraph.clientWidth;
      // this.canvasHeight = this.$refs.conceptualGraph.clientHeight;

      this.svg = d3.select(this.$refs.conceptualGraph)
        .append("svg").attr("width", this.canvasWidth).attr("height", this.canvasHeight);

      const simulation = d3.forceSimulation(this.concepts)
        .force("link", d3.forceLink(this.relations))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2));

      const link = this.svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.relations)
        .enter()
        .append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "#ddd");

      const node = this.svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.concepts)
        .enter()
        .append("rect")
        .attr("width", 75)
        .attr("height", 25)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .call(drag(simulation));

      simulation.nodes(this.concepts).on("tick", ticked);
      simulation.force("link").links(this.relations);

      function ticked () {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      }

      function drag () {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
        
        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }
        
        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
        }
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

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

// Styles related to the concept divisions
.conceptual-graph
  @include containers.flex-container($align-items: center, $justify-content: center) 
  width: 100%
  height: 100%
  overflow: auto

  .root
    overflow: auto
  
  .concept 
    border: variables.$cga-graph-border-width solid variables.$cassandra-blue
    padding: .5em .75em
    text-decoration: none
    display: inline-block
    border-radius: 5px
    color: variables.$cassandra-blue

    &:hover, &:hover + ul li .concept 
      background: variables.$cassandra-blue
      color: variables.$cassandra-white
      border: variables.$cga-graph-border-width solid variables.$cassandra-blue

      .concept-type, .concept-name
        color: variables.$cassandra-white

    .concept-type
      font-weight: bold

    .concept-name
      margin-left: 5px
    
    &:hover + ul li::after, &:hover + ul li::before, &:hover + ul::before, &:hover + ul ul::before
      border-color: variables.$cassandra-red

// Styles related to the relation lines (pseudo elements for the unorderd list and list item native elements)
%relation-line
  position: absolute
  top: 0
  width: 50%
  height: 2em
  border-top: variables.$cga-graph-border-width solid variables.$cassandra-blue
  content: variables.$cga-graph-content

.conceptual-graph ul 
  padding: 2em 0
  white-space: nowrap

.conceptual-graph ul ul::before
  @extend %relation-line
  border-top: 0 !important
  border-left: variables.$cga-graph-border-width solid variables.$cassandra-blue
  left: 50%
  width: 0

.conceptual-graph li 
  display: inline-block
  list-style-type: none
  text-align: center
  padding: 2em .5em 0 .5em

  &::before
    @extend %relation-line
    right: 50%
    border-right: variables.$cga-graph-border-width solid variables.$cassandra-blue
  
  &::after
    @extend %relation-line
    right: auto
    left: 50%

  &:only-child 
    padding-top: 0

  &:only-child::after, &:only-child::before, &:first-child::before, &:last-child::after 
    display: none
  
  &:last-child::before
    border-right: variables.$cga-graph-border-width solid variables.$cassandra-blue
    border-top-right-radius: variables.$cga-graph-border-radius
  
  &:first-child::after
    border-left: variables.$cga-graph-border-width solid variables.$cassandra-blue
    border-top-left-radius: variables.$cga-graph-border-radius

</style>