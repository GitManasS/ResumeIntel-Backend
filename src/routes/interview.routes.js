import { Router } from 'express';
import * as interviewController from '../controllers/interview.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { interviewSchema } from '../validations/resume.validation.js';

const router = Router();

router.use(authenticate, authorize('candidate'));

router.post('/generate', validate(interviewSchema), interviewController.generateQuestions);
router.get('/', interviewController.getQuestionSets);
router.get('/:id', interviewController.getQuestionSet);

export default router;
