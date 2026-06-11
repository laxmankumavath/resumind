import { User } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({ email, password, name });
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  res.status(201).json(
    new ApiResponse(201, {
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      tokens: { accessToken, refreshToken }
    }, 'User registered successfully')
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  res.status(200).json(
    new ApiResponse(200, {
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      tokens: { accessToken, refreshToken }
    }, 'Login successful')
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // In a real app with stateful tokens or HTTP-only cookies, clear them here
  res.status(200).json(new ApiResponse(200, {}, 'Logout successful'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokens = generateTokens(user._id, user.role);
  res.status(200).json(new ApiResponse(200, { tokens }, 'Token refreshed successfully'));
});
