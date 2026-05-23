import { PIPELINE_STAGES } from './pipeline.js';

/** Candidate-facing copy for each pipeline stage */
export const CANDIDATE_STAGE_COPY = {
  applied: {
    title: 'Application submitted',
    subtitle: 'Your profile has been shared with the hiring team',
  },
  screening: {
    title: 'Screening round',
    subtitle: 'The team is reviewing your qualifications',
  },
  shortlisted: {
    title: 'Shortlisted',
    subtitle: 'You have been shortlisted for the next steps',
  },
  technical_interview: {
    title: 'Technical interview',
    subtitle: 'Prepare for your technical interview round',
  },
  hr_interview: {
    title: 'HR interview',
    subtitle: 'You are progressing to the HR interview stage',
  },
  offer: {
    title: 'Offer stage',
    subtitle: 'An offer may be discussed with you soon',
  },
  hired: {
    title: 'Hired',
    subtitle: 'Congratulations — you have been selected for this role',
  },
  rejected: {
    title: 'Not moving forward',
    subtitle: 'This application was closed by the hiring team',
  },
};

export function buildCandidateApplicationStatus(application) {
  const stage = application.stage || 'applied';
  const meta = PIPELINE_STAGES.find((s) => s.id === stage);
  const copy = CANDIDATE_STAGE_COPY[stage] || CANDIDATE_STAGE_COPY.applied;

  return {
    applicationId: application._id,
    stage,
    stageLabel: meta?.label || stage,
    statusTitle: copy.title,
    statusSubtitle: copy.subtitle,
    matchScore: application.matchScore,
    appliedAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}
