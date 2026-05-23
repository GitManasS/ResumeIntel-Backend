import { Router } from 'express';
import * as organizationController from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  createOrgMemberSchema,
  updateOrgMemberSchema,
} from '../validations/organization.validation.js';

const router = Router();

router.use(authenticate, authorize('super_admin'), requirePermission('org:manage'));

router.get('/', organizationController.listOrganizations);
router.post('/', validate(createOrganizationSchema), organizationController.createOrganization);
router.get('/:orgId', organizationController.getOrganization);
router.patch('/:orgId', validate(updateOrganizationSchema), organizationController.updateOrganization);

router.get('/:orgId/members', organizationController.listMembers);
router.post('/:orgId/members', validate(createOrgMemberSchema), organizationController.addMember);
router.patch(
  '/:orgId/members/:userId',
  validate(updateOrgMemberSchema),
  organizationController.updateMember
);
router.delete('/:orgId/members/:userId', organizationController.removeMember);

export default router;
