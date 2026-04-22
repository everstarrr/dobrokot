import { Router, type Router as RouterType } from "express";
import { authRouter } from "./auth.routes";
import { usersRouter } from "./users.routes";
import { animalsRouter } from "./animals.routes";
import { donationsRouter } from "./donations.routes";
import { donorsRouter, partnersRouter } from "./partners.routes";

export const router: RouterType = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/animals", animalsRouter);
router.use("/donations", donationsRouter);
router.use("/partners", partnersRouter);
router.use("/donors", donorsRouter);
