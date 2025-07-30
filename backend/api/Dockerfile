FROM node:20-alpine
WORKDIR /app/api
COPY package* .
RUN npm install
RUN npm install -g typescript
COPY . .
EXPOSE 3000
CMD ["npm", "start"]