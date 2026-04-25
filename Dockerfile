# ─── Stage 1 : Installation des dépendances ───────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ─── Stage 2 : Exécution (dev / test / lint) ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copier les dépendances installées depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
