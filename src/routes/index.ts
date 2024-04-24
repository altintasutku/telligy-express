import { protectedRoute } from "../middlewares/auth";
import book from "./book";
import { Router } from "express"; 

const router = Router();

// router.use("/payment", payment);
router.use("/book", protectedRoute, book);

export default router