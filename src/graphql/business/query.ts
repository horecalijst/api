import Business from 'models/business';
import { GraphqlContext } from 'server';

const businesses = async (
  _parent: any,
  _args: any,
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  return Business.findAll({
    where: { userId: user.id },
    order: [['createdAt', 'desc']],
    include: [{ all: true, nested: true }],
  });
};

export default {
  businesses,
};
