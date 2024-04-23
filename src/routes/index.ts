import book from "./book";
import { Router } from "express"; 

const router = Router();

// router.use("/payment", payment);
router.use("/book", book);

export default router