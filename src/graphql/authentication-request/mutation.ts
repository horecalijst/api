import { differenceInMinutes, format as formatDate } from 'date-fns';
import { nl as locale } from 'date-fns/locale';
import { cleanUserAgent } from 'functions/user-agent';
import hasha from 'hasha';
import htmlToText from 'html-to-text';
import jsonwebtoken from 'jsonwebtoken';
import marked from 'marked';
import AuthenticationRequest from 'models/authentication-request';
import User from 'models/user';
import { GraphqlContext } from 'server';
import Mail, { SystemSender } from 'services/mail';
import validator from 'validator';

const authRequestValidForMinutes = 10;

const createAuthenticationRequest = async (
  _parent: any,
  args: { email: string },
  context: GraphqlContext,
) => {
  const { email } = args;
  const { userAgent, ip } = context;
  const cleanedUserAgent = cleanUserAgent(userAgent);
  const when = `${formatDate(new Date(), 'd MMMM yyyy, HH:mm', {
    locale,
  })} UTC`;

  if (!validator.isEmail(email)) {
    throw new Error('invalid email');
  }

  const user =
    (await User.findOne({ where: { email } })) ||
    (await User.create({ email }));

  const token = hasha(`${user.id}${new Date().getTime()}`, {
    algorithm: 'sha256',
  });

  await AuthenticationRequest.create({
    token,
    userId: user.id,
    userAgent,
    ip,
  });

  const link = `${process.env.APP_URL}/auth/${token}`;

  const subject = 'Aanmelden bij Horecalijst';
  let markdown = '';
  markdown += 'Hallo,<br><br>';
  markdown += `Je kan inloggen via onderstaande link. Deze link is bruikbaar komende ${authRequestValidForMinutes} minuten en kan slechts 1 keer gebruikt worden.<br>`;
  markdown += `<a href="${link}">`;
  markdown += link;
  markdown += '</a>';
  markdown += '<br><br>';
  markdown += `**Wanneer:** ${when}<br>`;
  markdown += `**Toestel:** ${cleanedUserAgent}<br>`;
  markdown += `**IP:** ${ip}<br><br>`;
  markdown += '- <a href="https://horecalijst.be">horecalijst.be</a>';

  const html = marked(markdown);
  const text = htmlToText.fromString(html);

  await Mail.send({
    sender: SystemSender,
    receiver: { email },
    subject,
    text,
    html,
  });

  return true;
};

const consomeAuthenticationRequest = async (
  _parent: any,
  args: { token: string },
) => {
  const { token } = args;

  const authRequest = await AuthenticationRequest.findOne({ where: { token } });
  if (!authRequest) {
    return null;
  }

  if (authRequest.consumedAt) {
    return null;
  }

  if (
    differenceInMinutes(new Date(), new Date(authRequest.createdAt)) >=
    authRequestValidForMinutes
  ) {
    return null;
  }

  const user = await User.findOne({ where: { id: authRequest.userId } });
  if (!user) {
    return null;
  }

  authRequest.consumedAt = new Date();
  authRequest.save();

  return jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '90 days',
  });
};

export default {
  createAuthenticationRequest,
  consomeAuthenticationRequest,
};
