import Application from '../models/Application.js';
import mongoose from 'mongoose';

export const getOrganizationCandidates = async (organizationId, query = '') => {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  const pipeline = [
    { $match: { organization: orgId } },
    {
      $lookup: {
        from: 'users',
        localField: 'candidate',
        foreignField: '_id',
        as: 'candidateDoc',
      },
    },
    { $unwind: '$candidateDoc' },
    {
      $group: {
        _id: '$candidateDoc._id',
        name: { $first: '$candidateDoc.name' },
        email: { $first: '$candidateDoc.email' },
        title: { $first: '$candidateDoc.title' },
      },
    },
    { $sort: { name: 1 } },
  ];

  if (query?.trim()) {
    const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    pipeline.push({
      $match: {
        $or: [{ name: regex }, { email: regex }, { title: regex }],
      },
    });
  }

  pipeline.push({ $limit: 25 });

  return Application.aggregate(pipeline);
};

export const getOrganizationSkills = async (organizationId, query = '') => {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  const pipeline = [
    { $match: { organization: orgId } },
    {
      $lookup: {
        from: 'resumes',
        localField: 'resume',
        foreignField: '_id',
        as: 'resumeDoc',
      },
    },
    { $unwind: { path: '$resumeDoc', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$resumeDoc.parsedData.skills', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        'resumeDoc.parsedData.skills': { $exists: true, $nin: [null, ''] },
      },
    },
    {
      $group: {
        _id: { $toLower: '$resumeDoc.parsedData.skills' },
        skill: { $first: '$resumeDoc.parsedData.skills' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, skill: 1 } },
  ];

  if (query?.trim()) {
    const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    pipeline.push({ $match: { skill: regex } });
  }

  pipeline.push({ $limit: 30 });

  const rows = await Application.aggregate(pipeline);
  return rows.map((r) => ({ skill: r.skill, count: r.count }));
};
