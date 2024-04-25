import { Router } from "express";
import {
  getAllCategories,
  getBookById,
  getBookIdsBelongToCategory,
} from "../queries";
import { promise } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  const categories = await getAllCategories();

  return res.status(200).json(categories);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const books = await getBookIdsBelongToCategory(id);

  const booksBelongToCategory = await Promise.all(
    books.map((bookId) => getBookById(bookId))
  );

  return res.status(200).json(booksBelongToCategory);
});

export default router;
