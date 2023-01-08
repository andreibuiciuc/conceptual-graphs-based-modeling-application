<template>
  <div ref="conceptual-graph">
    {{ keyspaceMetadata.keyspace_name }}
  </div>
</template>

<script>
// import * as d3 from 'd3';

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
    keyspaceMetadata: null
  }),
  methods: {
    retrieveKeyspaceMetadata: function () {
      if (this.keyspaceName) {
        manageRequest(constants.requestTypes.GET, "keyspace", {
          keyspace_name: this.keyspaceName
        })
          .then((response) => {
            if (response) {
              this.keyspaceMetadata = Object.assign({}, response.data.keyspace_metadata);
            }
          });
      }
    }
  },
  watch: {
    keyspaceName: function () {
      this.retrieveKeyspaceMetadata();
    }
  }
}
</script>