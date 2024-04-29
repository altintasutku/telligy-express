import { Router } from "express";
import { insertUserDetails } from "../queries";

const router = Router();

router.post("/", async (req, res) => {
  const { displayName, userId } = req.body as {
    displayName: string;
    userId: string;
  };

  if (!displayName) {
    return res.status(400).json({ message: "displayName is required" });
  }

  const user = await insertUserDetails({ displayName, userId });

  res.status(201).json(user);
});

export default router;
