export default {
  keyspaceConcept: {
    conceptType: "R",
    conceptName: "store"
  },
  tableConcepts: [
    {
      conceptType: "TB",
      conceptName: "products"
    },
    {
      conceptType: "TB",
      conceptName: "vendors"
    }
  ],
  columnConcepts: {
    products: [
      {
        conceptType: "CL",
        conceptName: "productID",
        relation: "partitionKey"
      },
      {
        conceptType: "CL",
        conceptName: "productName",
        relation: "isOptional"
      }
    ],
    vendors: [
      {
        conceptType: "CL",
        conceptName: "vendorID",
        relation: "partitionKey"
      },
      {
        conceptType: "CL",
        conceptName: "vendorName",
        relation: "isOptional"
      }
    ]
  },
  dataTypeConcepts: {
    productID: {
      conceptType: "T",
      conceptName: "int"
    },
    productName: {
      conceptType: "T",
      conceptName: "text"
    },
    vendorID: {
      conceptType: "T",
      conceptName: "int"
    },
    vendorName: {
      conceptType: "T",
      conceptName: "text"
    }
  }
};