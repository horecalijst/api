import { ApolloServer } from 'apollo-server-express';
import Express, { NextFunction, Request, Response } from 'express';
import jwt from 'express-jwt';
import User, { UserStatus } from 'models/user';

import schema from './graphql/schema';
import requestHandlers from './request-handlers';

export interface GraphqlContext {
  user: { id: string } | null;
  ip: string;
  userAgent: string;
}

const express = Express();
express.disable('x-powered-by');

const apollo = new ApolloServer({
  schema,
  playground: process.env.NODE_ENV !== 'production',
  context: async ({ req }: { req: Request & { user: { id?: string } } }) => {
    const ip = `${req.get('cf-connecting-ip') || req.connection.remoteAddress}`;
    const userAgent = `${req.get('user-agent')}`;

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
express.use(Express.json());
express.use(Express.urlencoded({ extended: true }));
express.use(
  jwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }),
);
express.use((e: Error, _req: Request, _res: Response, next: NextFunction) => {
  if (e.message === 'jwt expired') {
    next();
    return;
  }

  throw e;
});

// Healthcheck
express.get('/ping', requestHandlers.ping);

// Payment callback
express.post('/payments/:orderId', requestHandlers.paymentCallback);

// Business contacts export
express.get(
  '/businesses/:id/contacts/export',
  requestHandlers.businessContactExport,
);

// Link Apollo with Express
apollo.applyMiddleware({ app: express, path: '/' });

// Start server on port 3001
express.listen(3001, () => {
  console.log(
    `> Application is running on http://localhost:3001${apollo.graphqlPath} 🚀`,
  );
});
