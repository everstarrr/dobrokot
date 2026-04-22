import { Request, Response, NextFunction } from "express";
import * as animalService from "../services/animal.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const animal = await animalService.createAnimal(req.userId!, req.body);
    res.status(201).json({ success: true, data: animal });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const animal = await animalService.getAnimal(req.params.id as string);
    res.json({ success: true, data: animal });
  } catch (err) {
    next(err);
  }
}

export async function getMine(req: Request, res: Response, next: NextFunction) {
  try {
    const animals = await animalService.getUserAnimals(req.userId!);
    res.json({ success: true, data: animals });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const animal = await animalService.updateAnimal(req.params.id as string, req.userId!, req.body);
    res.json({ success: true, data: animal });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await animalService.deleteAnimal(req.params.id as string, req.userId!);
    res.json({ success: true, message: "Животное удалено" });
  } catch (err) {
    next(err);
  }
}

export async function searchDonors(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await animalService.searchDonors(req.query as any);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
