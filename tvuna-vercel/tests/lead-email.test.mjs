import test from 'node:test';
import assert from 'node:assert/strict';
import {sendLeadEmail} from '../lib/lead-email.ts';
const lead={contactName:'בדיקה',businessName:'עסק בדיקה',contactMethod:'whatsapp',contactValue:'+12025550100',submissionId:crypto.randomUUID()};
test('browser sends to same-origin API with verification token and no provider key', async()=>{
 const result=await sendLeadEmail(lead,'verified-token','',async(url,options)=>{
  assert.equal(url,'/api/contact'); assert.equal(options.credentials,'same-origin');
  assert.equal(options.headers.Authorization,undefined);
  const data=JSON.parse(options.body);assert.equal(data.turnstileToken,'verified-token');assert.equal(data.website,'');assert.equal(data.submissionId,lead.submissionId);
  return Response.json({ok:true,reference:lead.submissionId});
 });assert.equal(result,lead.submissionId);
});
test('non-success never shows confirmation',async()=>{
 await assert.rejects(sendLeadEmail(lead,'token','',async()=>Response.json({ok:true},{status:503})),e=>e.code==='rejected');
});
test('an accepted response must contain a reference',async()=>{
 await assert.rejects(sendLeadEmail(lead,'token','',async()=>Response.json({ok:true})),e=>e.code==='rejected');
});
test('rate-limit error stays actionable',async()=>{
 await assert.rejects(sendLeadEmail(lead,'token','',async()=>Response.json({error:'Try again shortly'},{status:429})),e=>e.code==='busy'&&e.message==='Try again shortly');
});
test('timeout aborts request and never claims definite rejection',async()=>{
 await assert.rejects(sendLeadEmail(lead,'token','',async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')))),5),e=>e.code==='timeout');
});
test('network failure keeps an uncertain state',async()=>{
 await assert.rejects(sendLeadEmail(lead,'token','',async()=>{throw new Error('offline');}),e=>e.code==='network');
});
