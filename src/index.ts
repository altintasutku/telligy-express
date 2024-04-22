import express from "express";
import { env } from "../env.mjs";
import db from "./db";
import { books, categories, categoriesToBooks } from "./schema";
import cors from "cors";
import http from "http";
import { protectedMiddleware } from "./middlewares/auth";

const app = express();
const server = http.createServer(app);

//Express Body Middleware
app.use(express.json());
app.use(cors())

app.get("/", protectedMiddleware , async (req, res) => {
  const data = await db.query.categories.findMany({
    with: {
      books: true,
    },
  });

  res.json(data);
});

app.post("/books", async (req, res) => {
  const book = await db.insert(books).values(req.body).returning();
  const category = await db.insert(categories).values(req.body.categories[0]).returning();

  const categoryToBook = await db.insert(categoriesToBooks).values({
    bookId: book[0].id,
    categoryId: category[0].id,
  }).returning();

  res.json({ book, category, categoryToBook });
})

server.listen(env.PORT, () => {
  console.log("Server is running on http://localhost:" + env.PORT);
});
