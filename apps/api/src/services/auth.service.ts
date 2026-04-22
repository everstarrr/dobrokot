import bcrypt from "bcrypt";
import { UserRole } from "@dobrokot/shared";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";
import { AppError } from "../middleware/errorHandler";
import type { RegisterInput, LoginInput } from "@dobrokot/shared";

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "Пользователь с таким email уже существует");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role: input.role,
      city: input.city,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const tokens = await generateTokens(user.id, user.role as UserRole);

  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  if (!user) {
    throw new AppError(401, "Неверный email или пароль");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Неверный email или пароль");
  }

  const { passwordHash: _, ...safeUser } = user;
  const tokens = await generateTokens(user.id, user.role as UserRole);

  return { user: safeUser, ...tokens };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new AppError(401, "Недействительный refresh токен");
  }

  // Verify JWT signature too
  try {
    verifyToken(refreshToken);
  } catch {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError(401, "Недействительный refresh токен");
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  return generateTokens(stored.user.id, stored.user.role as UserRole);
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

async function generateTokens(userId: string, role: UserRole) {
  const accessToken = signAccessToken({ userId, role });
  const refreshTokenValue = signRefreshToken({ userId, role });

  // Parse refresh expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: refreshTokenValue };
}
