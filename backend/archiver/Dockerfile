FROM node:20-alpine
WORKDIR /app/archiver
COPY package* ./
RUN npm install 
RUN npm install -g typescript
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
CMD ["npm", "start"]