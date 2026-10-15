import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareLeadAttempt} from '../lib/lead-attempt.ts';
const fields={contactName:'בדיקת מערכת',businessName:'עסק בדיקה',contactMethod:'email',contactValue:'test@example.com'};
test('unchanged retry reuses the submission reference',()=>{const a=prepareLeadAttempt(null,fields);assert.equal(prepareLeadAttempt(a,fields),a);assert.equal(prepareLeadAttempt(a,{...fields,contactName:' '+fields.contactName+' '}).submissionId,a.submissionId);});
for(const change of [{contactName:'שם אחר'},{businessName:'עסק אחר'},{contactMethod:'whatsapp',contactValue:'0501234567'},{contactValue:'other@example.com'}])test('editing '+Object.keys(change).join('/')+' creates a new submission',()=>{const a=prepareLeadAttempt(null,fields);assert.notEqual(prepareLeadAttempt(a,{...fields,...change}).submissionId,a.submissionId);});
