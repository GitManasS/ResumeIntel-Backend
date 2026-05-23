import TalentPool from '../models/TalentPool.js';
import { ApiError } from '../utils/ApiError.js';

export const talentPoolService = {
  async create(organizationId, userId, data) {
    return TalentPool.create({
      ...data,
      organization: organizationId,
      createdBy: userId,
      candidates: [],
    });
  },

  async list(organizationId) {
    return TalentPool.find({ organization: organizationId })
      .populate('createdBy', 'name email')
      .sort('-updatedAt');
  },

  async addCandidate(poolId, organizationId, { candidate, application, resume, notes }) {
    const pool = await TalentPool.findOne({ _id: poolId, organization: organizationId });
    if (!pool) throw ApiError.notFound('Talent pool not found');

    const exists = pool.candidates.some((c) => c.candidate?.toString() === candidate);
    if (exists) throw ApiError.conflict('Candidate already in pool');

    pool.candidates.push({ candidate, application, resume, notes, addedAt: new Date() });
    await pool.save();
    return pool;
  },

  async removeCandidate(poolId, organizationId, candidateId) {
    const pool = await TalentPool.findOne({ _id: poolId, organization: organizationId });
    if (!pool) throw ApiError.notFound('Talent pool not found');
    pool.candidates = pool.candidates.filter((c) => c.candidate.toString() !== candidateId);
    await pool.save();
    return pool;
  },
};

export default talentPoolService;
