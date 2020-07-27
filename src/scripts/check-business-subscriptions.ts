import Business, { BusinessStatus } from 'models/business';

const batch = 10;

(async () => {
  const amountOfBusinesses = await Business.count({});

  for (let i = 0; i < amountOfBusinesses; i += batch) {
    console.log(`Checking businesses, batch ${i} - ${i + batch}`);
    const businesses = await Business.findAll({
      order: [['createdAt', 'DESC']],
      limit: batch,
      offset: i,
    });

    for (const business of businesses) {
      const status = await business.status;
      console.log(`Checking business ${business.id}: ${status}`);

      business.active = status !== BusinessStatus.Expired;
      business.save();
    }
  }

  process.exit(0);
})();
