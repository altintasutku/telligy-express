import { Router } from "express";
import { deleteBasketItem, getBasket, insertBasket, insertBasketItem } from "../queries";
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

export default router;
