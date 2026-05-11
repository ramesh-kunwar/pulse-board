import crypto from "crypto";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema.js";
import { db } from "../../index.js";
import ApiError from "../../common/utils/api-error.js";
import { RegisterDto } from "./dto/register.dto.js";
import bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import jwt from "jsonwebtoken";
// import { generateResetToken } from "../../common/utils/jwt.utils.js";
const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const register = async ({
  firstName,
  lastName,
  email,
  password,
  avatar,
}: RegisterDto) => {
  // check for exsisting user
  //   const user = await db.select("users").from("users")

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  console.log("aaab");
  if (existingUser && existingUser.length > 0) {
    throw ApiError.badRequest("Email Already exists");
  }
  console.log("bbb");

  const hashedPassword = await bcrypt.hash(password, 10);

  // const { hashedToken } = generateResetToken();
  const user = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      avatar,
      //   verificationToken: hashedToken,
    })
    .returning({
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      avatar: usersTable.avatar,
    });

  return user[0];

  // send user mail later on
};

export const login = async ({ email, password }: LoginDto) => {
  // find user email
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const user = users[0];
  if (!user) {
    throw ApiError.unauthorized("Invalid Credentials");
  }

  const isMatchedPassword = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!isMatchedPassword) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const accessToken = generateAccessToken({ id: user.id });

  const refreshToken = generateRefreshToken({ id: user.id });

  await db
    .update(usersTable)
    .set({ refreshToken: hashToken(refreshToken) })
    .where(eq(usersTable.email, email));

  return {
    user: { id: user.id, firstName: user.firstName, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id));
    const user = users[0];

    if (hashToken(refreshToken) !== user?.refreshToken) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const accessToken = generateAccessToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await db
      .update(usersTable)
      .set({ refreshToken: hashToken(newRefreshToken) })
      .where(eq(usersTable.id, decoded.id));

    return {
      user: { id: user.id, firstName: user.firstName, email: user.email },
      accessToken,
      newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid refreshtoken");
    }
    throw error;
  }
};

export const getMe = async (userId: string) => {
  const users = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  const user = users[0];

  return user;
};

export const logout = async (userId: string) => {
  await db
    .update(usersTable)
    .set({ refreshToken: null })
    .where(eq(usersTable.id, userId));
};
