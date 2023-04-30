import { createClient } from "@astrajs/rest";
  
// create an Astra DB client
// const astraClient = await createClient({
//   astraDatabaseId: process.env.ASTRA_DB_ID,
//   astraDatabaseRegion: process.env.ASTRA_DB_REGION,
//   applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
// });

const basePath = "/api/rest/v2/namespaces/store/collections/products";

export {
    // astraClient,
    basePath
};