import { protectedRoute } from "../middlewares/auth";
import category from "./category";
import book from "./book";
import { Router } from "express";

const router = Router();

// router.use("/payment", payment);
router.use("/book", protectedRoute, book);
router.use("/category", protectedRoute, category);

export default router;
