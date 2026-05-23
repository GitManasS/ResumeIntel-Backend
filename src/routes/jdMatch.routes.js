import { Router } from 'express';
import * as jdMatchController from '../controllers/jdMatch.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { jdMatchSchema } from '../validations/resume.validation.js';

const router = Router();

router.use(authenticate, authorize('candidate'));

router.post('/', validate(jdMatchSchema), jdMatchController.createMatch);
router.get('/', jdMatchController.getMatches);
router.get('/:id', jdMatchController.getMatch);

export default router;
