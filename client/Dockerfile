FROM node:22-alpine AS node_base
WORKDIR /app
RUN npm install -g pnpm@latest-10
COPY package*.json ./
ENV PORT=3000
EXPOSE 3000
RUN rm -rf node_modules .next pnpm-lock.yaml

FROM node_base as node_dev
RUN pnpm install
COPY . .
ENV NODE_ENV=development
CMD ["pnpm", "run", "dev"]

FROM node_base as node_build
RUN pnpm install --omit-dev
COPY . .
CMD ["pnpm", "run", "build"]

FROM node_base as node_prod
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
COPY --from=node_build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=node_build /app/node_modules ./node_modules
COPY --from=node_build /app/package.json ./package.json
COPY --from=node_build /app/public ./public
CMD ["pnpm", "run", "start"]

