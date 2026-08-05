FROM node:20-alpine AS deps
WORKDIR /usr/src/app
RUN apk upgrade --no-cache
COPY --chown=node:node package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production
WORKDIR /usr/src/app
RUN apk upgrade --no-cache
COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --chown=node:node server.js ./
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["npm", "start"]
