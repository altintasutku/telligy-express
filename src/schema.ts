import { relations } from "drizzle-orm";
import { boolean, doublePrecision, integer, pgTable, primaryKey, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userDetails = pgTable("user_details", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  deleted: boolean("deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
})

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  bookLength: integer("book_length").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
});

export type InsertCategory = typeof categories.$inferInsert
export type SelectCategory = typeof categories.$inferSelect

export const categoriesRelations = relations(categories, ({many})=>({
  books: many(categoriesToBooks)
}))

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("book_title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  price: integer("book_price").notNull(),
  banner: text("banner_url").notNull(),
  discount: doublePrecision("discount").notNull(),
  pdf: text("pdf_url").notNull(),
  cover: text("cover_url").notNull(),
  currency: text("currency"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
  deleted: boolean("deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  pageCount: integer("page_count").notNull()
})

export type InsertBook = typeof books.$inferInsert
export type SelectBook = typeof books.$inferSelect

export const booksRelations = relations(books, ({many})=>({
  categories: many(categoriesToBooks),
  comments: many(comments)
}))

export const categoriesToBooks = pgTable("categories_to_books", {
  bookId: integer("book_id").notNull().references(()=>books.id),
  categoryId: integer("category_id").notNull().references(()=>categories.id),
}, (t)=>({
  pk: primaryKey({ columns: [t.categoryId, t.bookId] })
}))

export type InsertCategoriesToBooks = typeof categoriesToBooks.$inferInsert
export type SelectCategoriesToBooks = typeof categoriesToBooks.$inferSelect

export const categoriesToBooksRelations = relations(categoriesToBooks, ({one, many})=>({
  book: one(books,{
    fields:[categoriesToBooks.bookId],
    references:[books.id]
  }),
  category: one(categories,{
    fields:[categoriesToBooks.categoryId],
    references:[categories.id]
  })
}))


export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
});

export const membershipsRelations = relations(memberships,({many})=>({
  members: many(members)
}))

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productType: text("product_type").notNull(),
  userId: uuid("user_id").notNull(),
  content: text("text").notNull(),
  score: doublePrecision("score").notNull(),
  deleted: boolean("deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  membershipId: integer("membership_id").notNull().references(()=>memberships.id),
  userId: uuid("user_id").notNull(),
  lastPaymentAt: timestamp("last_payment_at").notNull(),
  nextPaymentAt: timestamp("next_payment_at").notNull(),
  canceled: boolean("canceled").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
})

export const membersRelations = relations(members, ({one})=>({
  membership: one(memberships,{
    fields:[members.membershipId],
    references:[memberships.id]
  })
}))

export const basket = pgTable("basket", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
})

export type InsertBasket = typeof basket.$inferInsert
export type SelectBasket = typeof basket.$inferSelect

export const basketRelations = relations(basket, ({many})=>({
  items: many(basketItems)
}))

export const basketItems = pgTable("basket_items", {
  id: serial("id").primaryKey(),
  basketId: integer("basket_id").notNull().references(()=>basket.id),
  productId: integer("product_id").notNull(),
  productType: text("product_type").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
})

export const basketItemsRelations = relations(basketItems, ({one})=>({
  basket: one(basket,{
    fields:[basketItems.basketId],
    references:[basket.id]
  }),
}))

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 256 }).notNull(),
  percentage: doublePrecision("discount").notNull(),
  userLimit: integer("user_limit").notNull().default(1),
  usageCount: integer("usage_count").notNull().default(0),
  deadline: timestamp("deadline").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().$onUpdate(()=> new Date()),
})