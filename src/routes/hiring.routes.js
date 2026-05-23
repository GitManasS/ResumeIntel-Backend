import { Router } from 'express';
import * as hiringController from '../controllers/hiring.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';

const router = Router();

router.use(authenticate, authorizeStaff(), requireOrganization);

router.get(
  '/search/filters/candidates',
  requirePermission('candidates:search'),
  hiringController.filterCandidates
);
router.get(
  '/search/filters/skills',
  requirePermission('candidates:search'),
  hiringController.filterSkills
);
router.get('/search', requirePermission('candidates:search'), hiringController.search);
router.get('/analytics', requirePermission('analytics:org'), hiringController.analytics);
router.get('/audit-logs', requirePermission('audit:view'), hiringController.getAuditLogs);

router.post('/applications/:applicationId/notes', requirePermission('candidates:comment'), hiringController.addNote);
router.get('/applications/:applicationId/notes', requirePermission('pipeline:view'), hiringController.getNotes);
router.get('/applications/:applicationId/timeline', requirePermission('pipeline:view'), hiringController.getTimeline);

router.post('/interviews', requirePermission('interviews:manage'), hiringController.scheduleInterview);
router.get('/interviews', requirePermission('interviews:manage'), hiringController.listInterviews);

router.get('/talent-pools', requirePermission('talent_pool:manage'), hiringController.listPools);
router.post('/talent-pools', requirePermission('talent_pool:manage'), hiringController.createPool);
router.post('/talent-pools/:poolId/candidates', requirePermission('talent_pool:manage'), hiringController.addToPool);

export default router;
