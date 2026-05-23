import pdf from 'pdf-parse';
import Resume from '../models/Resume.js';
import Analytics from '../models/Analytics.js';
import { ApiError } from '../utils/ApiError.js';
import { aiService } from '../ai/ai.service.js';
import { cloudinary } from '../config/cloudinary.js';
import { configureCloudinary } from '../config/cloudinary.js';
import notificationService from './notification.service.js';
import logger from '../utils/logger.js';

const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word')) return 'docx';
  return 'doc';
};

export const resumeService = {
  async upload(userId, file) {
    let fileUrl = null;
    let filePublicId = null;

    if (configureCloudinary()) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'resumes', resource_type: 'raw' },
          (err, res) => (err ? reject(err) : resolve(res))
        );
        stream.end(file.buffer);
      });
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
    }

    const resume = await Resume.create({
      user: userId,
      fileName: file.originalname,
      fileType: getFileType(file.mimetype),
      fileUrl,
      filePublicId,
      status: 'parsing',
    });

    this.parseResumeAsync(resume._id, file.buffer, file.mimetype).catch((err) =>
      logger.error(`Resume parse failed: ${err.message}`)
    );

    return resume;
  },

  async parseResumeAsync(resumeId, buffer, mimetype) {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    try {
      let text = '';
      if (mimetype === 'application/pdf') {
        const data = await pdf(buffer);
        text = data.text;
      } else {
        text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
      }

      const parsedData = await aiService.parseResume(text);
      parsedData.rawText = text;

      const atsAnalysis = await aiService.analyzeATS(text);
      atsAnalysis.analyzedAt = new Date();

      resume.parsedData = parsedData;
      resume.atsAnalysis = atsAnalysis;
      resume.status = 'ready';
      await resume.save();

      await Analytics.create({
        user: resume.user,
        type: 'ats_score',
        value: atsAnalysis.score,
        label: resume.title,
        metadata: { resumeId: resume._id },
      });

      await notificationService.create({
        user: resume.user,
        type: 'resume_analysis_complete',
        title: 'Resume Analysis Complete',
        message: `Your resume scored ${atsAnalysis.score}% ATS compatibility.`,
        link: `/candidate/resumes/${resume._id}`,
        metadata: { resumeId: resume._id },
      });
    } catch (error) {
      resume.status = 'failed';
      await resume.save();
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
      await cloudinary.uploader.destroy(resume.filePublicId, { resource_type: 'raw' });
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

    const atsAnalysis = await aiService.analyzeATS(resume.parsedData.rawText, targetRole);
    atsAnalysis.analyzedAt = new Date();
    resume.atsAnalysis = atsAnalysis;
    await resume.save();

    await Analytics.create({
      user: userId,
      type: 'ats_score',
      value: atsAnalysis.score,
      metadata: { resumeId },
    });

    return resume;
  },
};

export default resumeService;
