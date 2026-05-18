import express from 'express';
import { registerUserController, loginUserController, refreshController, logoutController, forgotPasswordController, resetPasswordController } from '../controllers/AuthController';
import { createPlanController, getSinglePlan, getAllPlans, updatePlan, deletePlan } from '../controllers/PlanController';
import { me, update, users, deleteUser } from "../controllers/userController";
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

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
router.delete('/users/:id', authMiddleware, deleteUser);

//Plan routes
router.post('/plans', authMiddleware, createPlanController);
router.get('/plans/:id', authMiddleware, getSinglePlan);
router.get('/plans', authMiddleware, getAllPlans);
router.put('/plans/:id', authMiddleware, adminMiddleware, updatePlan);
router.delete('/plans/:id', authMiddleware, adminMiddleware, deletePlan);


export default router;