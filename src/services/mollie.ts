import createMollieClient from '@mollie/api-client';

const Mollie = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY as string,
});

export default Mollie;
