FROM node:18 AS builder

ENV NODE_ENV build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn global add typescript @nestjs/cli

RUN yarn install --production

COPY . /app

RUN yarn build

FROM node:18

ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/package.json /app/package.json

ENTRYPOINT ["yarn"]

CMD ["start:prod"]
