import { makeExecutableSchema } from 'graphql-tools';

import User from '../user/types/user.graphql';
import resolvers from './resolvers';
import Business from './types/business.graphql';
import Mutation from './types/mutation.graphql';
import Query from './types/query.graphql';
import VatLookup from './types/vat-lookup.graphql';

export default makeExecutableSchema({
  typeDefs: [VatLookup, Business, User, Mutation, Query],
  resolvers,
});
