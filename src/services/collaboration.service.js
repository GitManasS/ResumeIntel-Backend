import CandidateNote from '../models/CandidateNote.js';
import { ApiError } from '../utils/ApiError.js';
import { activityService } from './activity.service.js';
import { eventBus, EVENTS } from '../events/eventBus.js';
import notificationService from './notification.service.js';

export const collaborationService = {
  async addNote(organizationId, applicationId, authorId, { content, isPrivate, mentions }) {
    const note = await CandidateNote.create({
      organization: organizationId,
      application: applicationId,
      author: authorId,
      content,
      isPrivate: isPrivate ?? false,
      mentions: mentions || [],
    });

    await activityService.record({
      organization: organizationId,
      user: authorId,
      application: applicationId,
      type: 'note_added',
      title: 'Recruiter note added',
      description: content.slice(0, 200),
      metadata: { noteId: note._id },
    });

    eventBus.emit(EVENTS.NOTE_ADDED, { note, organizationId, mentions });

    if (mentions?.length) {
      for (const userId of mentions) {
        await notificationService.create({
          user: userId,
          type: 'recruiter_update',
          title: 'You were mentioned',
          message: content.slice(0, 120),
          link: '/recruiter/pipeline',
          metadata: { applicationId, noteId: note._id },
        });
      }
    }

    return note.populate('author', 'name email orgRole');
  },

  async getNotes(organizationId, applicationId) {
    return CandidateNote.find({ organization: organizationId, application: applicationId })
      .populate('author', 'name email orgRole avatar')
      .populate('mentions', 'name email')
      .sort('-createdAt');
  },

  async deleteNote(noteId, organizationId, userId) {
    const note = await CandidateNote.findOne({ _id: noteId, organization: organizationId });
    if (!note) throw ApiError.notFound('Note not found');
    if (note.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('Can only delete your own notes');
    }
    await note.deleteOne();
  },
};

export default collaborationService;
