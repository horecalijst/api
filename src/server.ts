import { ApolloServer } from 'apollo-server-express';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'express-jwt';
import { cleanUserAgent } from 'functions/user-agent';
import gql from 'graphql-tag';
import User, { UserStatus } from 'models/user';

import schema from './graphql/schema';
import requestHandlers from './request-handlers';

export interface GraphqlContext {
  user: { id: string } | null;
  ip: string;
  userAgent: string;
}

const app = express();
app.disable('x-powered-by');

const apollo = new ApolloServer({
  schema,
  playground: process.env.NODE_ENV !== 'production',
  context: async ({ req }: { req: Request & { user: { id?: string } } }) => {
    const ip = `${req.get('cf-connecting-ip') || req.connection.remoteAddress}`;
    const userAgent = `${req.get('user-agent')}`;
    let cleanedUserAgent = cleanUserAgent(userAgent);
    if (cleanedUserAgent.toLocaleLowerCase().includes('other')) {
      cleanedUserAgent = userAgent;
    }

    const query = req?.body?.query
      ? gql`
          ${req?.body?.query}
        `
      : null;
    if (query) {
      for (const definition of query.definitions) {
        for (const { name } of (definition as any)?.selectionSet?.selections) {
          const { value: mutationOrQueryName } = name;
          console.log(
            `[${new Date().toISOString()}] [IP: ${ip}] [UA: ${cleanedUserAgent}] ${
              (definition as any)?.operation
            } ${mutationOrQueryName}`,
          );
        }
      }
    }

    const context: GraphqlContext = {
      user: null,
      ip,
      userAgent,
    };

    if (!req?.user?.id) {
      return context;
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return context;
    }

    if (user.status !== UserStatus.Active) {
      user.activatedAt = new Date();
    }

    user.lastOnlineAt = new Date();
    user.save();

    context.user = { id: user.id };

    return context;
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  jwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }),
);
app.use((e: Error, _req: Request, _res: Response, next: NextFunction) => {
  if (e.message === 'jwt expired') {
    next();
    return;
  }

  throw e;
});

// Healthcheck
app.get('/ping', requestHandlers.ping);

// Payment callback
app.post('/payments/:orderId', requestHandlers.paymentCallback);

// Business contacts export
app.get(
  '/businesses/:id/contacts/export',
  requestHandlers.businessContactExport,
);

// Link Apollo with Express
apollo.applyMiddleware({ app: app, path: '/' });

// Start server on port 3001
app.listen(3001, () => {
  console.log(
    `> Application is running on http://localhost:3001${apollo.graphqlPath} 🚀`,
  );
});
