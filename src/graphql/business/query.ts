import { GraphqlContext } from 'server';
import validateVat, { CountryCodes } from 'validate-vat-ts';

const vatLookup = (
  _parent: any,
  { vat }: { vat: string },
  { user }: GraphqlContext,
) => {
  if (!user) {
    throw new Error('not authenticated');
  }

  const cleanedVat = vat.replace(/[^0-9]+/g, '');

  return validateVat(CountryCodes.Belgium, cleanedVat);
};

export default {
  vatLookup,
};
