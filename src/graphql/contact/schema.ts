import { makeExecutableSchema } from 'graphql-tools';

import Business from '../business/types/business.graphql';
import User from '../user/types/user.graphql';
import resolvers from './resolvers';
import Contact from './types/contact.graphql';
import Mutation from './types/mutation.graphql';

export default makeExecutableSchema({
  typeDefs: [Contact, Business, User, Mutation],
  resolvers,
});
