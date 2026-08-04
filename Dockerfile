FROM node:24.18.0-bookworm-slim AS base

WORKDIR /app

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate

FROM base AS dependencies

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

FROM base AS production

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --production=true \
  && yarn cache clean

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
