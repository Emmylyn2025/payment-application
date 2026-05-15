import express from 'express';
import { registerUserController, loginUserController, refreshController, logoutController, forgotPasswordController, resetPasswordController } from '../controllers/AuthController';
import { me, update, users, deleteUser } from "../controllers/userController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

//Auth routes
router.post('/register', registerUserController);
router.post('/login', loginUserController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);


//User routes
router.get('/me', authMiddleware, me);
router.put('/users/:id', authMiddleware, update);
router.get('/users', authMiddleware, users);
router.delete('/users/:id', authMiddleware, users);


export default router;