import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAnimalSchema, updateAnimalSchema, searchDonorsSchema } from "@dobrokot/shared";
import * as ctrl from "../controllers/animals.controller";

export const animalsRouter: RouterType = Router();

animalsRouter.get("/donors", validate(searchDonorsSchema, "query"), ctrl.searchDonors);
animalsRouter.get("/mine", authenticate, ctrl.getMine);
animalsRouter.get("/:id", ctrl.getOne);
animalsRouter.post("/", authenticate, validate(createAnimalSchema), ctrl.create);
animalsRouter.patch("/:id", authenticate, validate(updateAnimalSchema), ctrl.update);
animalsRouter.delete("/:id", authenticate, ctrl.remove);
