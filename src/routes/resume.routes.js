import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reanalyzeSchema } from '../validations/resume.validation.js';

const router = Router();

router.use(authenticate, authorize('candidate'));

router.post('/upload', uploadResume, resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.delete('/:id', resumeController.deleteResume);
router.patch('/:id/primary', resumeController.setPrimary);
router.post('/:id/reanalyze', validate(reanalyzeSchema), resumeController.reanalyze);

export default router;
