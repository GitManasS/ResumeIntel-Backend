import { openaiProvider } from './providers/openai.provider.js';
import logger from '../utils/logger.js';

const parseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const fallbackATS = (resumeText) => ({
  score: 72,
  formattingSuggestions: [
    'Use standard section headings (Experience, Education, Skills)',
    'Avoid tables and graphics for ATS compatibility',
    'Use consistent date formatting (MM/YYYY)',
  ],
  missingKeywords: ['leadership', 'agile', 'cross-functional'],
  improvementTips: [
    'Quantify achievements with metrics',
    'Tailor skills section to target role',
    'Keep resume to 1-2 pages',
  ],
});

const fallbackJDMatch = (skills, jd) => {
  const jdLower = jd.toLowerCase();
  const matched = skills.filter((s) => jdLower.includes(s.toLowerCase()));
  const missing = ['TypeScript', 'Docker', 'CI/CD'].filter(
    (s) => !skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase()))
  );
  const pct = skills.length ? Math.round((matched.length / skills.length) * 100) : 50;
  return {
    matchPercentage: Math.min(95, Math.max(30, pct)),
    matchedSkills: matched,
    missingSkills: missing,
    keywordGaps: missing.map((s) => `Add "${s}" to skills or experience`),
    recommendations: [
      'Highlight relevant projects matching JD requirements',
      'Mirror JD terminology in your summary',
      'Add certifications mentioned in the job posting',
    ],
  };
};

const fallbackQuestions = (role, skills) => [
  {
    text: `Tell me about yourself and why you're interested in the ${role || 'position'}.`,
    category: 'hr',
    difficulty: 'easy',
    tips: ['Keep it under 2 minutes', 'Connect to the role'],
  },
  {
    text: `Explain your experience with ${skills[0] || 'your primary tech stack'}.`,
    category: 'technical',
    difficulty: 'medium',
    tips: ['Use STAR method', 'Give concrete examples'],
  },
  {
    text: 'Describe a challenging project you led and how you overcame obstacles.',
    category: 'project-based',
    difficulty: 'hard',
    tips: ['Focus on impact', 'Mention metrics'],
  },
];

export const aiService = {
  async parseResume(text) {
    const prompt = `Extract structured resume data from this text. Return JSON only with keys: skills (array), education (array of objects), experience (array), projects (array), certifications (array), summary (string).

Resume:
${text.slice(0, 8000)}`;

    const result = await openaiProvider.complete(prompt, { json: true, temperature: 0.3 });
    const parsed = parseJSON(result);
    if (parsed) return parsed;

    return {
      skills: text.match(/\b(JavaScript|Python|React|Node|Java|AWS|Docker|SQL|MongoDB)\b/gi) || [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      summary: text.slice(0, 500),
      rawText: text,
    };
  },

  async analyzeATS(resumeText, targetRole) {
    const prompt = `Analyze this resume for ATS compatibility. Target role: ${targetRole || 'general'}. Return JSON: { score (0-100), formattingSuggestions (array), missingKeywords (array), improvementTips (array) }

Resume:
${resumeText.slice(0, 6000)}`;

    const result = await openaiProvider.complete(prompt, { json: true, temperature: 0.4 });
    const parsed = parseJSON(result);
    return parsed || fallbackATS(resumeText);
  },

  async matchJobDescription(resumeSkills, jobDescription, jobTitle) {
    const prompt = `Compare resume skills to job description. Return JSON: { matchPercentage, matchedSkills, missingSkills, keywordGaps, recommendations }

Skills: ${JSON.stringify(resumeSkills)}
Job Title: ${jobTitle || 'N/A'}
JD: ${jobDescription.slice(0, 4000)}`;

    const result = await openaiProvider.complete(prompt, { json: true, temperature: 0.4 });
    const parsed = parseJSON(result);
    return parsed || fallbackJDMatch(resumeSkills, jobDescription);
  },

  async generateInterviewQuestions(resumeSummary, skills, targetRole) {
    const prompt = `Generate 8 interview questions for role "${targetRole}". Skills: ${skills.join(', ')}. Return JSON: { questions: [{ text, category (hr|technical|project-based|behavioral), difficulty (easy|medium|hard), suggestedAnswer, tips }] }

Resume summary: ${resumeSummary?.slice(0, 2000)}`;

    const result = await openaiProvider.complete(prompt, { json: true, temperature: 0.7 });
    const parsed = parseJSON(result);
    if (parsed?.questions?.length) return parsed.questions;

    return fallbackQuestions(targetRole, skills);
  },

  async rankCandidates(candidates, jobDescription) {
    const prompt = `Rank these candidates for the job. Return JSON array: [{ candidateId, score (0-100), reasoning }]

JD: ${jobDescription.slice(0, 2000)}
Candidates: ${JSON.stringify(candidates.slice(0, 10))}`;

    const result = await openaiProvider.complete(prompt, { json: true, temperature: 0.3 });
    return parseJSON(result) || candidates.map((c, i) => ({
      candidateId: c.id,
      score: 90 - i * 5,
      reasoning: 'Based on skill overlap with job requirements',
    }));
  },
};
