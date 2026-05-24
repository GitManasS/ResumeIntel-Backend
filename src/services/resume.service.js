import Resume from '../models/Resume.js';
import Analytics from '../models/Analytics.js';
import { ApiError } from '../utils/ApiError.js';
import { aiService } from '../ai/ai.service.js';
import { cloudinary } from '../config/cloudinary.js';
import { configureCloudinary } from '../config/cloudinary.js';
import notificationService from './notification.service.js';
import { emitToUser } from '../websocket/socket.js';
import {
  extractTextFromResume,
  normalizeParsedData,
  normalizeAtsAnalysis,
} from '../utils/resumeParse.js';
import logger from '../utils/logger.js';

const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word')) return 'docx';
  return 'doc';
};

async function uploadToCloudinary(buffer) {
  if (!configureCloudinary()) return { fileUrl: null, filePublicId: null };

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'resumes', resource_type: 'raw' },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });
    return { fileUrl: result.secure_url, filePublicId: result.public_id };
  } catch (err) {
    logger.warn(`Cloudinary upload skipped: ${err.message}`);
    return { fileUrl: null, filePublicId: null };
  }
}

export const resumeService = {
  async upload(userId, file) {
    const { fileUrl, filePublicId } = await uploadToCloudinary(file.buffer);

    const resume = await Resume.create({
      user: userId,
      fileName: file.originalname,
      fileType: getFileType(file.mimetype),
      fileUrl,
      filePublicId,
      status: 'parsing',
    });

    logger.info(
      `Resume upload accepted: id=${resume._id} file=${file.originalname} size=${file.size} user=${userId}`
    );

    const bufferCopy = Buffer.from(file.buffer);

    this.parseResumeAsync(resume._id, bufferCopy, file.mimetype, file.originalname).catch(
      (err) => logger.error(`Resume parse failed [${resume._id}]: ${err.message}`)
    );

    return resume;
  },

  async parseResumeAsync(resumeId, buffer, mimetype, fileName = '') {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    try {
      const text = await extractTextFromResume(buffer, mimetype, fileName);

      const parsedRaw = await aiService.parseResume(text);
      const parsedData = normalizeParsedData(parsedRaw, text);

      const atsRaw = await aiService.analyzeATS(text);
      const atsAnalysis = normalizeAtsAnalysis(atsRaw);

      resume.parsedData = parsedData;
      resume.atsAnalysis = atsAnalysis;
      resume.status = 'ready';
      resume.parseError = undefined;
      await resume.save();

      try {
        await Analytics.create({
          user: resume.user,
          type: 'ats_score',
          value: atsAnalysis.score,
          label: resume.title,
          metadata: { resumeId: resume._id },
        });
      } catch (err) {
        logger.warn(`Analytics skip: ${err.message}`);
      }

      try {
        await notificationService.create({
          user: resume.user,
          type: 'resume_analysis_complete',
          title: 'Resume Analysis Complete',
          message: `Your resume scored ${atsAnalysis.score}% ATS compatibility.`,
          link: `/candidate/resumes`,
          metadata: { resumeId: resume._id },
        });
      } catch (err) {
        logger.warn(`Notification skip: ${err.message}`);
      }

      logger.info(`Resume parse complete: id=${resume._id} score=${atsAnalysis.score}`);

      emitToUser(resume.user.toString(), 'resume:ready', {
        resumeId: resume._id,
        status: 'ready',
        score: atsAnalysis.score,
      });
    } catch (error) {
      logger.error(`Resume parse failed id=${resumeId}: ${error.message}`, { stack: error.stack });
      resume.status = 'failed';
      resume.parseError = error.message?.slice(0, 500) || 'Analysis failed';
      await resume.save();
      emitToUser(resume.user.toString(), 'resume:failed', {
        resumeId: resume._id,
        status: 'failed',
        message: resume.parseError,
      });
      throw error;
    }
  },

  async getByUser(userId, { page, limit, skip, sort }) {
    const [resumes, total] = await Promise.all([
      Resume.find({ user: userId }).sort(sort).skip(skip).limit(limit),
      Resume.countDocuments({ user: userId }),
    ]);
    return { resumes, total };
  },

  async getById(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');
    return resume;
  },

  async delete(resumeId, userId) {
    const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.filePublicId && configureCloudinary()) {
      try {
        await cloudinary.uploader.destroy(resume.filePublicId, { resource_type: 'raw' });
      } catch (err) {
        logger.warn(`Cloudinary delete failed: ${err.message}`);
      }
    }
    return resume;
  },

  async setPrimary(resumeId, userId) {
    await Resume.updateMany({ user: userId }, { isPrimary: false });
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, user: userId },
      { isPrimary: true },
      { new: true }
    );
    if (!resume) throw ApiError.notFound('Resume not found');
    return resume;
  },

  async reanalyze(resumeId, userId, targetRole) {
    const resume = await this.getById(resumeId, userId);
    if (!resume.parsedData?.rawText) throw ApiError.badRequest('Resume not parsed yet');

    const atsRaw = await aiService.analyzeATS(resume.parsedData.rawText, targetRole);
    resume.atsAnalysis = normalizeAtsAnalysis(atsRaw);
    await resume.save();

    try {
      await Analytics.create({
        user: userId,
        type: 'ats_score',
        value: resume.atsAnalysis.score,
        metadata: { resumeId },
      });
    } catch (err) {
      logger.warn(`Analytics skip: ${err.message}`);
    }

    return resume;
  },
};

export default resumeService;
