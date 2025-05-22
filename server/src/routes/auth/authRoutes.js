// server/src/routes/authRoutes.js
import express from 'express';
// controllers
import {
  signupController,
  loginController,
  logoutController,
  getMeController,
  activateAccountController,
  googleSignInController,
  checkEmailController,
} from '../../controllers/auth/authController.js';
// Middlewares
import { protect } from '../../middlewares/authMiddleware.js';
// Validation
import { validate } from '../../middlewares/validationMiddleware.js';
import {
  signupSchema,
  loginSchema,
  activationSchema,
  checkEmailSchema,
} from '../../validations/authValidation.js';

// Routes
const router = express.Router();

// route for signup, login, logout, activate account, google sign in
router.post('/signup', validate(signupSchema), signupController);
router.post('/login', validate(loginSchema), loginController);
router.post('/activate', validate(activationSchema), activateAccountController);

// No need to validate logoutSchema
router.post('/logout', logoutController);

router.post('/google', googleSignInController);

// route for get current user profile data
router.get('/me', protect, getMeController);
router.post('/check-email', validate(checkEmailSchema), checkEmailController);

export default router;
