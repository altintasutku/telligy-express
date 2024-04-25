import { Router } from "express"; 
import { getBasket, insertBasket } from "../queries";

const router = Router();

router.get("/", async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const basket = await insertBasket({
        userId: req.user,
    });

    const data = await getBasket(basket.id);

    return res.status(201).json(data);
})


export default router