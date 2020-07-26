import Business from 'models/business';
import { Op } from 'sequelize';
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

const business = async (
  _parent: any,
  { id }: { id: string },
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  const business = await Business.findOne({
    where: { id },
    include: [{ all: true, nested: true }],
  });
  if (business && business?.userId !== user.id) {
    throw new Error('no permissions');
  }

  if (!business) {
    return null;
  }

  return business;
};

const businessAutocomplete = async (_parent: any, { q }: { q: string }) => {
  if (q.length < 3) {
    return [];
  }

  return Business.findAll({
    where: {
      name: {
        [Op.like]: `%${q}%`,
      },
    },
    limit: 7,
  });
};

export default {
  businesses,
  business,
  businessAutocomplete,
};
