import User from 'models/user';
import { GraphqlContext } from 'server';

const me = async (_parent: any, _args: any, context: GraphqlContext) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  return User.findOne({ where: { id: user.id } });
};

export default {
  me,
};
