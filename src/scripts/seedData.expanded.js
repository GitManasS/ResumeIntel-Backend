/** Extended seed data — full Hiring OS demo dataset */

import { PIPELINE_STAGE_IDS } from '../config/pipeline.js';

export const organizations = [
  {
    name: 'TechCorp Solutions',
    slug: 'techcorp',
    industry: 'Technology',
    size: '201-500',
    website: 'https://techcorp.example.com',
    branding: {
      primaryColor: '#0c87e8',
      tagline: 'Building the future of enterprise software',
      about: 'TechCorp builds B2B SaaS for Fortune 500 clients worldwide.',
    },
  },
  {
    name: 'HireFlow Inc',
    slug: 'hireflow',
    industry: 'HR Technology',
    size: '51-200',
    website: 'https://hireflow.example.com',
    branding: {
      primaryColor: '#6366f1',
      tagline: 'Smarter hiring for modern teams',
      about: 'HireFlow is an HR tech company scaling engineering teams globally.',
    },
  },
];

/** platformRole / orgRole set in seed.js */
export const staffUsers = [
  {
    name: 'Alex Morgan',
    email: 'admin@resumeintel.demo',
    role: 'super_admin',
    platformRole: 'super_admin',
    title: 'Platform Administrator',
    company: 'ResumeIntel',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.demo',
    role: 'recruiter',
    orgSlug: 'techcorp',
    orgRole: 'org_admin',
    title: 'Senior Talent Partner',
  },
  {
    name: 'Marcus Webb',
    email: 'marcus.webb@techcorp.demo',
    role: 'recruiter',
    orgSlug: 'techcorp',
    orgRole: 'hr_manager',
    title: 'HR Manager',
  },
  {
    name: 'Lisa Park',
    email: 'lisa.park@techcorp.demo',
    role: 'recruiter',
    orgSlug: 'techcorp',
    orgRole: 'recruiter',
    title: 'Technical Recruiter',
  },
  {
    name: 'Tom Bradley',
    email: 'tom.bradley@techcorp.demo',
    role: 'recruiter',
    orgSlug: 'techcorp',
    orgRole: 'interviewer',
    title: 'Engineering Manager',
  },
  {
    name: 'James Okonkwo',
    email: 'james.okonkwo@hireflow.demo',
    role: 'recruiter',
    orgSlug: 'hireflow',
    orgRole: 'org_admin',
    title: 'Head of Engineering Hiring',
  },
  {
    name: 'Nina Patel',
    email: 'nina.patel@hireflow.demo',
    role: 'recruiter',
    orgSlug: 'hireflow',
    orgRole: 'recruiter',
    title: 'Talent Acquisition Specialist',
  },
];

export const candidateUsers = [
  { name: 'Priya Sharma', email: 'priya.sharma@email.demo', title: 'Full Stack Developer', location: 'Atlanta, GA' },
  { name: 'Michael Torres', email: 'michael.torres@email.demo', title: 'Software Engineer', location: 'Austin, TX' },
  { name: 'Emily Nakamura', email: 'emily.nakamura@email.demo', title: 'Frontend Developer', location: 'San Diego, CA' },
  { name: 'David Kim', email: 'david.kim@email.demo', title: 'Platform Engineer', location: 'Seattle, WA' },
  { name: 'Rachel Brooks', email: 'rachel.brooks@email.demo', title: 'DevOps Engineer', location: 'Chicago, IL' },
  { name: 'Alex Rivera', email: 'alex.rivera@email.demo', title: 'Data Engineer', location: 'Denver, CO' },
  { name: 'Sofia Martinez', email: 'sofia.martinez@email.demo', title: 'Product Designer', location: 'New York, NY' },
  { name: 'Jordan Lee', email: 'jordan.lee@email.demo', title: 'Mobile Developer', location: 'Portland, OR' },
];

/** Each entry: orgSlug, recruiterEmail, ...job fields */
export const allJobs = [
  {
    orgSlug: 'techcorp',
    recruiterEmail: 'sarah.chen@techcorp.demo',
    title: 'Senior Full Stack Engineer',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'full-time',
    description: 'Build customer-facing products with React, Node.js, and MongoDB. Lead features end-to-end.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    salary: { min: 140000, max: 185000, currency: 'USD' },
  },
  {
    orgSlug: 'techcorp',
    recruiterEmail: 'lisa.park@techcorp.demo',
    title: 'Frontend Developer',
    location: 'Remote - US',
    employmentType: 'remote',
    description: 'Join product squad building accessible UIs with React, TypeScript, and design systems.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Jest'],
    salary: { min: 110000, max: 145000, currency: 'USD' },
  },
  {
    orgSlug: 'techcorp',
    recruiterEmail: 'marcus.webb@techcorp.demo',
    title: 'Engineering Manager',
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    description: 'Lead a team of 8 engineers. Drive delivery, hiring, and technical excellence.',
    skills: ['Leadership', 'Agile', 'System Design', 'React', 'Node.js'],
    salary: { min: 180000, max: 220000, currency: 'USD' },
  },
  {
    orgSlug: 'hireflow',
    recruiterEmail: 'james.okonkwo@hireflow.demo',
    title: 'Backend Engineer - Platform',
    location: 'Austin, TX',
    employmentType: 'full-time',
    description: 'Own core APIs and data services. Python/Java, PostgreSQL, Kubernetes.',
    skills: ['Python', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS'],
    salary: { min: 130000, max: 170000, currency: 'USD' },
  },
  {
    orgSlug: 'hireflow',
    recruiterEmail: 'nina.patel@hireflow.demo',
    title: 'DevOps Engineer',
    location: 'Chicago, IL (Hybrid)',
    employmentType: 'full-time',
    description: 'CI/CD, monitoring, IaC across Azure and AWS.',
    skills: ['Azure', 'AWS', 'GitHub Actions', 'Terraform', 'Docker'],
    salary: { min: 115000, max: 150000, currency: 'USD' },
  },
  {
    orgSlug: 'hireflow',
    recruiterEmail: 'james.okonkwo@hireflow.demo',
    title: 'Data Engineer',
    location: 'Remote',
    employmentType: 'remote',
    description: 'Build data pipelines with Spark, Airflow, and cloud warehouses.',
    skills: ['Python', 'Spark', 'SQL', 'Airflow', 'AWS'],
    salary: { min: 125000, max: 160000, currency: 'USD' },
  },
];

/**
 * Pipeline placements — at least 1 candidate per stage across orgs
 * stage must be in PIPELINE_STAGE_IDS
 */
export const pipelinePlacements = [
  // TechCorp - Senior Full Stack
  { candidateEmail: 'michael.torres@email.demo', jobTitle: 'Senior Full Stack Engineer', orgSlug: 'techcorp', stage: 'applied', matchScore: 62, source: 'linkedin' },
  { candidateEmail: 'alex.rivera@email.demo', jobTitle: 'Senior Full Stack Engineer', orgSlug: 'techcorp', stage: 'screening', matchScore: 70, source: 'career_portal' },
  { candidateEmail: 'priya.sharma@email.demo', jobTitle: 'Senior Full Stack Engineer', orgSlug: 'techcorp', stage: 'shortlisted', matchScore: 79, source: 'referral' },
  { candidateEmail: 'jordan.lee@email.demo', jobTitle: 'Senior Full Stack Engineer', orgSlug: 'techcorp', stage: 'technical_interview', matchScore: 74, source: 'career_portal' },
  // TechCorp - Frontend
  { candidateEmail: 'emily.nakamura@email.demo', jobTitle: 'Frontend Developer', orgSlug: 'techcorp', stage: 'hr_interview', matchScore: 92, source: 'career_portal' },
  { candidateEmail: 'sofia.martinez@email.demo', jobTitle: 'Frontend Developer', orgSlug: 'techcorp', stage: 'offer', matchScore: 88, source: 'linkedin' },
  { candidateEmail: 'priya.sharma@email.demo', jobTitle: 'Frontend Developer', orgSlug: 'techcorp', stage: 'applied', matchScore: 71, source: 'career_portal' },
  // TechCorp - Eng Manager (one hired for demo)
  { candidateEmail: 'david.kim@email.demo', jobTitle: 'Engineering Manager', orgSlug: 'techcorp', stage: 'hired', matchScore: 86, source: 'referral' },
  // HireFlow - Backend
  { candidateEmail: 'david.kim@email.demo', jobTitle: 'Backend Engineer - Platform', orgSlug: 'hireflow', stage: 'shortlisted', matchScore: 85, source: 'career_portal' },
  { candidateEmail: 'michael.torres@email.demo', jobTitle: 'Backend Engineer - Platform', orgSlug: 'hireflow', stage: 'rejected', matchScore: 68, source: 'career_portal' },
  { candidateEmail: 'alex.rivera@email.demo', jobTitle: 'Backend Engineer - Platform', orgSlug: 'hireflow', stage: 'screening', matchScore: 77, source: 'other' },
  // HireFlow - DevOps
  { candidateEmail: 'rachel.brooks@email.demo', jobTitle: 'DevOps Engineer', orgSlug: 'hireflow', stage: 'technical_interview', matchScore: 88, source: 'linkedin' },
  { candidateEmail: 'david.kim@email.demo', jobTitle: 'DevOps Engineer', orgSlug: 'hireflow', stage: 'applied', matchScore: 74, source: 'career_portal' },
  // HireFlow - Data Engineer
  { candidateEmail: 'alex.rivera@email.demo', jobTitle: 'Data Engineer', orgSlug: 'hireflow', stage: 'applied', matchScore: 81, source: 'career_portal' },
  { candidateEmail: 'michael.torres@email.demo', jobTitle: 'Data Engineer', orgSlug: 'hireflow', stage: 'shortlisted', matchScore: 73, source: 'referral' },
];

export const emailTemplates = [
  {
    orgSlug: 'techcorp',
    name: 'Interview Invitation',
    slug: 'interview-invitation',
    subject: 'Interview invitation – {{jobTitle}} at TechCorp',
    body: '<p>Hi {{candidateName}},</p><p>Please join us for an interview for {{jobTitle}}.</p><p>Meeting: {{meetingLink}}</p>',
    category: 'interview',
    variables: ['candidateName', 'jobTitle', 'meetingLink'],
    createdByEmail: 'sarah.chen@techcorp.demo',
  },
  {
    orgSlug: 'techcorp',
    name: 'Application Rejection',
    slug: 'application-rejection',
    subject: 'Update on your application – {{jobTitle}}',
    body: '<p>Hi {{candidateName}},</p><p>Thank you for your interest. We will not be moving forward at this time.</p>',
    category: 'rejection',
    variables: ['candidateName', 'jobTitle'],
    createdByEmail: 'marcus.webb@techcorp.demo',
  },
  {
    orgSlug: 'hireflow',
    name: 'Offer Letter Follow-up',
    slug: 'offer-follow-up',
    subject: 'Your offer from HireFlow – {{jobTitle}}',
    body: '<p>Hi {{candidateName}},</p><p>We are excited to extend an offer for {{jobTitle}}.</p>',
    category: 'offer',
    variables: ['candidateName', 'jobTitle'],
    createdByEmail: 'james.okonkwo@hireflow.demo',
  },
];

export const automationRules = [
  {
    orgSlug: 'techcorp',
    name: 'Notify recruiter on shortlist',
    trigger: { event: 'application.stage_changed', stage: 'shortlisted' },
    actions: [{ type: 'notify_user' }],
    createdByEmail: 'sarah.chen@techcorp.demo',
  },
  {
    orgSlug: 'techcorp',
    name: 'Email on interview stage',
    trigger: { event: 'application.stage_changed', stage: 'technical_interview' },
    actions: [{ type: 'send_email', templateSlug: 'interview-invitation' }],
    createdByEmail: 'marcus.webb@techcorp.demo',
  },
  {
    orgSlug: 'hireflow',
    name: 'Notify on new application',
    trigger: { event: 'application.created' },
    actions: [{ type: 'notify_user' }],
    createdByEmail: 'james.okonkwo@hireflow.demo',
  },
];

export const talentPools = [
  {
    orgSlug: 'techcorp',
    name: 'Senior Frontend Engineers',
    description: 'High-match frontend candidates for product teams',
    tags: ['react', 'typescript', 'frontend'],
    createdByEmail: 'lisa.park@techcorp.demo',
    memberEmails: ['emily.nakamura@email.demo', 'sofia.martinez@email.demo'],
  },
  {
    orgSlug: 'techcorp',
    name: 'Full Stack Pipeline',
    description: 'Candidates for full stack roles Q2',
    tags: ['fullstack', 'node', 'react'],
    createdByEmail: 'sarah.chen@techcorp.demo',
    memberEmails: ['priya.sharma@email.demo', 'jordan.lee@email.demo'],
  },
  {
    orgSlug: 'hireflow',
    name: 'Platform & DevOps',
    description: 'Infrastructure and platform engineering talent',
    tags: ['devops', 'kubernetes', 'platform'],
    createdByEmail: 'james.okonkwo@hireflow.demo',
    memberEmails: ['rachel.brooks@email.demo', 'david.kim@email.demo'],
  },
];

export const candidateNotes = [
  {
    candidateEmail: 'emily.nakamura@email.demo',
    jobTitle: 'Frontend Developer',
    orgSlug: 'techcorp',
    authorEmail: 'lisa.park@techcorp.demo',
    content: 'Excellent portfolio and design system experience. Recommend fast-track to HR round. @tom.bradley for technical panel.',
    mentionEmails: ['tom.bradley@techcorp.demo'],
  },
  {
    candidateEmail: 'priya.sharma@email.demo',
    jobTitle: 'Senior Full Stack Engineer',
    orgSlug: 'techcorp',
    authorEmail: 'marcus.webb@techcorp.demo',
    content: 'Strong FinEdge migration story. Verify Kubernetes exposure in technical screen.',
    mentionEmails: [],
  },
  {
    candidateEmail: 'david.kim@email.demo',
    jobTitle: 'Backend Engineer - Platform',
    orgSlug: 'hireflow',
    authorEmail: 'nina.patel@hireflow.demo',
    content: 'CKA certified. Good culture fit from phone screen. Schedule panel with platform team.',
    mentionEmails: ['james.okonkwo@hireflow.demo'],
  },
];

export const scheduledInterviews = [
  {
    candidateEmail: 'emily.nakamura@email.demo',
    jobTitle: 'Frontend Developer',
    orgSlug: 'techcorp',
    scheduledByEmail: 'lisa.park@techcorp.demo',
    interviewerEmails: ['tom.bradley@techcorp.demo', 'lisa.park@techcorp.demo'],
    title: 'Frontend Technical Interview',
    type: 'technical',
    daysFromNow: 2,
    meetingLink: 'https://meet.google.com/techcorp-fe-int',
  },
  {
    candidateEmail: 'jordan.lee@email.demo',
    jobTitle: 'Senior Full Stack Engineer',
    orgSlug: 'techcorp',
    scheduledByEmail: 'sarah.chen@techcorp.demo',
    interviewerEmails: ['tom.bradley@techcorp.demo'],
    title: 'System Design Round',
    type: 'technical',
    daysFromNow: 5,
    meetingLink: 'https://meet.google.com/techcorp-sysdesign',
  },
  {
    candidateEmail: 'rachel.brooks@email.demo',
    jobTitle: 'DevOps Engineer',
    orgSlug: 'hireflow',
    scheduledByEmail: 'james.okonkwo@hireflow.demo',
    interviewerEmails: ['james.okonkwo@hireflow.demo'],
    title: 'DevOps Technical Screen',
    type: 'technical',
    daysFromNow: 3,
    meetingLink: 'https://meet.google.com/hireflow-devops',
  },
  {
    candidateEmail: 'priya.sharma@email.demo',
    jobTitle: 'Senior Full Stack Engineer',
    orgSlug: 'techcorp',
    scheduledByEmail: 'lisa.park@techcorp.demo',
    interviewerEmails: ['lisa.park@techcorp.demo'],
    title: 'Recruiter Phone Screen',
    type: 'phone',
    daysFromNow: -2,
    status: 'completed',
    meetingLink: null,
  },
];

export const allNotifications = [
  { email: 'priya.sharma@email.demo', type: 'resume_analysis_complete', title: 'Resume analysis complete', message: 'Your resume scored 84% ATS compatibility.', link: '/candidate/resumes', isRead: true },
  { email: 'emily.nakamura@email.demo', type: 'interview_reminder', title: 'Interview in 2 days', message: 'Frontend Technical Interview — check your calendar.', link: '/candidate', isRead: false },
  { email: 'michael.torres@email.demo', type: 'recruiter_update', title: 'Application update', message: 'Your Backend Engineer application status was updated.', link: '/candidate', isRead: false },
  { email: 'david.kim@email.demo', type: 'job_application', title: 'Application received', message: 'TechCorp received your Engineering Manager application.', link: '/candidate', isRead: true },
  { email: 'sarah.chen@techcorp.demo', type: 'system', title: 'Weekly hiring summary', message: '18 applications this week. 4 in interview stages.', link: '/recruiter/analytics', isRead: false },
  { email: 'lisa.park@techcorp.demo', type: 'recruiter_update', title: 'You were mentioned', message: 'Marcus mentioned you on Emily Nakamura\'s profile.', link: '/recruiter/pipeline', isRead: false },
  { email: 'james.okonkwo@hireflow.demo', type: 'system', title: 'Pipeline alert', message: '3 candidates moved to shortlisted today.', link: '/recruiter/pipeline', isRead: false },
  { email: 'marcus.webb@techcorp.demo', type: 'recruiter_update', title: 'New applicant', message: 'New application for Senior Full Stack Engineer.', link: '/recruiter/pipeline', isRead: true },
];

export const auditLogEntries = [
  { actorEmail: 'sarah.chen@techcorp.demo', orgSlug: 'techcorp', action: 'job.create', resource: 'Job' },
  { actorEmail: 'lisa.park@techcorp.demo', orgSlug: 'techcorp', action: 'pipeline.move', resource: 'Application', metadata: { toStage: 'technical_interview' } },
  { actorEmail: 'james.okonkwo@hireflow.demo', orgSlug: 'hireflow', action: 'interview.schedule', resource: 'Interview' },
  { actorEmail: 'admin@resumeintel.demo', orgSlug: null, action: 'admin.login', resource: 'User' },
];

/** Validate pipeline stages at import */
pipelinePlacements.forEach((p) => {
  if (!PIPELINE_STAGE_IDS.includes(p.stage)) {
    throw new Error(`Invalid pipeline stage in seed: ${p.stage}`);
  }
});
