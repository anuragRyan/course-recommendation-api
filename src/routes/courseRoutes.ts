import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const courseController = new CourseController();

// Health check endpoint
router.get('/health', courseController.healthCheck.bind(courseController));

// Course recommendation endpoint
router.post('/recommend-courses', courseController.recommendCourses.bind(courseController));

// Get all courses endpoint (for testing)
router.get('/courses', courseController.getAllCourses.bind(courseController));

// Get course by code endpoint (for testing)
router.get('/courses/:courseCode', courseController.getCourseByCode.bind(courseController));

export default router;