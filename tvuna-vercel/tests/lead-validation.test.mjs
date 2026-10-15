import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLead} from '../lib/lead-validation.ts';
const valid={contactName:'בדיקת מערכת',businessName:'עסק בדיקה',contactMethod:'email',contactValue:'test@example.com',submissionId:'0a254f81-e10d-4ed6-a4bc-c94d3cbf0267',website:''};
test('accepts a valid email submission',()=>assert.ok(validateLead(valid).lead));
test('accepts a valid phone submission',()=>assert.ok(validateLead({...valid,contactMethod:'whatsapp',contactValue:'+1 202-555-0100'}).lead));
for (const [label,change] of Object.entries({name:{contactName:''},business:{businessName:''},choice:{contactMethod:''},contact:{contactValue:''},email:{contactValue:'not@email'},phone:{contactMethod:'whatsapp',contactValue:'12'},letters:{contactMethod:'whatsapp',contactValue:'12345678x'},honeypot:{website:'bot'},script:{contactName:'<script>x</script>'},id:{submissionId:'bad'}})) test(`rejects invalid ${label}`,()=>assert.ok(validateLead({...valid,...change}).error));
