import Business from 'models/business';
import Contact from 'models/contact';
import { GraphqlContext } from 'server';

const addContact = async (
  _parent: any,
  {
    name,
    email,
    phone,
    businessId,
  }: {
    name: string | null;
    email: string | null;
    phone: string | null;
    businessId: string;
  },
  { user }: GraphqlContext,
) => {
  if (!user) {
    throw new Error('not authenticated');
  }

  if (!email && !phone) {
    throw new Error('both email & phone are missing');
  }

  const validBusiness =
    (await Business.count({ where: { id: `${businessId}` } })) > 0;
  if (!validBusiness) {
    throw new Error('invalid businessId');
  }

  return Contact.create({
    name,
    phone,
    email,
    businessId,
  });
};

export default {
  addContact,
};
