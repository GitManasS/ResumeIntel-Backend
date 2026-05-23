/**
 * Full Hiring OS database seed for local MongoDB (resume-intelligence).
 * Usage: npm run seed:reset   — wipe + reload all demo data
 *        npm run seed         — skip if admin@resumeintel.demo exists
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { PIPELINE_STAGES } from '../config/pipeline.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import JDMatch from '../models/JDMatch.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import Analytics from '../models/Analytics.js';
import Notification from '../models/Notification.js';
import Organization from '../models/Organization.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import TalentPool from '../models/TalentPool.js';
import EmailTemplate from '../models/EmailTemplate.js';
import AutomationRule from '../models/AutomationRule.js';
import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';
import CandidateNote from '../models/CandidateNote.js';
import { DEMO_PASSWORD, resumeTemplates, jdMatchSamples, interviewQuestionSamples } from './seedData.js';
import {
  organizations,
  staffUsers,
  candidateUsers,
  allJobs,
  pipelinePlacements,
  emailTemplates,
  automationRules,
  talentPools,
  candidateNotes,
  scheduledInterviews,
  allNotifications,
  auditLogEntries,
} from './seedData.expanded.js';

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset') || args.includes('-r');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buildRawText = (template) => {
  const exp = template.experience
    ?.map((e) => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate})\n${e.description}`)
    .join('\n\n') || '';
  return `${template.summary}\n\nSkills: ${template.skills.join(', ')}\n\nExperience:\n${exp}`;
};

const clearDatabase = async () => {
  const names = [
    'users', 'organizations', 'resumes', 'jobs', 'applications', 'jdmatches',
    'interviewquestions', 'interviews', 'talentpools', 'emailtemplates',
    'automationrules', 'analytics', 'notifications', 'activities', 'auditlogs', 'candidatenotes',
  ];
  for (const name of names) {
    try {
      await mongoose.connection.collection(name).deleteMany({});
    } catch {
      /* empty */
    }
  }
};

const buildStageHistory = (stage, movedBy) => {
  const order = PIPELINE_STAGES.find((s) => s.id === stage)?.order ?? 0;
  const history = [{ toStage: 'applied', movedAt: daysAgo(25) }];
  const progression = PIPELINE_STAGES.filter((s) => s.order > 0 && s.order <= order && s.id !== 'rejected');
  let prev = 'applied';
  for (const s of progression) {
    if (s.id === 'applied') continue;
    history.push({
      fromStage: prev,
      toStage: s.id,
      movedBy,
      movedAt: daysAgo(20 - s.order * 2),
    });
    prev = s.id;
  }
  if (stage === 'rejected') {
    history.push({ fromStage: prev, toStage: 'rejected', movedBy, movedAt: daysAgo(3) });
  }
  return history;
};

const seed = async () => {
  console.log('\n🌱 ResumeIntel Hiring OS — Full Database Seeder\n');
  console.log(`   Database: ${env.mongodbUri}`);
  console.log(`   Mode: ${shouldReset ? 'RESET + SEED' : 'SEED (skip if exists)'}\n`);

  await mongoose.connect(env.mongodbUri);

  if ((await User.findOne({ email: 'admin@resumeintel.demo' })) && !shouldReset) {
    console.log('⚠️  Demo data already exists. Run: npm run seed:reset\n');
    printCredentials();
    await mongoose.disconnect();
    return;
  }

  if (shouldReset) {
    console.log('🗑️  Clearing all collections...');
    await clearDatabase();
  }

  const userMap = {};
  const orgMap = {};
  const resumeMap = {};
  const jobMap = {};
  const applicationMap = {};

  // ─── Organizations ─────────────────────────────────────────────
  console.log('🏢 Organizations...');
  for (const o of organizations) {
    orgMap[o.slug] = await Organization.create(o);
  }

  // ─── Users ─────────────────────────────────────────────────────
  console.log('👤 Staff & candidates...');
  for (const u of staffUsers) {
    const { orgSlug, ...rest } = u;
    const user = await User.create({
      ...rest,
      organization: orgSlug ? orgMap[orgSlug]._id : undefined,
      password: DEMO_PASSWORD,
      lastLogin: daysAgo(Math.floor(Math.random() * 7)),
    });
    userMap[u.email] = user;
  }
  for (const u of candidateUsers) {
    const user = await User.create({
      ...u,
      role: 'candidate',
      password: DEMO_PASSWORD,
      lastLogin: daysAgo(Math.floor(Math.random() * 14)),
    });
    userMap[u.email] = user;
  }

  // ─── Resumes (templates + generic for extra candidates) ───────
  console.log('📄 Resumes & ATS analytics...');
  const allCandidateEmails = candidateUsers.map((c) => c.email);

  for (let i = 0; i < allCandidateEmails.length; i++) {
    const email = allCandidateEmails[i];
    const template = resumeTemplates[i] || resumeTemplates[i % resumeTemplates.length];
    const user = userMap[email];

    const resume = await Resume.create({
      user: user._id,
      title: template.title.replace(/^[^-]+ - /, `${user.name} - `) || `${user.name} Resume`,
      fileName: template.fileName,
      fileType: 'pdf',
      fileUrl: `https://res.cloudinary.com/demo/raw/upload/v1/resumes/${slugify(user.name)}.pdf`,
      status: 'ready',
      isPrimary: true,
      parsedData: {
        skills: template.skills,
        education: template.education,
        experience: template.experience,
        projects: template.projects,
        certifications: template.certifications,
        summary: template.summary,
        rawText: buildRawText(template),
      },
      atsAnalysis: {
        score: template.atsScore,
        formattingSuggestions: template.formattingSuggestions,
        missingKeywords: template.missingKeywords,
        improvementTips: template.improvementTips,
        analyzedAt: daysAgo(2),
      },
      createdAt: daysAgo(15 + i),
    });
    resumeMap[email] = resume;

    await Analytics.create({
      user: user._id,
      type: 'ats_score',
      value: template.atsScore,
      label: resume.fileName,
      metadata: { resumeId: resume._id },
      recordedAt: daysAgo(5),
    });

    await Activity.create({
      user: user._id,
      candidate: user._id,
      type: 'resume_upload',
      title: 'Resume uploaded',
      description: `${resume.fileName} parsed successfully`,
      metadata: { resumeId: resume._id, atsScore: template.atsScore },
      createdAt: daysAgo(10),
    });

    for (let d = 30; d >= 0; d -= 6) {
      await Analytics.create({
        user: user._id,
        type: 'ats_score',
        value: Math.min(95, template.atsScore - 8 + Math.floor((30 - d) / 4)),
        label: 'ATS trend',
        recordedAt: daysAgo(d),
      });
    }
  }

  // ─── Jobs ──────────────────────────────────────────────────────
  console.log('💼 Job postings...');
  for (const j of allJobs) {
    const recruiter = userMap[j.recruiterEmail];
    const org = orgMap[j.orgSlug];
    const { orgSlug, recruiterEmail, ...jobData } = j;
    const key = `${j.orgSlug}::${j.title}`;
    jobMap[key] = await Job.create({
      ...jobData,
      company: org.name,
      recruiter: recruiter._id,
      organization: org._id,
      slug: `${slugify(j.title)}-${org.slug}`,
      status: 'active',
      requirements: jobData.skills?.slice(0, 4) || [],
      applicants: [],
    });
  }

  // ─── Pipeline applications (all stages) ────────────────────────
  console.log('📋 Pipeline applications (all stages)...');
  for (const p of pipelinePlacements) {
    const key = `${p.orgSlug}::${p.jobTitle}`;
    const job = jobMap[key];
    const candidate = userMap[p.candidateEmail];
    const resume = resumeMap[p.candidateEmail];
    const recruiterEmail = allJobs.find((j) => j.orgSlug === p.orgSlug && j.title === p.jobTitle)?.recruiterEmail;
    const ownerUser = userMap[recruiterEmail];

    if (!job || !candidate || !resume) continue;

    const appKey = `${p.candidateEmail}::${key}`;
    if (applicationMap[appKey]) continue;

    job.applicants.push({
      candidate: candidate._id,
      resume: resume._id,
      matchScore: p.matchScore,
      status: p.stage === 'technical_interview' || p.stage === 'hr_interview' ? 'interview' : p.stage === 'shortlisted' ? 'shortlisted' : p.stage === 'rejected' ? 'rejected' : 'applied',
      appliedAt: daysAgo(18),
    });

    const application = await Application.create({
      organization: orgMap[p.orgSlug]._id,
      job: job._id,
      candidate: candidate._id,
      resume: resume._id,
      stage: p.stage,
      matchScore: p.matchScore,
      owner: ownerUser?._id,
      source: p.source,
      location: candidateUsers.find((c) => c.email === p.candidateEmail)?.location,
      expectedSalary: 120000 + Math.floor(p.matchScore * 500),
      noticePeriodDays: [15, 30, 60][Math.floor(Math.random() * 3)],
      stageHistory: buildStageHistory(p.stage, ownerUser?._id),
      hiredAt: p.stage === 'hired' ? daysAgo(1) : undefined,
      rejectedAt: p.stage === 'rejected' ? daysAgo(2) : undefined,
      createdAt: daysAgo(20),
    });
    applicationMap[appKey] = application;

    await Activity.create({
      organization: orgMap[p.orgSlug]._id,
      user: candidate._id,
      candidate: candidate._id,
      application: application._id,
      type: 'application_submitted',
      title: `Applied to ${job.title}`,
      metadata: { jobId: job._id, matchScore: p.matchScore, stage: p.stage },
      createdAt: daysAgo(18),
    });

    if (p.stage !== 'applied') {
      await Activity.create({
        organization: orgMap[p.orgSlug]._id,
        user: ownerUser?._id,
        candidate: candidate._id,
        application: application._id,
        type: 'stage_changed',
        title: `Moved to ${p.stage.replace(/_/g, ' ')}`,
        metadata: { stage: p.stage },
        createdAt: daysAgo(5),
      });
    }
  }
  for (const job of Object.values(jobMap)) {
    await job.save();
  }

  // ─── JD matches (all samples + extras) ─────────────────────────
  console.log('🎯 JD matches...');
  for (const sample of jdMatchSamples) {
    const user = userMap[sample.candidateEmail];
    const resume = resumeMap[sample.candidateEmail];
    if (!user || !resume) continue;
    await JDMatch.create({
      user: user._id,
      resume: resume._id,
      jobDescription: sample.jobDescription,
      jobTitle: sample.jobTitle,
      matchPercentage: sample.matchPercentage,
      missingSkills: sample.missingSkills,
      matchedSkills: sample.matchedSkills,
      keywordGaps: sample.keywordGaps,
      recommendations: sample.recommendations,
      createdAt: daysAgo(4),
    });
    await Analytics.create({
      user: user._id,
      type: 'jd_match',
      value: sample.matchPercentage,
      label: sample.jobTitle,
      recordedAt: daysAgo(4),
    });
  }
  for (const email of allCandidateEmails.slice(0, 6)) {
    if (jdMatchSamples.some((s) => s.candidateEmail === email)) continue;
    const resume = resumeMap[email];
    await JDMatch.create({
      user: userMap[email]._id,
      resume: resume._id,
      jobTitle: 'Software Engineer (General)',
      jobDescription: 'Full stack role with React, Node, cloud, and agile delivery.',
      matchPercentage: 65 + Math.floor(Math.random() * 20),
      missingSkills: ['GraphQL'],
      matchedSkills: resume.parsedData.skills.slice(0, 5),
      keywordGaps: ['Add cloud certifications'],
      recommendations: ['Tailor summary to target role'],
      createdAt: daysAgo(7),
    });
  }

  // ─── Interview prep question sets ──────────────────────────────
  console.log('💬 Interview question sets...');
  for (const sample of interviewQuestionSamples) {
    const user = userMap[sample.candidateEmail];
    const resume = resumeMap[sample.candidateEmail];
    if (!user) continue;
    await InterviewQuestion.create({
      user: user._id,
      resume: resume?._id,
      targetRole: sample.targetRole,
      skills: resume?.parsedData?.skills?.slice(0, 8) || [],
      questions: sample.questions,
      createdAt: daysAgo(6),
    });
  }
  for (const email of ['michael.torres@email.demo', 'rachel.brooks@email.demo', 'alex.rivera@email.demo']) {
    const resume = resumeMap[email];
    await InterviewQuestion.create({
      user: userMap[email]._id,
      resume: resume._id,
      targetRole: userMap[email].title,
      skills: resume.parsedData.skills.slice(0, 6),
      questions: [
        { text: 'Tell me about yourself.', category: 'hr', difficulty: 'easy', tips: ['Keep under 2 min'] },
        { text: 'Describe a challenging technical problem you solved.', category: 'technical', difficulty: 'medium', tips: ['Use STAR'] },
        { text: 'Where do you see yourself in 3 years?', category: 'hr', difficulty: 'easy', tips: ['Align with company'] },
      ],
      createdAt: daysAgo(8),
    });
  }

  // ─── Interviews ────────────────────────────────────────────────
  console.log('📅 Interviews...');
  for (const iv of scheduledInterviews) {
    const appKey = `${iv.candidateEmail}::${iv.orgSlug}::${iv.jobTitle}`;
    let application = applicationMap[appKey];
    if (!application) {
      application = await Application.findOne({
        candidate: userMap[iv.candidateEmail]._id,
        job: jobMap[`${iv.orgSlug}::${iv.jobTitle}`]?._id,
      });
    }
    if (!application) continue;

    await Interview.create({
      organization: orgMap[iv.orgSlug]._id,
      application: application._id,
      job: application.job,
      candidate: application.candidate,
      scheduledBy: userMap[iv.scheduledByEmail]._id,
      interviewers: iv.interviewerEmails.map((e) => userMap[e]._id),
      title: iv.title,
      type: iv.type,
      scheduledAt: iv.daysFromNow >= 0 ? daysFromNow(iv.daysFromNow) : daysAgo(-iv.daysFromNow),
      durationMinutes: 60,
      timezone: 'America/Los_Angeles',
      meetingLink: iv.meetingLink,
      status: iv.status || 'scheduled',
    });
  }

  // ─── Notes & collaboration ─────────────────────────────────────
  console.log('📝 Recruiter notes...');
  for (const n of candidateNotes) {
    const application = applicationMap[`${n.candidateEmail}::${n.orgSlug}::${n.jobTitle}`]
      || (await Application.findOne({
        candidate: userMap[n.candidateEmail]._id,
        organization: orgMap[n.orgSlug]._id,
      }));
    if (!application) continue;

    await CandidateNote.create({
      organization: orgMap[n.orgSlug]._id,
      application: application._id,
      author: userMap[n.authorEmail]._id,
      content: n.content,
      mentions: (n.mentionEmails || []).map((e) => userMap[e]._id).filter(Boolean),
    });
  }

  // ─── Talent pools ──────────────────────────────────────────────
  console.log('⭐ Talent pools...');
  for (const pool of talentPools) {
    const members = pool.memberEmails
      .map((email) => ({
        candidate: userMap[email]?._id,
        resume: resumeMap[email]?._id,
        notes: `Added from ${pool.name}`,
        addedAt: daysAgo(10),
      }))
      .filter((m) => m.candidate);

    await TalentPool.create({
      organization: orgMap[pool.orgSlug]._id,
      name: pool.name,
      description: pool.description,
      tags: pool.tags,
      createdBy: userMap[pool.createdByEmail]._id,
      candidates: members,
    });
  }

  // ─── Email templates & automation ──────────────────────────────
  console.log('✉️ Email templates & automation...');
  for (const t of emailTemplates) {
    await EmailTemplate.create({
      organization: orgMap[t.orgSlug]._id,
      name: t.name,
      slug: t.slug,
      subject: t.subject,
      body: t.body,
      category: t.category,
      variables: t.variables,
      createdBy: userMap[t.createdByEmail]._id,
    });
  }
  for (const r of automationRules) {
    await AutomationRule.create({
      organization: orgMap[r.orgSlug]._id,
      name: r.name,
      trigger: r.trigger,
      actions: r.actions,
      createdBy: userMap[r.createdByEmail]._id,
    });
  }

  // ─── Notifications ─────────────────────────────────────────────
  console.log('🔔 Notifications...');
  for (const n of allNotifications) {
    const user = userMap[n.email];
    if (!user) continue;
    await Notification.create({
      user: user._id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: daysAgo(1),
    });
  }

  // ─── Audit logs ────────────────────────────────────────────────
  console.log('📜 Audit logs...');
  for (const a of auditLogEntries) {
    await AuditLog.create({
      organization: a.orgSlug ? orgMap[a.orgSlug]._id : undefined,
      actor: userMap[a.actorEmail]._id,
      action: a.action,
      resource: a.resource,
      metadata: a.metadata,
      createdAt: daysAgo(2),
    });
  }

  // ─── Summary ───────────────────────────────────────────────────
  const counts = {
    organizations: await Organization.countDocuments(),
    users: await User.countDocuments(),
    resumes: await Resume.countDocuments(),
    jobs: await Job.countDocuments(),
    applications: await Application.countDocuments(),
    interviews: await Interview.countDocuments(),
    talentPools: await TalentPool.countDocuments(),
    activities: await Activity.countDocuments(),
  };

  console.log('\n✅ Full seed completed!\n');
  console.log('   Counts:', JSON.stringify(counts, null, 2));
  console.log('\n   Pipeline stages populated:');
  for (const stage of PIPELINE_STAGES) {
    const c = await Application.countDocuments({ stage: stage.id });
    console.log(`     ${stage.label.padEnd(22)} ${c}`);
  }
  console.log('\n   Career portals: http://localhost:5173/careers/techcorp');
  console.log('                   http://localhost:5173/careers/hireflow\n');
  printCredentials();

  await mongoose.disconnect();
};

function printCredentials() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Password for ALL accounts: ${DEMO_PASSWORD}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('  PLATFORM');
  console.log('    super_admin     admin@resumeintel.demo\n');
  console.log('  TECHCORP (org_admin / hr / recruiter / interviewer)');
  console.log('    org_admin       sarah.chen@techcorp.demo');
  console.log('    hr_manager      marcus.webb@techcorp.demo');
  console.log('    recruiter       lisa.park@techcorp.demo');
  console.log('    interviewer     tom.bradley@techcorp.demo\n');
  console.log('  HIREFLOW');
  console.log('    org_admin       james.okonkwo@hireflow.demo');
  console.log('    recruiter       nina.patel@hireflow.demo\n');
  console.log('  CANDIDATES (any)');
  console.log('    priya.sharma@email.demo      — multiple pipeline stages');
  console.log('    emily.nakamura@email.demo    — HR interview + interview scheduled');
  console.log('    michael.torres@email.demo    — rejected + applied');
  console.log('    david.kim@email.demo         — hired + shortlisted');
  console.log('    (+ alex.rivera, sofia.martinez, jordan.lee, rachel.brooks)\n');
  console.log('  RECOMMENDED FLOW');
  console.log('    1. sarah.chen@techcorp.demo → /recruiter/pipeline (Kanban)');
  console.log('    2. priya.sharma@email.demo  → /candidate (AI tools)');
  console.log('    3. /careers/techcorp        → public jobs\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
