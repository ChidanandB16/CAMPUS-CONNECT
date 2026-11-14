import { RequestHandler } from "express";
import { User } from "../models/User";
import { sendResponse } from "../utils/responseHandler";

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    sendResponse(res, 200, true, "Users fetched successfully", users);
    return;
  } catch (error) {
    sendResponse(res, 500, false, "Failed to fetch users", null);
    return;
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      sendResponse(res, 404, false, "User not found", null);
      return;
    }
    sendResponse(res, 200, true, "User fetched successfully", user);
    return;
  } catch (error) {
    sendResponse(res, 500, false, "Failed to fetch user", null);
    return;
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  // Defense in depth: the route authenticates, but never trust mounting alone.
  if (!req.user) {
    sendResponse(res, 401, false, "Unauthorized", null);
    return;
  }

  const isAdmin = req.user.role === "admin";
  const isSelf = req.user.userId === id;

  if (!isAdmin && !isSelf) {
    sendResponse(res, 403, false, "You can only update your own profile", null);
    return;
  }

  if (role !== undefined && !isAdmin) {
    sendResponse(res, 403, false, "Only admins can change roles", null);
    return;
  }

  // Build the update explicitly so callers can't set arbitrary fields
  // and absent body fields never overwrite stored values.
  const update: Record<string, string> = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (role !== undefined && isAdmin) update.role = role;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      sendResponse(res, 404, false, "User not found", null);
      return;
    }

    sendResponse(res, 200, true, "User successfully updated", updatedUser);
    return;
  } catch (error) {
    sendResponse(res, 500, false, "Server error", null);
    return;
  }
};
