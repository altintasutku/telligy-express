import axios from "axios";
import { Router } from "express";
import { env } from "../../env.mjs";

const router = Router();

router.post("/test", async (req, res) => {
  const iyzicoRes = await axios.get(`${env.IYZICO_URL}/payment/test`);

  res.json(iyzicoRes.data);
});

router.post("/checkoutform", async (req, res) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const randomNumber = Math.floor(Math.random() * 10000).toString();
  headers.append("x-iyzi-rnd", randomNumber);

  // const data = {
  //   locale: "tr",
  //   conversationId: "123456789",
  //   price: "1.0",
  //   basketId: "B67832",
  //   paymentGroup: "PRODUCT",
  //   buyer: {
  //     id: "BY789",
  //     name: "John",
  //     surname: "Doe",
  //     identityNumber: "74300864791",
  //     email: "email@email.com",
  //     gsmNumber: "+905350000000",
  //     registrationDate: "2013-04-21 15:12:09",
  //     lastLoginDate: "2015-10-05 12:43:35",
  //     registrationAddress: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
  //     city: "Istanbul",
  //     country: "Turkey",
  //     zipCode: "34732",
  //     ip: "85.34.78.112",
  //   },
  //   shippingAddress: {
  //     address: "",
  //     zipCode: "",
  //     contactName: "",
  //     city: "",
  //     country: "",
  //   },
  //   billingAddress: req.body.billingAddress,
  //   basketItems: req.body.basketItems,
  //   enabledInstallments: [1],
  //   callbackUrl: "https://www.merchant.com/callback",
  //   currency: "TRY",
  //   paidPrice: "1.2",
  // };

  // headers.append("Authorization", createAuthHeaders());
});

export default router;
