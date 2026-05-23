import AutomationRule from '../../models/AutomationRule.js';
import { emailService } from '../../services/email.service.js';
import notificationService from '../../services/notification.service.js';
import { EVENTS } from '../eventBus.js';

const renderTemplate = (body, vars) =>
  body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);

export const registerAutomationHandlers = (eventBus) => {
  const runRules = async (eventName, context) => {
    const rules = await AutomationRule.find({
      organization: context.organizationId,
      isActive: true,
      'trigger.event': eventName,
    });

    for (const rule of rules) {
      if (rule.trigger.stage && rule.trigger.stage !== context.toStage) continue;

      for (const action of rule.actions) {
        if (action.type === 'notify_user' && context.application?.owner) {
          await notificationService.create({
            user: context.application.owner,
            type: 'recruiter_update',
            title: `Automation: ${rule.name}`,
            message: `Application moved to ${context.toStage || 'new stage'}`,
            link: '/recruiter/pipeline',
          });
        }

        if (action.type === 'send_email' && context.candidateEmail) {
          const template = await import('../../models/EmailTemplate.js').then((m) =>
            m.default.findOne({
              organization: context.organizationId,
              slug: action.templateSlug,
            })
          );
          if (template) {
            await emailService.send({
              to: context.candidateEmail,
              subject: renderTemplate(template.subject, context.vars || {}),
              html: renderTemplate(template.body, context.vars || {}),
            });
          }
        }
      }
    }
  };

  eventBus.on(EVENTS.APPLICATION_STAGE_CHANGED, async (ctx) => {
    await runRules('application.stage_changed', {
      organizationId: ctx.organizationId,
      toStage: ctx.toStage,
      application: ctx.application,
      vars: { stage: ctx.toStage, candidateName: ctx.application?.candidate?.name },
    });
  });

  eventBus.on(EVENTS.CANDIDATE_SHORTLISTED, async (ctx) => {
    await runRules('candidate.shortlisted', {
      organizationId: ctx.organizationId,
      application: ctx.application,
    });
  });

  eventBus.on(EVENTS.INTERVIEW_SCHEDULED, async (ctx) => {
    await runRules('interview.scheduled', {
      organizationId: ctx.organizationId,
      interview: ctx.interview,
    });
  });
};
