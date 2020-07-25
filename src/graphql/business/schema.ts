import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';
import Query from './types/query.graphql';
import VatLookup from './types/vat-lookup.graphql';

export default makeExecutableSchema({
  typeDefs: [VatLookup, Query],
  resolvers,
});
