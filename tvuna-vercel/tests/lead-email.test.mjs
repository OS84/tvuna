import test from 'node:test';
import assert from 'node:assert/strict';
import {sendLeadEmail} from '../lib/lead-email.ts';
const lead={contactName:'בדיקה',businessName:'עסק בדיקה',contactMethod:'whatsapp',contactValue:'+12025550100',submissionId:crypto.randomUUID()};
test('email includes every field and preferred WhatsApp contact',async()=>{
 await sendLeadEmail(lead,async(url,options)=>{
  assert.equal(url,'https://formsubmit.co/ajax/sincai@gmail.com');
  const payload=Object.fromEntries(new URLSearchParams(options.body));assert.equal(payload.name,lead.contactName);assert.equal(payload['שם העסק'],lead.businessName);assert.equal(payload['אמצעי קשר מועדף'],'WhatsApp');assert.equal(payload['פרטי קשר'],lead.contactValue);assert.equal(payload['מספר פנייה'],lead.submissionId);
  return Response.json({success:'true'});
 });
});
test('activation-required response never counts as email success',async()=>{
 await assert.rejects(sendLeadEmail(lead,async()=>Response.json({success:'false',message:'needs Activation'})));
});
test('provider failure never counts as email success',async()=>{
 await assert.rejects(sendLeadEmail(lead,async()=>Response.json({success:'true'},{status:503})));
});
test('email contact can be replied to directly',async()=>{
 await sendLeadEmail({...lead,contactMethod:'email',contactValue:'test@example.com'},async(url,options)=>{
  const payload=Object.fromEntries(new URLSearchParams(options.body));assert.equal(payload._replyto,'test@example.com');assert.equal(payload['אמצעי קשר מועדף'],'אימייל');return Response.json({success:true});
 });
});
test('a response taking longer than the previous 12 second limit still succeeds',async(t)=>{
 t.mock.timers.enable({apis:['setTimeout']});
 let signal;
 const result=sendLeadEmail(lead,async(url,options)=>{
  signal=options.signal;
  assert.match(options.headers['Content-Type'],/^application\/x-www-form-urlencoded/);
  assert.equal(options.credentials,'omit');
  await new Promise(resolve=>setTimeout(resolve,20_000));return Response.json({success:true});
 });
 t.mock.timers.tick(20_000);
 assert.equal(signal.aborted,false);
 await result;
});
test('timeout is distinct from a rejection and aborts the actual request',async()=>{
 await assert.rejects(sendLeadEmail(lead,async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')))),5),e=>e.code==='timeout');
});
test('rate limits are reported explicitly',async()=>{
 await assert.rejects(sendLeadEmail(lead,async()=>Response.json({success:false},{status:429})),e=>e.code==='busy');
});

test('email identifies the production website without the old host', async () => {
 await sendLeadEmail(lead, async (url, options) => {
  const payload = new URLSearchParams(options.body);
  assert.equal(payload.get('_url'), 'https://tvuna.app/');
  return Response.json({success:true});
 });
});
test('email from a browser identifies the actual preview or production origin', async (t) => {
 Object.defineProperty(globalThis, 'window', {value:{location:{origin:'https://preview.example.com'}}, configurable:true});
 t.after(() => { delete globalThis.window; });
 await sendLeadEmail(lead, async (url, options) => {
  assert.equal(new URLSearchParams(options.body).get('_url'), 'https://preview.example.com/');
  return Response.json({success:true});
 });
});
