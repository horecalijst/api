import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Business from 'models/business';
import Contact from 'models/contact';

const addContact = async (
  _parent: any,
  {
    name: rawName,
    email: rawEmail,
    phone: rawPhone,
    businessId,
  }: {
    name: string | null;
    email: string | null;
    phone: string | null;
    businessId: string;
  },
) => {
  if (!rawEmail && !rawPhone) {
    throw new Error('both email & phone are missing');
  }

  const validBusiness =
    (await Business.count({ where: { id: `${businessId}` } })) > 0;
  if (!validBusiness) {
    throw new Error('invalid businessId');
  }

  const name = rawName || null;
  const email = rawEmail?.trim().toLowerCase() || null;
  let phone = rawPhone?.trim() || null;
  // assume +32 if no country prefix
  if (phone && phone.substr(0, 1) !== '+' && phone.substr(0, 3) !== '003') {
    phone = `+32${phone?.substr(1, phone.length - 1)}`;
  }
  if (phone) {
    phone = parsePhoneNumberFromString(phone)?.formatInternational() || null;
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
