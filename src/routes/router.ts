import express from 'express';
import { registerUserController, loginUserController, refreshController, logoutController, forgotPasswordController, resetPasswordController, verifyEmailController } from '../controllers/AuthController';
import { createPlanController, getSinglePlan, getAllPlans, updatePlan, deletePlan } from '../controllers/PlanController';
import { createCategoryController, getCategoryByIdController, getAllCategoryController, updateCategoryController, deleteCategoryController } from '../controllers/categoryController';
import { me, update, users, deleteUser } from "../controllers/userController";
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

//Auth routes
router.post('/register', registerUserController);
router.get('/verify-email/:token', verifyEmailController);
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
router.post('/plans', authMiddleware, adminMiddleware, createPlanController);
router.get('/plans/:id', authMiddleware, getSinglePlan);
router.get('/plans', authMiddleware, getAllPlans);
router.put('/plans/:id', authMiddleware, adminMiddleware, updatePlan);
router.delete('/plans/:id', authMiddleware, adminMiddleware, deletePlan);

//Category routes
router.post('/category/:id', authMiddleware, adminMiddleware, createCategoryController);
router.get('/category/:id', authMiddleware, getCategoryByIdController);
router.get('/category', authMiddleware, getAllCategoryController);
router.put('/category/:id', authMiddleware, adminMiddleware, updateCategoryController);
router.delete('/category/:id', authMiddleware, adminMiddleware, deleteCategoryController);


export default router;