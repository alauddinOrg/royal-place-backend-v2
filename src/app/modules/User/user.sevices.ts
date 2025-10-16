import { envVariable } from "../../config";
import { AppError } from "../../error/appError";
import { logger } from "../../utils/logger";
import { IUpdateUserInput, IUser, IUserQueryparams } from "./user.interface";

import jwt from "jsonwebtoken";
import UserModel from "./user.schema";
import sanitize from "mongo-sanitize";

//======================================================== Registration ===================================================================
const registerUserIntoDb = async (body: IUser) => {
  const cleanBody = sanitize(body);

  // Check if user already exists by email
  const isUserExist = await UserModel.findOne({ email: cleanBody.email });

  if (isUserExist) {
    logger.warn("⚠️ Registration failed: User already exists");
    throw new AppError("User already exists!", 400);
  }

  // Create new user - password hashing automatically handled by pre('save') middleware
  const newUser = await UserModel.create(cleanBody);

  logger.info(`✅ New user registered: ${newUser.email}`);
  return newUser;
};

// ============================================ Login user ==============================================
const loginUserByEmail = async (email: string) => {
  const cleanEmail = sanitize(email);

  const isUserExist = await UserModel.findOne({ email: cleanEmail });

  if (!isUserExist) {
    throw new AppError("User does not exist!", 404);
  }

  return isUserExist;
};

//================================ Find single user =============================================
const findUserById = async (id: string) => {
  const cleanId = sanitize(id);

  const user = await UserModel.findById(cleanId);

  if (!user) {
    throw new AppError("User not found!", 404);
  }

  return user;
};



// ===================================================== Find all users ==========================================

const getAllUsers = async (queryParams: IUserQueryparams) => {

  const { page, searchTerm, limit } = queryParams;

  const skip = (Number(page) - 1) * Number(limit)
  const filters: any = {};

  if (searchTerm) {
    filters.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone: { $regex: searchTerm, $options: "i" } }
    ]
  }



  
  const users = await UserModel.find(filters).sort({ createdAt: -1 }); // latest first

  const  paginatedAvailableUsers=users.slice(skip,skip+Number(limit))
  return {
     meta: {
      total: paginatedAvailableUsers.length,
      page: Number(page),
      limit: Number(limit),
    },
    data: paginatedAvailableUsers,
  }
};

// ===================================================== Delete user ===============================================
const deleteUserById = async (id: string) => {
  const cleanId = sanitize(id);

  // Find the user by ID
  const user = await UserModel.findById(cleanId);

  if (!user) {
    throw new AppError("Failed to delete user. User not found!", 404);
  }

  // Soft delete: set isDeleted = true
  user.isDeleted = true;

  await user.save();

  return user;
};

//=========================================== Update user ===========================================================
const updateUserById = async (id: string, updateData: IUpdateUserInput) => {
  const cleanId = sanitize(id);
  const cleanUpdateData = sanitize(updateData);
  
  // Only update if the user exists and is not soft deleted
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: cleanId, isDeleted: false },
    cleanUpdateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new AppError("User not found or has been deleted!", 404);
  }

  return updatedUser;
};

// ====================================================== Refresh token ==============================================

interface JwtDecodedPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const requestRefreshToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      envVariable.JWT_REFRESH_TOKEN_SECRET as string
    ) as JwtDecodedPayload;

    const user = await UserModel.findById(decoded.id);
    if (!user) throw new AppError("User not found", 404);

    return user;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401);
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token", 401);
    }
    throw err; // fallback for unexpected errors
  }
};
// ============================== Export Services ==========================================================
export const userServices = {
  registerUserIntoDb,
  loginUserByEmail,
  findUserById,
  getAllUsers,
  deleteUserById,
  updateUserById,
 requestRefreshToken ,
};
