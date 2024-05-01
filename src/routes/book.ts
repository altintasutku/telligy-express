import {
  books,
  categories,
  categoriesToBooks,
  purchasedProducts,
} from "./../schema";
import { Router } from "express";
import { uploadBookStateValidator } from "../lib/validators/book";
import {
  getAllBooks,
  insertBook,
  insertCategory,
  insertCategoryToBook,
} from "../queries";
import db from "../db";
import { and, eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { success, data, error } = uploadBookStateValidator.safeParse({
    ...req.body,
    authorId: req.user,
  });

  if (!success || !data) {
    return res.status(400).json({ error });
  }

  const book = await insertBook(data);

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
  const query = req.query.search || null;
  const allBooks = await getAllBooks(query as string | null);

  return res.status(200).json(allBooks);
});

router.get("/my-books", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const purchased = await db.query.purchasedProducts.findMany({
    where: and(
      eq(purchasedProducts.productType, "book"),
      eq(purchasedProducts.userId, req.user)
    ),
  });

  const myBooks = await Promise.all(
    purchased.map(async (p) => {
      return await db.query.books.findFirst({
        where: eq(books.id, p.productId),
        with: {
          categories: true,
        },
      });
    })
  );

  return res.status(200).json(myBooks);
});

router.get("/has-book/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.params.id || isNaN(parseInt(req.params.id))) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const hasBook = await db.query.purchasedProducts.findFirst({
    where: and(
      eq(purchasedProducts.productId, parseInt(req.params.id)),
      eq(purchasedProducts.productType, "book"),
      eq(purchasedProducts.userId, req.user)
    ),
  });

  return res.status(200).json({ hasBook: !!hasBook, data: hasBook });
});

router.get("/:id", async (req, res) => {
  if (!req.params.id || isNaN(parseInt(req.params.id))) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const book = await db.query.books.findFirst({
    where: eq(books.id, parseInt(req.params.id)),
    with: {
      categories: true,
    },
  });

  return res.status(200).json(book);
});

export default router;
