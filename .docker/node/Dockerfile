FROM node:14-alpine
WORKDIR /code

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./dist/server.js ./server.js
COPY ./dist/healthcheck.js ./healthcheck.js
COPY ./dist/check-business-subscriptions.js ./check-business-subscriptions.js
COPY ./dist/destroy-expired-contacts.js ./destroy-expired-contacts.js
COPY ./.docker/node/crons ./crons
COPY ./.docker/node/entrypoint.sh ./entrypoint.sh

RUN yarn install --production

FROM node:14-alpine
WORKDIR /code

COPY --from=0 /code /code

RUN crontab ./crons

EXPOSE 3001

HEALTHCHECK CMD ["node", "./healthcheck.js"]

CMD ["./entrypoint.sh"]
