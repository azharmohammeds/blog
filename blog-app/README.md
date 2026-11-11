# BlogApp – Full Stack Blog Application

A responsive blog platform with user accounts, JWT authentication, and full CRUD.

## Features
- Register / login with hashed passwords (bcrypt) and JWT auth
- Create, read, update, delete blogs (only the author can edit or delete)
- Public home page with search and category filter
- Protected dashboard showing only your blogs, plus profile and logout
- Mobile-responsive UI

## Tech Stack
HTML, CSS, vanilla JavaScript · Node.js, Express · MongoDB (Mongoose) · JWT, bcryptjs

## Project Structure
```
server.js          Express entry point
models/            User and Blog schemas
routes/            auth.js, blogs.js (REST APIs)
middleware/auth.js JWT verification
public/            Frontend pages, CSS, JS
```

## Run Locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `JWT_SECRET`
3. `npm run dev` then open http://localhost:5000

## API
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Login, returns JWT |
| GET | /api/auth/me | ✔ | Current user profile |
| GET | /api/blogs?search=&category= | – | List all blogs |
| GET | /api/blogs/mine | ✔ | Logged-in user's blogs |
| GET | /api/blogs/:id | – | Single blog |
| POST | /api/blogs | ✔ | Create blog |
| PUT | /api/blogs/:id | ✔ (owner) | Update blog |
| DELETE | /api/blogs/:id | ✔ (owner) | Delete blog |

## Deploy on Render
1. Push the repo to GitHub.
2. In MongoDB Atlas, create a free cluster, a database user, and allow network access (0.0.0.0/0 for testing).
3. On Render: New → Web Service → connect the repo.
   Build command: `npm install` · Start command: `npm start`
4. Add environment variables `MONGO_URI` and `JWT_SECRET`.
5. Deploy and open the generated URL.

## Future Improvements
Pagination, comments, image uploads, rich-text editor.
