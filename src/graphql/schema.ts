import { mergeSchemas } from 'graphql-tools';

import authenticationRequest from './authentication-request/schema';
import business from './business/schema';
import contact from './contact/schema';
import user from './user/schema';

export default mergeSchemas({
  schemas: [contact, user, business, authenticationRequest],
});
