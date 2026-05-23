import { EventEmitter } from 'events';

class HiringEventBus extends EventEmitter {}

export const eventBus = new HiringEventBus();

export const EVENTS = {
  APPLICATION_CREATED: 'application.created',
  APPLICATION_STAGE_CHANGED: 'application.stage_changed',
  INTERVIEW_SCHEDULED: 'interview.scheduled',
  NOTE_ADDED: 'note.added',
  CANDIDATE_SHORTLISTED: 'candidate.shortlisted',
};
