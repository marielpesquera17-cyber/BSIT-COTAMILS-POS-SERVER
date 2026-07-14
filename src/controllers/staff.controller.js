import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/staff.service.js";

export const getAllStaff = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const staffs = await service.getAllStaff(search, role);
  res.status(200).json({ success: true, data: staffs });
});

export const getStaffDetails = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const staff = await service.getStaffDetails(staffId);
  res.status(200).json({ success: true, data: staff });
});

export const addStaff = asyncHandler(async (req, res) => {
  const requester = req.staff;
  const newStaff = await service.addStaff(requester, req.body);
  res.status(201).json({
    success: true,
    message: "Staff member created successfully",
    data: newStaff,
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const requester = req.staff;
  const updatedStaff = await service.updateStaff(staffId, requester, req.body);
  res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    data: updatedStaff,
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const requester = req.staff;
  const deleteStaff = await service.deleteStaff(staffId, requester);
  res.status(200).json({
    success: true,
    message: "Staff member deleted",
  });
});

export const updateStaffStatus = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const { status } = req.body;
  const requester = req.staff;

  const updatedStaff = await service.updateStaffStatus(
    staffId,
    requester,
    status,
  );

  res.status(200).json({
    success: true,
    message: `${status === "Active" ? "Staff member deactivated" : "Staff member activated"}`,
    data: updatedStaff,
  });
});
