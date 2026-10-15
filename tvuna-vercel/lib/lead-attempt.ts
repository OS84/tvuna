import type { LeadInput } from './lead-validation';
export type ContactFields = Omit<LeadInput, 'submissionId'>;
export type LeadAttempt = {fingerprint:string; submissionId:string};
export function prepareLeadAttempt(previous: LeadAttempt | null, fields: ContactFields): LeadAttempt {
  const fingerprint = JSON.stringify([fields.contactName.trim(), fields.businessName.trim(), fields.contactMethod, fields.contactValue.trim()]);
  return previous?.fingerprint === fingerprint ? previous : {fingerprint, submissionId:crypto.randomUUID()};
}
