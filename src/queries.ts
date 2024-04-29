import { and, eq } from "drizzle-orm";
import db from "./db";
import {
  basket,
  basketItems,
  books,
  categories,
  categoriesToBooks,
  userDetails,
  type InsertBasket,
  type InsertBasketItem,
  type InsertBook,
  type InsertCategoriesToBooks,
  type InsertCategory,
  type InsertUserDetails,
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
  const allBooks = await db.query.books.findMany({
    with: {
      categories: true,
    },
  });

  return allBooks;
};

export const getBookById = async (id: number): Promise<SelectBook> => {
  const book = await db.select().from(books).where(eq(books.id, id));

  return book[0];
};

export const getAllCategories = async (): Promise<SelectCategory[]> => {
  const allCategories = await db.select().from(categories);

  return allCategories;
};

export const getBookIdsBelongToCategory = async (
  categoryId: number
): Promise<number[]> => {
  const booksBelongToCategory = await db
    .select()
    .from(categoriesToBooks)
    .where(eq(categoriesToBooks.categoryId, categoryId));

  return booksBelongToCategory.map((categoryToBook) => categoryToBook.bookId);
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

export const insertBasketItem = async (
  data: InsertBasketItem,
  userId: string
) => {
  let usersBasket = await db.query.basket.findFirst({
    where: eq(basket.userId, userId),
  });

  if (!usersBasket) {
    usersBasket = await insertBasket({
      userId,
    });
  }

  data.basketId = usersBasket.id;

  const insertedItem = await db.insert(basketItems).values(data).returning();

  return insertedItem[0];
};

export const deleteBasketItem = async (id: number) => {
  const item = await db
    .delete(basketItems)
    .where(and(eq(basketItems.id, id)))
    .returning();

  return item;
};

export const insertUserDetails = async (data:InsertUserDetails) => {
  const res = await db.insert(userDetails).values(data).returning();
  return res[0];
}