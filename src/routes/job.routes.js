import { Router } from 'express';
import * as jobController from '../controllers/job.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  authorize,
  authorizeStaff,
} from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createJobSchema, applyJobSchema } from '../validations/job.validation.js';

const router = Router();

router.get('/', optionalAuthenticate, jobController.getJobs);

router.use(authenticate);

router.get(
  '/candidate/applications',
  authorize('candidate'),
  jobController.getMyApplications
);

router.get('/:id', jobController.getJob);

router.post(
  '/:id/apply',
  authorize('candidate'),
  validate(applyJobSchema),
  jobController.applyJob
);

router.use(authorizeStaff(), requireOrganization);

router.get('/recruiter/mine', requirePermission('jobs:view'), jobController.getMyJobs);
router.get(
  '/recruiter/candidates/search',
  requirePermission('candidates:search'),
  jobController.searchCandidates
);
router.post('/', requirePermission('jobs:manage'), validate(createJobSchema), jobController.createJob);
router.post('/:id/rank', requirePermission('jobs:manage'), jobController.rankCandidates);
router.post(
  '/:jobId/shortlist/:candidateId',
  requirePermission('pipeline:manage'),
  jobController.shortlistCandidate
);
router.put('/:id', requirePermission('jobs:manage'), jobController.updateJob);
router.delete('/:id', requirePermission('jobs:manage'), jobController.deleteJob);

export default router;
