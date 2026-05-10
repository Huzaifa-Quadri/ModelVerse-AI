#STAGE 1: Build the frontend dist files
FROM node:20-alpine AS frontend_builder

WORKDIR /app

COPY ./frontend/package*.json .

RUN npm install

COPY ./frontend .

RUN npm run build


#STAGE 2: Full Stack Image - Build the backend and copy the frontend dist files
FROM node:20-alpine

WORKDIR /app

COPY ./backend/package*.json .

RUN npm install

COPY ./backend .

COPY --from=frontend_builder /app/dist  /app/public

EXPOSE 4000

CMD ["npm", "start"]