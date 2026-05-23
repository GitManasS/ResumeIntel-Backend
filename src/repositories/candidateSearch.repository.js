import Application from '../models/Application.js';

export const searchCandidates = async (organizationId, filters, { page, limit, skip }) => {
  const match = { organization: organizationId };

  if (filters.jobId) match.job = filters.jobId;
  if (filters.stage) match.stage = filters.stage;
  if (filters.minMatchScore) match.matchScore = { $gte: filters.minMatchScore };
  if (filters.minAtsScore) match['resumeDoc.atsAnalysis.score'] = { $gte: filters.minAtsScore };

  const pipeline = [
    { $match: match },
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
      $lookup: {
        from: 'resumes',
        localField: 'resume',
        foreignField: '_id',
        as: 'resumeDoc',
      },
    },
    { $unwind: { path: '$resumeDoc', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'jobs',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDoc',
      },
    },
    { $unwind: '$jobDoc' },
  ];

  if (filters.search) {
    pipeline.push({
      $match: {
        $or: [
          { 'candidateDoc.name': { $regex: filters.search, $options: 'i' } },
          { 'candidateDoc.email': { $regex: filters.search, $options: 'i' } },
        ],
      },
    });
  }

  if (filters.skills?.length) {
    pipeline.push({
      $match: {
        'resumeDoc.parsedData.skills': { $in: filters.skills },
      },
    });
  }

  if (filters.location) {
    pipeline.push({
      $match: {
        $or: [
          { location: { $regex: filters.location, $options: 'i' } },
          { 'jobDoc.location': { $regex: filters.location, $options: 'i' } },
        ],
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: { matchScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        stage: 1,
        matchScore: 1,
        tags: 1,
        createdAt: 1,
        candidate: {
          _id: '$candidateDoc._id',
          name: '$candidateDoc.name',
          email: '$candidateDoc.email',
          title: '$candidateDoc.title',
        },
        job: { _id: '$jobDoc._id', title: '$jobDoc.title', company: '$jobDoc.company' },
        resume: {
          _id: '$resumeDoc._id',
          fileName: '$resumeDoc.fileName',
          atsScore: '$resumeDoc.atsAnalysis.score',
          skills: '$resumeDoc.parsedData.skills',
        },
      },
    },
  ];

  const [countResult, results] = await Promise.all([
    Application.aggregate(countPipeline),
    Application.aggregate(dataPipeline),
  ]);

  return { results, total: countResult[0]?.total || 0 };
};
