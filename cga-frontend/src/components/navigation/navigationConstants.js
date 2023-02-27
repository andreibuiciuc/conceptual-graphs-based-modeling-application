export default {
  toolbar: {
    navigationHeader: {
      title: "CGA",
      subtitle: "Cassandra",
      avatar: "/cassandra.png",
      pathTo: "home",
    },
    navigationItems: [
      {
        key: "dataStructure",
        title: "Data Structure CG Design",
        value: "dataStructure",
        icon: "mdi-family-tree",
        pathTo: "data-structure",
        active: false,
      },
      {
        key: "query",
        title: "Query CG Design",
        value: "query",
        icon: "mdi-database-search",
        pathTo: "query",
        active: false,
      },
    ],
  },
};
