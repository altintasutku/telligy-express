import { Router } from "express";
import {
  deleteBasketItem,
  getBasket,
  insertBasket,
  insertBasketItem,
} from "../queries";
import db from "../db";
import { and, eq } from "drizzle-orm";
import { basket, basketItems } from "../schema";

const router = Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const basket = await insertBasket({
    userId: req.user,
  });

  const data = await getBasket(basket.id);

  return res.status(201).json(data);
});

router.post("/add-item", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const item = await insertBasketItem(req.body, req.user);

  return res.status(201).json(item);
});

router.delete("/remove-item/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.params.id || isNaN(parseInt(req.params.id))) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const id = parseInt(req.params.id);
  const item = await deleteBasketItem(id);

  return res.status(200).json(item);
});

router.delete("/clear", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const usersBasket = await db.query.basket.findFirst({
    where: eq(basket.userId, req.user),
  });

  if(!usersBasket) {
    return res.status(404).json({
      message: "Basket not found",
      success: false,
    });
  }

  await db.delete(basketItems).where(eq(basketItems.basketId, usersBasket.id));

  try {
    await db
    .delete(basket)
    .where(eq(basket.userId, req.user))
  } catch (error) {
    console.error(error);
    
    return res.status(500).json({
      message: "Error clearing basket",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Basket cleared",
    success: true,
  });
});

router.get("/has-item/:producttype/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.params.id || isNaN(parseInt(req.params.id as string))) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const id = parseInt(req.params.id as string);

  if (!req.params.producttype) {
    return res.status(400).json({ message: "Invalid product type" });
  }
  const productType = req.params.producttype;

  const data = await db.query.basket.findFirst({
    where: eq(basket.userId, req.user),
    with: {
      items: {
        where: and(
          eq(basketItems.productId, id),
          eq(basketItems.productType, productType)
        ),
      },
    },
  });

  return res.status(200).json({
    hasItem: data?.items?.length ? true : false,
  });
})

export default router;
