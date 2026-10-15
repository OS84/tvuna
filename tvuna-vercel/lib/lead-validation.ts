export type LeadInput = { contactName: string; businessName: string; contactMethod: 'whatsapp' | 'email'; contactValue: string; submissionId: string; message?: string };
export function validateLead(input: unknown): {lead: LeadInput} | {error: string} {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error:'הפנייה אינה תקינה. נסו שוב.'};
  const body = input as Record<string, unknown>;
  if (typeof body.website !== 'string' || body.website !== '') return {error:'לא ניתן לשלוח את הפנייה. נסו שוב.'};
  const value = (key: string) => typeof body[key] === 'string' ? body[key].trim() : '';
  const contactName = value('contactName');
  const businessName = value('businessName');
  const contactMethod = value('contactMethod');
  const contactValue = value('contactValue');
  const submissionId = value('submissionId');
  const message = value('message');
  if (message.length > 1200 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) return {error:'יש לכתוב הודעה באורך של עד 1,200 תווים.'};
  const unsafe = /[\u0000-\u001f\u007f<>]/;
  if (contactName.length < 2 || contactName.length > 100 || unsafe.test(contactName)) return {error:'יש למלא שם מלא, בין 2 ל־100 תווים.'};
  if (businessName.length < 2 || businessName.length > 160 || unsafe.test(businessName)) return {error:'יש למלא שם עסק, בין 2 ל־160 תווים.'};
  if (contactMethod !== 'whatsapp' && contactMethod !== 'email') return {error:'יש לבחור WhatsApp או אימייל לחזרה.'};
  if (contactMethod === 'email' && (contactValue.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]{2,}$/.test(contactValue))) return {error:'יש למלא כתובת אימייל תקינה.'};
  if (contactMethod === 'whatsapp' && (!/^\+?[0-9\s().-]+$/.test(contactValue) || contactValue.length > 30 || contactValue.replace(/\D/g,'').length < 8 || contactValue.replace(/\D/g,'').length > 15)) return {error:'יש למלא מספר טלפון תקין, כולל קידומת.'};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) return {error:'יש לרענן את העמוד ולנסות שוב.'};
  return {lead: {contactName,businessName,contactMethod,contactValue,submissionId,message}};
}
