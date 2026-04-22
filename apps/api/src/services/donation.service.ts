import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import type {
  CreateDonationRequestInput,
  CreateDonationResponseInput,
  SendMessageInput,
} from "@dobrokot/shared";

// ─── Donation Requests ───────────────────────────────────

export async function createRequest(requesterId: string, data: CreateDonationRequestInput) {
  return prisma.donationRequest.create({
    data: { ...data, requesterId },
  });
}

export async function getRequests(filters: {
  status?: string;
  animalType?: string;
  bloodType?: string;
  page: number;
  limit: number;
}) {
  const { status, animalType, bloodType, page, limit } = filters;

  const where = {
    ...(status && { status: status as any }),
    ...(animalType && { animalType: animalType as any }),
    ...(bloodType && { bloodType }),
  };

  const [items, total] = await Promise.all([
    prisma.donationRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, city: true } },
        _count: { select: { responses: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    }),
    prisma.donationRequest.count({ where }),
  ]);

  return {
    items: items.map((r: typeof items[number]) => ({
      ...r,
      responsesCount: r._count.responses,
      _count: undefined,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRequest(requestId: string) {
  const request = await prisma.donationRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { id: true, name: true, city: true } },
      responses: {
        include: {
          donorAnimal: {
            include: {
              owner: { select: { id: true, name: true, city: true } },
            },
          },
        },
      },
    },
  });

  if (!request) throw new AppError(404, "Запрос не найден");
  return request;
}

export async function cancelRequest(requestId: string, userId: string) {
  const request = await prisma.donationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(404, "Запрос не найден");
  if (request.requesterId !== userId) throw new AppError(403, "Недостаточно прав");

  return prisma.donationRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
  });
}

// ─── Donation Responses ──────────────────────────────────

export async function createResponse(data: CreateDonationResponseInput) {
  const request = await prisma.donationRequest.findUnique({
    where: { id: data.requestId },
  });
  if (!request) throw new AppError(404, "Запрос не найден");
  if (request.status !== "OPEN" && request.status !== "IN_PROGRESS") {
    throw new AppError(400, "Запрос уже закрыт");
  }

  const animal = await prisma.animal.findUnique({ where: { id: data.donorAnimalId } });
  if (!animal) throw new AppError(404, "Животное не найдено");
  if (!animal.isDonor) throw new AppError(400, "Животное не зарегистрировано как донор");

  const response = await prisma.donationResponse.create({ data });

  // Update request status to IN_PROGRESS
  if (request.status === "OPEN") {
    await prisma.donationRequest.update({
      where: { id: data.requestId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return response;
}

export async function updateResponseStatus(
  responseId: string,
  userId: string,
  status: "ACCEPTED" | "REJECTED"
) {
  const response = await prisma.donationResponse.findUnique({
    where: { id: responseId },
    include: { request: true },
  });

  if (!response) throw new AppError(404, "Отклик не найден");
  if (response.request.requesterId !== userId) throw new AppError(403, "Недостаточно прав");

  const updated = await prisma.donationResponse.update({
    where: { id: responseId },
    data: { status },
  });

  if (status === "ACCEPTED") {
    await prisma.donationRequest.update({
      where: { id: response.requestId },
      data: { status: "FULFILLED" },
    });
  }

  return updated;
}

// ─── Messages ────────────────────────────────────────────

export async function sendMessage(senderId: string, data: SendMessageInput) {
  const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } });
  if (!receiver) throw new AppError(404, "Получатель не найден");

  return prisma.message.create({
    data: {
      senderId,
      receiverId: data.receiverId,
      content: data.content,
    },
  });
}

export async function getConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    }),
  ]);

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return { items: items.reverse(), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getConversations(userId: string) {
  // Get latest message with each user
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Group by conversation partner, keep latest message
  const conversationMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, msg);
    }
  }

  return Array.from(conversationMap.values());
}
