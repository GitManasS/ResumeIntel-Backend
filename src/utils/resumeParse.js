import pdf from 'pdf-parse';
import logger from './logger.js';

const SKILL_PATTERN = /\b(JavaScript|TypeScript|Python|React|Node\.?js|Java|AWS|Docker|SQL|MongoDB|HTML|CSS|Git|Kubernetes|Azure|GCP|C\+\+|C#|Go|Rust|PHP|Ruby|Angular|Vue|Next\.?js|Express|PostgreSQL|Redis|Linux|Agile|Scrum)\b/gi;

export async function extractTextFromResume(buffer, mimetype, fileName = '') {
  if (mimetype === 'application/pdf') {
    try {
      const data = await pdf(buffer);
      const text = (data?.text || '').trim();
      if (text.length >= 30) return text;
      throw new Error(
        'Could not extract enough text from this PDF. Use a text-based PDF (not a scanned image).'
      );
    } catch (err) {
      logger.error(`PDF extract failed (${fileName}): ${err.message}`);
      throw new Error(
        err.message?.includes('extract enough')
          ? err.message
          : 'PDF parsing failed on server. Try exporting the resume as a standard text PDF.'
      );
    }
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    throw new Error(
      'Word documents are not fully supported yet. Please upload a PDF version of your resume.'
    );
  }

  const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ').trim();
  if (text.length < 30) {
    throw new Error('Could not read resume content. Please upload a PDF file.');
  }
  return text;
}

export function normalizeParsedData(parsed, rawText) {
  const text = rawText || '';

  const skills = Array.isArray(parsed?.skills)
    ? [...new Set(parsed.skills.map((s) => String(s).trim()).filter(Boolean))]
    : [...new Set((text.match(SKILL_PATTERN) || []).map((s) => s.trim()))];

  const normalizeEducation = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return { institution: item.slice(0, 200) };
    return {
      institution: item.institution ? String(item.institution).slice(0, 200) : undefined,
      degree: item.degree ? String(item.degree).slice(0, 120) : undefined,
      field: item.field ? String(item.field).slice(0, 120) : undefined,
      startYear: typeof item.startYear === 'number' ? item.startYear : undefined,
      endYear: typeof item.endYear === 'number' ? item.endYear : undefined,
    };
  };

  const normalizeExperience = (item) => {
    if (!item || typeof item !== 'object') return null;
    return {
      company: item.company ? String(item.company).slice(0, 200) : undefined,
      title: item.title ? String(item.title).slice(0, 200) : undefined,
      startDate: item.startDate ? String(item.startDate).slice(0, 50) : undefined,
      endDate: item.endDate ? String(item.endDate).slice(0, 50) : undefined,
      description: item.description ? String(item.description).slice(0, 2000) : undefined,
    };
  };

  return {
    skills,
    education: (Array.isArray(parsed?.education) ? parsed.education : [])
      .map(normalizeEducation)
      .filter(Boolean),
    experience: (Array.isArray(parsed?.experience) ? parsed.experience : [])
      .map(normalizeExperience)
      .filter(Boolean),
    projects: (Array.isArray(parsed?.projects) ? parsed.projects : [])
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({
        name: p.name ? String(p.name).slice(0, 200) : undefined,
        description: p.description ? String(p.description).slice(0, 1000) : undefined,
        technologies: Array.isArray(p.technologies)
          ? p.technologies.map((t) => String(t).slice(0, 80))
          : [],
      })),
    certifications: (Array.isArray(parsed?.certifications) ? parsed.certifications : [])
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({
        name: c.name ? String(c.name).slice(0, 200) : undefined,
        issuer: c.issuer ? String(c.issuer).slice(0, 200) : undefined,
        year: typeof c.year === 'number' ? c.year : undefined,
      })),
    summary: String(parsed?.summary || text.slice(0, 800)).slice(0, 5000),
    rawText: text.slice(0, 100000),
  };
}

export function normalizeAtsAnalysis(analysis) {
  const score = Number(analysis?.score);
  return {
    score: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 72,
    formattingSuggestions: Array.isArray(analysis?.formattingSuggestions)
      ? analysis.formattingSuggestions.map((s) => String(s).slice(0, 500))
      : [],
    missingKeywords: Array.isArray(analysis?.missingKeywords)
      ? analysis.missingKeywords.map((s) => String(s).slice(0, 120))
      : [],
    improvementTips: Array.isArray(analysis?.improvementTips)
      ? analysis.improvementTips.map((s) => String(s).slice(0, 500))
      : [],
    analyzedAt: new Date(),
  };
}
