import { Router } from 'express';
import * as pipelineController from '../controllers/pipeline.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';

const router = Router();

router.use(authenticate, authorizeStaff(), requireOrganization);

router.get('/board', requirePermission('pipeline:view'), pipelineController.getBoard);
router.patch('/:id/stage', requirePermission('pipeline:manage'), pipelineController.moveStage);
router.patch('/:id/owner', requirePermission('pipeline:manage'), pipelineController.assignOwner);

export default router;
