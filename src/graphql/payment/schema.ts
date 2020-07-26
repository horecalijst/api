import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';
import Product from './types/product.graphql';
import Query from './types/query.graphql';

export default makeExecutableSchema({
  typeDefs: [Product, Query],
  resolvers,
});
