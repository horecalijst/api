import { endOfDay, startOfDay } from 'date-fns';
import Business from 'models/business';
import Contact from 'models/contact';
import { Op } from 'sequelize';
import { GraphqlContext } from 'server';

const contacts = async (
  _parent: any,
  { businessId, date }: { businessId: string; date: string | number },
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  const business = await Business.findOne({
    where: { id: businessId },
    include: [{ all: true, nested: true }],
  });
  if (business && business?.userId !== user.id) {
    throw new Error('no permissions');
  }

  if (!business) {
    return [];
  }

  const where: any = { businessId };
  if (date) {
    const parsedData = new Date(
      isNaN(date as number) ? date : parseInt(date as string),
    );
    const startDate = startOfDay(parsedData);
    const endDate = endOfDay(parsedData);

    where.createdAt = {
      [Op.gte]: startDate,
      [Op.lte]: endDate,
    };
  }

  return Contact.findAll({
    where,
    order: [['createdAt', 'desc']],
    include: [{ all: true, nested: true }],
  });
};

export default {
  contacts,
};
