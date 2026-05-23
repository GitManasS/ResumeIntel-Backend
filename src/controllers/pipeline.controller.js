import pipelineService from '../services/pipeline.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getBoard = asyncHandler(async (req, res) => {
  const data = await pipelineService.getBoard(req.organizationId, req.query.jobId);
  res.json({ success: true, data });
});

export const moveStage = asyncHandler(async (req, res) => {
  const application = await pipelineService.moveStage(
    req.params.id,
    req.organizationId,
    req.user._id,
    req.body,
    req
  );
  res.json({ success: true, data: application });
});

export const assignOwner = asyncHandler(async (req, res) => {
  const application = await pipelineService.assignOwner(
    req.params.id,
    req.organizationId,
    req.body.ownerId
  );
  res.json({ success: true, data: application });
});
