# Tidder API (Backend)

![cover](public/tidder_logo_cover.png)

The backend API which powers the Tidder social media platform.

## Built with

<a href="https://nodejs.org">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" height="40" alt="Node.js">
</a>
<a href="https://www.typescriptlang.org">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" height="40" alt="Typescript">
</a>
<a href="https://expressjs.com">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" height="40" alt="Express">
</a>
<a href="https://www.postgresql.org">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" height="40" alt="PostgreSQL">
</a>
<a href="https://www.prisma.io">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" height="40" alt="Prisma">
</a>
<a href="https://cloudinary.com/">
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white
  " height="40" alt="Cloudinary">
</a>
<a href="https://jwt.io">
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" height="40" alt="JWT">
</a>
<a href="https://zod.dev">
  <img src="https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white" height="40" alt="Zod" />
</a>

## Deployment

Deployed on [Render](https://render.com/).

## API Endpoints

### Authentication

| Endpoint              | Method | Description               |
| --------------------- | ------ | ------------------------- |
| /api/auth/login       | POST   | User login                |
| /api/auth/guest-login | POST   | Guest user login          |
| /api/auth/register    | POST   | User registration         |
| /api/auth/logout      | POST   | User logout               |
| /api/auth/me          | GET    | Check user authentication |

### Communities

| Endpoint                            | Method | Description                                            |
| ----------------------------------- | ------ | ------------------------------------------------------ |
| /api/community                      | POST   | Create new community                                   |
| /api/community/feed                 | GET    | Fetch all posts from communities user is subscribed to |
| /api/community/all                  | GET    | Fetch all posts from all communities                   |
| /api/community/:communityName       | GET    | Fetch community's info                                 |
| /api/community/:communityName/posts | GET    | Fetch cursor-based paginated community posts           |
| /api/community/subscribe            | POST   | Subscribe to a community                               |

### Posts

| Endpoint                                  | Method | Description              |
| ----------------------------------------- | ------ | ------------------------ |
| /api/post/:communityName                  | POST   | Create a new post        |
| /api/post/:communityName/:postId          | GET    | Fetch a single post      |
| /api/post/:communityName/:postId/vote     | POST   | Upvote/Downvote a post   |
| /api/post/:communityName/:postId/comments | GET    | Fetch paginated comments |
| /api/post/:communityName/:postId/bookmark | POST   | Bookmark a post          |

### Comments

| Endpoint                                             | Method | Description                                  |
| ---------------------------------------------------- | ------ | -------------------------------------------- |
| /api/comment/:communityName/:postId/comment          | POST   | Create a comment                             |
| /api/comment/:communityName/:postId/:commentId/reply | POST   | Reply to an existing comment                 |
| /api/comment/:commentId/replies                      | GET    | Fetch paginated replies for a single comment |
| /api/comment/:commentId/vote                         | POST   | Upvote/Downvote a comment/reply              |

### User Management

| Endpoint                           | Method | Description                                   |
| ---------------------------------- | ------ | --------------------------------------------- |
| /api/user/communities              | GET    | Fetch user subscribed communities             |
| /api/user/:username                | GET    | Fetch user profile info                       |
| /api/user/:username/submittedPosts | GET    | Fetch user submitted posts                    |
| /api/user/:username/bookmarks      | GET    | Fetch user bookmarked posts                   |
| /api/user/:username/edit           | PATCH  | Update profile image of an authenticated user |

## Getting started

### 1. Clone the Repository

#### HTTPS

```bash
$ git clone https://github.com/amit-amsl/odin-book-backend.git
```

#### SSH

```bash
$ git clone git@github.com:amit-amsl/odin-book-backend.git
```

### 2. Install dependencies

```bash
cd odin-book-backend
npm install
```

### 3. Set up an account on [Cloudinary](https://www.cloudinary.com/)

Find the cloud name, API key and API secret associated with your account. They will be used as env variables in the next stage.

### 4. Set up environment variables

Create a .env file in the root directory of the project and add the following variables. Adjust the values according to your environment:

```shell
# Server
NODE_ENV=<production-or-development>

# Database
DATABASE_URL=<postgresql://<your-db-username>:<your-db-password>@db:5432/tidder_app?schema=public>

# JWT Auth
JWT_SECRET=<your-jwt-secret-min-32-chars>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloudinary-credentials>
CLOUDINARY_API_KEY=<your-cloudinary-credentials>
CLOUDINARY_API_SECRET=<your-cloudinary-credentials>

# Guest user credentials
GUEST_USER_EMAIL=<your-guest-user-email>
GUEST_USER_PASSWORD=<your-guest-user-password>

# Frontend
FRONTEND_URL=<your-frontend-app-url>
```

### 5. Set up a local development database

Open a terminal and create a new database in psql.

```bash
psql
CREATE DATABASE <your_database_name>;
# Connect to database
\c <your_database_name>
```

Open another terminal, cd to the project's directory and migrate the database schema.

```bash
npx prisma generate
npx prisma migrate dev
```

In the psql terminal, check that the schema has been successfully migrated over to the development db.

```bash
npx prisma migrate dev
```

### 6. Start development server

```bash
npm run dev
```

The API will be available at http://localhost:3000 by default.
Have fun!

### 7. Clone Tidder frontend repo (Optional)

You may want to clone and run [Tidder Frontend](https://github.com/amit-amsl/odin-book-frontend). This frontend application provides the user interface for accessing the API functionalities.

## Run with Docker

```bash
# Build and start services
docker compose up -d --build

# Stop services
docker-compose down
```

## Tech Stack

- **ExpressJS**: Fast, unopinionated, and minimalist web application framework for Node.js
- **TypeScript**: Typed superset of JavaScript.
- **Prisma**: Next-generation ORM (Object-Relational Mapper) designed for modern application development with Node.js and TypeScript.
- **Cloudinary**: Cloud based media management service.
- **jsonwebtoken**: Popular library for working with JWTs in Node.js. It provides a set of methods for creating, signing, and verifying JWTs.
- **Zod**: TypeScript-first schema declaration and validation library.
- **Multer**: A Node.js middleware designed to handle multipart/form-data, which is commonly used for file uploads in web applications.
- **Sharp**: High-speed Node.js module designed for image processing
- **Streamifier**: A library to convert a Buffer/String into a readable stream
- **bcryptJS**: JavaScript library that implements the bcrypt password hashing algorithm. Used to securely hash passwords before storing them in a database
- **date-fns**: Utility library designed for manipulating and formatting dates.

## Contributing:

Feel free to fork the repository and submit pull requests. Any contributions, whether they’re bug fixes, new features, or performance improvements, are always welcome.

## Disclaimer:

This project is built for educational purposes and is in no way affiliated with or endorsed by Reddit. Any resemblance to actual social media platforms, living or dead, is purely coincidental.
