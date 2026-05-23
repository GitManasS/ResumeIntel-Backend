import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import jdMatchRoutes from './jdMatch.routes.js';
import interviewRoutes from './interview.routes.js';
import jobRoutes from './job.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';
import pipelineRoutes from './pipeline.routes.js';
import hiringRoutes from './hiring.routes.js';
import careerRoutes from './career.routes.js';
import organizationRoutes from './organization.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jd-match', jdMatchRoutes);
router.use('/interview', interviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/hiring', hiringRoutes);
router.use('/careers', careerRoutes);
router.use('/organizations', organizationRoutes);

export default router;
