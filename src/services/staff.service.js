import db from "../config/db.js";
import StaffModel from "../models/staff.model.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import cloudinary from "../config/cloudinary.js";
import extractCloudinaryPublicId from "../utils/extractCloudinaryPublicId.js";

export const getAllStaff = async (search, role) => {
  return await StaffModel.findAll(search, role);
};

export const getStaffDetails = async (staffId) => {
  return await StaffModel.findById(undefined, staffId);
};

export const addStaff = async (requester, staffData) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (requester.role !== "Manager") {
      throw new AppError("Unauthorized - Manager only can add staff", 403);
    }

    const { name, email, role, status } = staffData;
    let { imageUrl } = staffData;

    const response = await cloudinary.uploader.upload(imageUrl, {
      folder: "cotamila_staffs",
    });
    imageUrl = response.secure_url;

    const password = name; // Todo: temporary password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const emailExists = await StaffModel.findByEmail(client, email);
    if (emailExists) throw new AppError("Email already exists", 409);

    let roleRecord = await StaffModel.findRoleByName(client, role);
    if (!roleRecord) {
      roleRecord = await StaffModel.createRole(client, role, "");
    }

    const newStaff = await StaffModel.createStaff(
      client,
      name,
      email,
      hashPassword,
      roleRecord.roleId,
      status,
      imageUrl,
    );

    const staff = await StaffModel.findById(client, newStaff.staffId);

    await client.query("COMMIT");
    return staff;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateStaff = async (staffId, requester, staffData) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (requester.role !== "Manager") {
      throw new AppError("Unauthorized - Manager only can update staff", 403);
    }

    const { name, email, role, status } = staffData;
    let { imageUrl } = staffData;

    const staff = await StaffModel.findById(client, staffId);
    if (!staff) throw new AppError("Staff not found", 404);

    const emailExists = await StaffModel.findByEmail(client, email, staffId);
    if (emailExists) throw new AppError("Email already exists", 409);

    if (imageUrl && imageUrl !== staff.imageUrl) {
      if (staff.imageUrl) {
        const oldPublicId = extractCloudinaryPublicId(staff.imageUrl);
        await cloudinary.uploader.destroy(oldPublicId, { invalidate: true });
      }

      const response = await cloudinary.uploader.upload(imageUrl, {
        folder: "cotamila_staffs",
      });
      imageUrl = response.secure_url;
    } else {
      imageUrl = staff.imageUrl;
    }

    let roleRecord = await StaffModel.findRoleByName(client, role);
    if (!roleRecord) {
      roleRecord = await StaffModel.createRole(client, role, "");
    }

    await StaffModel.findByIdAndUpdate(
      client,
      staffId,
      name,
      email,
      roleRecord.roleId,
      status,
      imageUrl,
    );

    const updatedStaff = await StaffModel.findById(client, staffId);

    await client.query("COMMIT");
    return updatedStaff;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteStaff = async (staffId, requester) => {
  if (requester.role !== "Manager") {
    throw new AppError("Unauthorized - Manager only can update staff", 403);
  }

  const staff = await StaffModel.findById(undefined, staffId);
  if (!staff) throw new AppError("Staff not found", 404);

  await StaffModel.findByIdAndDelete(staff.staffId);
};

export const updateStaffStatus = async (staffId, requester, status) => {
  if (requester.role !== "Manager") {
    throw new AppError("Unauthorized - Manager only can update staff", 403);
  }

  const staff = await StaffModel.findById(undefined, staffId);
  if (!staff) throw new AppError("Staff not found", 404);

  await StaffModel.findByIdAndUpdateStatus(staff.staffId, status);

  return await StaffModel.findById(undefined, staffId);
};
