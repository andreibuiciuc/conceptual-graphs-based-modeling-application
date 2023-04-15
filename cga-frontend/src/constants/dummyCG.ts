import { Concept } from '../types/types';

const dummyGraphMetadata: any = {};
dummyGraphMetadata.keyspace = { conceptType: 'R', conceptName: 'store' };
dummyGraphMetadata.tables = [ { conceptType: 'TB', conceptName: 'products' }];
dummyGraphMetadata.columns = new Map<string, Concept[]>();
dummyGraphMetadata.columns.set('products', [{ conceptType: 'CL', conceptName: 'id' }, { conceptType: 'CL', conceptName: 'name' }]);
dummyGraphMetadata.dataTypes = new Map<string, Concept>();
dummyGraphMetadata.dataTypes.set('id', { conceptType: 'T', conceptName: 'int' });
dummyGraphMetadata.dataTypes.set('name', { conceptType: 'T', conceptName: 'text' });

export {
  dummyGraphMetadata
};
