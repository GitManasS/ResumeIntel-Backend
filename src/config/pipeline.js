export const PIPELINE_STAGES = [
  { id: 'applied', label: 'Applied', order: 0 },
  { id: 'screening', label: 'Screening', order: 1 },
  { id: 'shortlisted', label: 'Shortlisted', order: 2 },
  { id: 'technical_interview', label: 'Technical Interview', order: 3 },
  { id: 'hr_interview', label: 'HR Interview', order: 4 },
  { id: 'offer', label: 'Offer', order: 5 },
  { id: 'hired', label: 'Hired', order: 6 },
  { id: 'rejected', label: 'Rejected', order: 7 },
];

export const PIPELINE_STAGE_IDS = PIPELINE_STAGES.map((s) => s.id);

export const isValidStage = (stage) => PIPELINE_STAGE_IDS.includes(stage);

export const getStageOrder = (stage) =>
  PIPELINE_STAGES.find((s) => s.id === stage)?.order ?? -1;
