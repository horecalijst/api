import { format as formatCsv } from '@fast-csv/format';
import {
  endOfDay,
  format as formatDate,
  formatISO,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import { nl as locale } from 'date-fns/locale';
import { Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import Business from 'models/business';
import Contact from 'models/contact';
import User from 'models/user';
import { Op } from 'sequelize';

export default async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date: rawDate, auth } = req.query;

  // are the arguments valid
  if (!rawDate || !auth || !id) {
    res.sendStatus(400);
    return;
  }

  const date = parseISO(rawDate as string);

  // is the date valid
  if (!isValid(date)) {
    res.sendStatus(400);
    return;
  }

  let user: User | null = null;
  try {
    const { id } = jsonwebtoken.verify(
      auth as string,
      process.env.JWT_SECRET as string,
    ) as { id: string };

    user = await User.findOne({ where: { id } });
  } catch {
    res.sendStatus(401);
    return;
  }

  // is there a user found
  if (!user) {
    res.sendStatus(401);
    return;
  }

  // is there a business found
  const business = await Business.findOne({ where: { id } });
  if (!business) {
    res.sendStatus(404);
    return;
  }

  // does business belong to user
  if (business.userId !== user.id) {
    res.sendStatus(401);
    return;
  }

  const contacts = await Contact.findAll({
    where: {
      createdAt: {
        [Op.gte]: startOfDay(date),
        [Op.lte]: endOfDay(date),
      },
    },
  });

  const stream = formatCsv({
    headers: ['Naam', 'Email', 'Telefoonnummer', 'Datum'],
    alwaysWriteHeaders: true,
    quoteHeaders: true,
    quoteColumns: true,
  });

  for (const contact of contacts) {
    stream.write([
      contact.name || '--',
      contact.email || '--',
      contact.phone || '--',
      formatDate(new Date(contact.createdAt), 'd MMMM yyyy, HH:mm', {
        locale,
      }) + ' UTC',
    ]);
  }

  const formattedDate = formatISO(date, { representation: 'date' });

  res.setHeader('Content-type', 'text/csv');
  res.setHeader(
    'Content-disposition',
    `attachment; filename=Export ${formattedDate} (${business.name}).csv`,
  );
  stream.pipe(res);
  stream.end();
};
