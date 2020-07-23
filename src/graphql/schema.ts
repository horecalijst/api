import { mergeSchemas } from 'graphql-tools';

import authenticationRequest from './authentication-request/schema';
import user from './user/schema';

export default mergeSchemas({
  schemas: [user, authenticationRequest],
});
