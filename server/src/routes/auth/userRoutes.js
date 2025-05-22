import express from 'express';
// Middlewares
import { protect } from '../../middlewares/authMiddleware.js'; // فقط protect لازم است
import upload from '../../middlewares/uploadMiddleware.js';
// Controllers
import {
  updateUserProfileController,
  getUserProfile,
  uploadProfilePictureController,
} from '../../controllers/admin/userController.js';
// Validation
import { validate } from '../../middlewares/validationMiddleware.js';
import { updateProfileSchema } from '../../validations/userValidation.js';
// Routes
const router = express.Router();
// All routes below this middleware will be protected and USER must be loggedIn
router.use(protect);

// route for get current user profile data
// Note: you can use /auth/me also
router.get('/profile', getUserProfile); // یا getMeController

// route for update current user profile data
router.put(
  '/profile',
  validate(updateProfileSchema),
  updateUserProfileController
);
// upload profile picture for current user
router.put(
  '/profile/picture',
  upload.single('profilePicture'),
  uploadProfilePictureController
);

export default router;
