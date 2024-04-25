import { eq } from "drizzle-orm";
import db from "./db";
import {
  basket,
  books,
  categories,
  categoriesToBooks,
  type InsertBasket,
  type InsertBook,
  type InsertCategoriesToBooks,
  type InsertCategory,
  type SelectBasket,
  type SelectBook,
  type SelectCategoriesToBooks,
  type SelectCategory,
} from "./schema";

export const insertBook = async (book: InsertBook): Promise<SelectBook> => {
  const insertedBook = await db.insert(books).values(book).returning();

  return insertedBook[0];
};

export const getAllBooks = async (): Promise<SelectBook[]> => {
  const allBooks = await db.select().from(books);

  return allBooks;
};

export const insertCategory = async (
  category: InsertCategory
): Promise<SelectCategory> => {
  let existingCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.name, category.name));

  if (existingCategory.length > 0) {
    existingCategory = await db
      .update(categories)
      .set({
        bookLength: existingCategory[0].bookLength + 1,
      })
      .where(eq(categories.id, existingCategory[0].id))
      .returning();

    return existingCategory[0];
  }

  const insertedCategory = await db
    .insert(categories)
    .values({ ...category, bookLength: 1 })
    .returning();

  return insertedCategory[0];
};

export const insertCategoryToBook = async (
  data: InsertCategoriesToBooks
): Promise<SelectCategoriesToBooks> => {
  const insertedCategoryToBook = await db
    .insert(categoriesToBooks)
    .values(data)
    .returning();

  return insertedCategoryToBook[0];
};

export const insertBasket = async (
  data: InsertBasket
): Promise<SelectBasket> => {
  const existingBasket = await db
    .select()
    .from(basket)
    .where(eq(basket.userId, data.userId));

  if (existingBasket.length > 0) {
    return existingBasket[0];
  }

  const insertedBasket = await db.insert(basket).values(data).returning();

  return insertedBasket[0];
};

export const getBasket = async (id: number) => {
  const data = await db.query.basket.findFirst({
    where: eq(basket.id, id),
    with: {
      items: true,
    },
  });

  return data;
};
