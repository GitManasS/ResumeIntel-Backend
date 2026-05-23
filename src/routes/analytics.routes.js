import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/candidate', authorize('candidate'), analyticsController.getCandidateAnalytics);
router.get('/recruiter', authorize('recruiter', 'org_admin', 'hr_manager', 'interviewer'), analyticsController.getRecruiterAnalytics);
router.get('/admin', authorize('super_admin'), analyticsController.getAdminAnalytics);

export default router;
