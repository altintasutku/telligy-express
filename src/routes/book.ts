import { books, categories, categoriesToBooks } from './../schema';
import { Router } from "express";
import { uploadBookStateValidator } from "../lib/validators/book";
import { getAllBooks, insertBook, insertCategory, insertCategoryToBook } from "../queries";
import db from '../db';
import { eq } from 'drizzle-orm';

const router = Router();

router.post("/", async (req, res) => {
  const { success, data, error } = uploadBookStateValidator.safeParse(req.body);

  if (!success || !data) {
    return res.status(400).json({ error });
  }

  const book = await insertBook(data.infos);

  const categories = await Promise.all(
    data.categories.map((category) => insertCategory(category))
  );

  const categoriesToBooks = await Promise.all(
    categories.map((category) =>
      insertCategoryToBook({
        categoryId: category.id,
        bookId: book.id,
      })
    )
  );

  return res.status(201).json({ book, categories, categoriesToBooks });
});

router.get("/", async (req, res) => {
  const allBooks = await getAllBooks();

  return res.status(200).json(allBooks);
});

router.get("/:id", async (req, res) => {
  if(!req.params.id || isNaN(parseInt(req.params.id))) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const book = await db.query.books.findFirst({
    where: eq(books.id, parseInt(req.params.id)),
    with: {
      categories: true,
    },
  });

  return res.status(200).json(book);
})

export default router;
