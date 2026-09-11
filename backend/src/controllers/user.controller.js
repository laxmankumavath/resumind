import { User } from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id, 
    { name }, 
    { new: true, runValidators: true }
  ).select('-password');
  
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  // Also delete associated resumes and data in a real app
  res.status(200).json(new ApiResponse(200, null, 'Account deleted'));
});
