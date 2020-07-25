import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';
import Mutation from './types/mutation.graphql';
import VatLookup from './types/vat-lookup.graphql';

export default makeExecutableSchema({
  typeDefs: [VatLookup, Mutation],
  resolvers,
});
