import express from 'express';
import { registerUserController, loginUserController, refreshController, logoutController, forgotPasswordController, resetPasswordController } from '../controllers/AuthController';

const router = express.Router();

//Auth routes
router.post('/register', registerUserController);
router.post('/login', loginUserController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;