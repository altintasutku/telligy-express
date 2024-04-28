import axios from "axios";
import { Router } from "express";
import { env } from "../../env.mjs";
import { eq } from "drizzle-orm";
import { basket, basketItems, purchasedProducts } from "../schema";
import db from "../db";

const router = Router();

router.post("/test", async (req, res) => {
  const iyzicoRes = await axios.get(`${env.IYZICO_URL}/payment/test`);

  res.json(iyzicoRes.data);
});

router.post("/confirm", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const usersBasket = await db.query.basket.findFirst({
    where: eq(basket.userId, req.user),
    with: {
      items: true,
    },
  });

  if (!usersBasket) {
    return res.status(404).json({ message: "Basket not found" });
  }

  const userPurchased = await Promise.all(
    usersBasket.items.map(async (item) => {
      return (
        await db
          .insert(purchasedProducts)
          .values({
            productId: item.productId,
            productType: item.productType,
            userId: req.user as string,
          })
          .returning()
      )[0];
    })
  );

  await db.delete(basketItems).where(eq(basketItems.basketId, usersBasket.id));
  await db.delete(basket).where(eq(basket.userId, req.user));

  res.json(userPurchased);
});

export default router;
