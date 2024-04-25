import { protectedRoute } from "../middlewares/auth";
import book from "./book";
import basket from "./basket";
import { Router } from "express"; 

const router = Router();

// router.use("/payment", payment);
router.use("/book", protectedRoute, book);
router.use("/basket", protectedRoute, basket);

export default router