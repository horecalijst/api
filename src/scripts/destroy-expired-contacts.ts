import { subDays } from 'date-fns';
import hasha from 'hasha';
import Contact from 'models/contact';
import { Op } from 'sequelize';

(async () => {
  const expiredContactIds = (
    await Contact.findAll({
      attributes: ['id'],
      where: {
        createdAt: {
          [Op.lte]: subDays(new Date(), 14),
        },
        destroyedAt: null,
      },
    })
  ).map((expiredContact) => expiredContact.id);

  console.log(`Found ${expiredContactIds.length} expired contacts`);

  for (const id of expiredContactIds) {
    console.log(`Destroying data for ${id}`);

    const contact = (await Contact.findOne({ where: { id } })) as Contact;
    contact.name = contact.name
      ? hasha(`${contact.name?.trim().toLowerCase()}`, {
          algorithm: 'md5',
        })
      : null;
    contact.phone = contact.phone
      ? hasha(`${contact.phone?.trim().toLowerCase()}`, {
          algorithm: 'md5',
        })
      : null;
    contact.email = contact.email
      ? hasha(`${contact.email.trim().toLowerCase()}`, { algorithm: 'md5' })
      : null;
    contact.destroyedAt = new Date();
    await contact.save();
  }

  process.exit(0);
})();
