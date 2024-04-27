import { Router } from "express";
import db from "../db";
import { and, eq } from "drizzle-orm";
import { basket, basketItems } from "../schema";

const router = Router();

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
  });

export default router;
