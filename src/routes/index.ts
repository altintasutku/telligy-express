import { protectedRoute } from "../middlewares/auth";
import category from "./category";
import book from "./book";
import basket from "./basket";
import product from "./product";
import payment from "./payment";
import user from "./user";
import { Router } from "express"; 

const router = Router();

router.use("/payment", protectedRoute, payment);
router.use("/book", protectedRoute, book);
router.use("/basket", protectedRoute, basket);
router.use("/product", protectedRoute, product);
router.use("/category", protectedRoute, category);
router.use("/user", user);

export default router;
