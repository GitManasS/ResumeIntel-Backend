import { Router } from 'express';
import * as careerController from '../controllers/career.controller.js';

const router = Router();

router.get('/:slug', careerController.getOrg);
router.get('/:slug/jobs', careerController.getJobs);
router.get('/:slug/jobs/:jobId', careerController.getJob);

export default router;
