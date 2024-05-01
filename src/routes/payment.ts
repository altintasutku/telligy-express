import { categories, conversationData } from "./../schema";
import axios from "axios";
import { Router } from "express";
import { env } from "../../env.mjs";
import { eq } from "drizzle-orm";
import {
  basket,
  basketItems,
  books,
  purchasedProducts,
  userDetails,
  type SelectBook,
} from "../schema";
import db from "../db";
import { iyzipay } from "../lib/payment";
import Iyzipay from "iyzipay";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { protectedRoute } from "../middlewares/auth";

const router = Router();

router.post("/test",protectedRoute , async (req, res) => {
  const iyzicoRes = await axios.get(`${env.IYZICO_URL}/payment/test`);

  res.json(iyzicoRes.data);
});

router.post("/pay", protectedRoute, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const usersBasket = await db.query.basket.findFirst({
    where: eq(basket.userId, req.userId),
    with: {
      items: true,
    },
  });

  if (!usersBasket) {
    return res.status(404).json({ message: "Basket not found" });
  }

  const items = await Promise.all(
    usersBasket.items.map(async (item) => {
      return await db.query.books.findFirst({
        where: eq(books.id, item.productId),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
        },
      });
    })
  );

  const userDetail = await db.query.userDetails.findFirst({
    where: eq(userDetails.userId, req.userId),
  });

  if (!userDetail) {
    return res.status(404).json({ message: "User details not found" });
  }

  const price = items.reduce((acc, item) => acc + item!.price, 0);
  const conversationId = uuidv4();

  iyzipay.checkoutFormInitialize.create(
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: items.reduce((acc, item) => acc + item!.price, 0),
      basketId: usersBasket.id.toString(),
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      buyer: {
        id: userDetail.id.toString(),
        name: userDetail.displayName,
        surname: userDetail.displayName,
        identityNumber: "11111111111",
        email: req.user.email,
        gsmNumber: req.user.phone,
        registrationAddress:
          "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        lastLoginDate: moment(userDetail.updated_at).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        zipCode: "34732",
        registrationDate: moment(userDetail.created_at).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        city: "Istanbul",
        country: "Turkey",
        ip: req.ip || "undefined",
      },
      shippingAddress: {
        address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        zipCode: "34742",
        contactName: "Jane Doe",
        city: "Istanbul",
        country: "Turkey",
      },
      billingAddress: {
        address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        zipCode: "34742",
        contactName: "Jane Doe",
        city: "Istanbul",
        country: "Turkey",
      },
      basketItems: items.map((item) => {
        return {
          id: item!.id.toString(),
          category1: item!.categories[0]
            ? item!.categories[0].category.name
            : "Kitap",
          category2: item!.categories[1]
            ? item!.categories[1].category.name
            : "Kitap",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: item!.price,
          name: item!.title,
        };
      }),
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      callbackUrl: `${env.API_URL}/payment/confirm/${conversationId}`,
      paymentCard: {
        cardHolderName: "John Doe",
        cardNumber: "5528790000000008",
        expireMonth: "12",
        expireYear: "2030",
        cvc: "123",
        registerCard: 0,
        cardAlias: "card alias",
        cardUserKey: "card user key",
      },
      installments: 1,
    },
    async (err, result) => {
      if (err) {
        return res.status(400).json(err);
      }

      const data = await db.query.conversationData.findFirst({
        where: eq(conversationData.userId, req.userId!),
      });

      if (data) {
        await db
          .delete(conversationData)
          .where(eq(conversationData.userId, req.userId!));
      }

      await db.insert(conversationData).values({
        conversationId: conversationId,
        value: result.token,
        userId: req.userId!,
      });

      res.json(result);
    }
  );
});

router.post("/confirm/:conversationId", async (req, res) => {
  const conversationId = req.params.conversationId;
  const data = await db.query.conversationData.findFirst({
    where: eq(conversationData.conversationId, conversationId),
  });

  if (!data) {
    return res.status(404).json({ message: "Token not found" });
  }

  iyzipay.checkoutForm.retrieve(
    {
      token: data.value,
      locale: Iyzipay.LOCALE.TR,
      conversationId: data.conversationId,
    },
    async (err, result) => {
      if (err) {
        return res.status(400).json(err);
      }

      if (result.status !== "success") {
        return res.status(400).json(result);
      }

      const usersBasket = await db.query.basket.findFirst({
        where: eq(basket.userId, data.userId),
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
                userId: data.userId as string,
              })
              .returning()
          )[0];
        })
      );

      await db
        .delete(basketItems)
        .where(eq(basketItems.basketId, usersBasket.id));
      await db.delete(basket).where(eq(basket.userId,data.userId));
      await db
        .delete(conversationData)
        .where(eq(conversationData.conversationId, data.conversationId));

      res.redirect(`${env.WEB_URL}/payment/success`);
    }
  );
});

export default router;
