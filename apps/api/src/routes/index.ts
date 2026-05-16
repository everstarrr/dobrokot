import { Router, type Router as RouterType } from "express";
import { authRouter } from "./auth.routes";
import { usersRouter } from "./users.routes";
import { donorsRouter, partnersRouter } from "./partners.routes";
import { bloodRouter, clinicsPublicRouter } from "./blood.routes";
import { subscriptionRouter } from "./subscription.routes";
import { partnershipRouter } from "./partnership.routes";
import { clinicRouter } from "./clinic.routes";
import { adminRouter } from "./admin.routes";

export const router: RouterType = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/partners", partnersRouter);
router.use("/donors", donorsRouter);
router.use("/blood", bloodRouter);
router.use("/clinics", clinicsPublicRouter);
router.use("/clinic", clinicRouter);
router.use("/subscription", subscriptionRouter);
router.use("/partnership", partnershipRouter);
router.use("/admin", adminRouter);
