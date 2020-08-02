import jsonwebtoken from 'jsonwebtoken';
import AuthenticationRequest from 'models/authentication-request';
import { GraphqlContext } from 'server';

const authenticationRequests = async (
  _parent: any,
  _args: any,
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  return AuthenticationRequest.findAll({
    include: [{ all: true, nested: true }],
    order: [['createdAt', 'desc']],
  });
};

const refreshAuthToken = async (
  _parent: any,
  _args: any,
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  return jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '30 days',
  });
};

export default {
  authenticationRequests,
  refreshAuthToken,
};
