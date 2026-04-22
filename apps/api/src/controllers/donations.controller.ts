import { Request, Response, NextFunction } from "express";
import * as donationService from "../services/donation.service";

// ─── Requests ────────────────────────────────────────────

export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await donationService.createRequest(req.userId!, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function getRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, animalType, bloodType, page = "1", limit = "10" } = req.query;
    const result = await donationService.getRequests({
      status: status as string | undefined,
      animalType: animalType as string | undefined,
      bloodType: bloodType as string | undefined,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await donationService.getRequest(req.params.id as string);
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function cancelRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await donationService.cancelRequest(req.params.id as string, req.userId!);
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

// ─── Responses ───────────────────────────────────────────

export async function createResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await donationService.createResponse(req.body);
    res.status(201).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function updateResponseStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const response = await donationService.updateResponseStatus(req.params.id as string, req.userId!, status);
    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

// ─── Messages ────────────────────────────────────────────

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await donationService.sendMessage(req.userId!, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const conversations = await donationService.getConversations(req.userId!);
    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "50" } = req.query;
    const result = await donationService.getConversation(
      req.userId!,
      req.params.userId as string,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
