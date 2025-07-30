FROM node:20-alpine
WORKDIR /app/ws
COPY package* ./
RUN npm install
RUN npm install -g typescript
COPY . .
CMD ["npm", "start"]