import Business from 'models/business';
import { GraphqlContext } from 'server';
import validateVat, { CountryCodes } from 'validate-vat-ts';

const vatLookup = async (
  _parent: any,
  { vat }: { vat: string },
  { user }: GraphqlContext,
) => {
  if (!user) {
    throw new Error('not authenticated');
  }

  const vatNumber = vat.replace(/[^0-9]+/g, '');

  try {
    const viesResponse = await validateVat(CountryCodes.Belgium, vatNumber);

    if (viesResponse?.name && viesResponse?.name !== '---') {
      return viesResponse;
    }
  } catch {
    // noop
  }

  // fallback to third party with possibly outdated data
  try {
    const response = await fetch(
      `https://www.btw-opzoeken.be/VATSearch/Search?KeyWord=${vatNumber}`,
    );

    const json = await response.json();
    if (!Array.isArray(json)) {
      return null;
    }

    if (json.length === 0) {
      return null;
    }

    const data = json.shift();
    if (!data?.CompanyName) {
      return null;
    }

    return {
      countryCode: 'BE',
      vatNumber,
      valid: data?.JuridicalSituation === 'Normale toestand',
      name: data?.CompanyName,
      address: `${data?.Street} ${data?.StreetNumber}${
        data?.Box ? `/${data?.Box}` : ''
      }, ${data?.Zipcode} ${data?.City}`,
    };
  } catch (e) {
    // noop
  }

  return null;
};

const addBusiness = async (
  _parent: any,
  {
    name,
    address,
    vat,
    country,
  }: { vat: string; name: string; address: string; country: string },
  { user }: GraphqlContext,
) => {
  if (!user) {
    throw new Error('not authenticated');
  }

  if ((await Business.count({ where: { vat } })) > 0) {
    throw new Error('business already registered');
  }

  return Business.create({
    userId: user.id,
    name,
    address,
    vat,
    country,
  });
};

export default {
  vatLookup,
  addBusiness,
};
