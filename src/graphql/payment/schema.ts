import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';
import Mutation from './types/mutation.graphql';
import Order from './types/order.graphql';
import Product from './types/product.graphql';
import Query from './types/query.graphql';

export default makeExecutableSchema({
  typeDefs: [Mutation, Product, Order, Query],
  resolvers,
});
