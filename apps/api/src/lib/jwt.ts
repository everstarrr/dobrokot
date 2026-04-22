import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import type { UserRole } from "@dobrokot/shared";
import { config } from "../config";

interface TokenPayload {
  userId: string;
  role: UserRole;
}

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret as Secret, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret as Secret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret as Secret) as TokenPayload;
}
