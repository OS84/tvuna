import test from 'node:test';
import assert from 'node:assert/strict';
import {handleContact,leadEmail} from '../lib/contact-handler.ts';
import {getContactConfig} from '../lib/contact-config.ts';
import {whatsappLink,whatsappNumber} from '../lib/contact-links.ts';
const config=getContactConfig({CONTACT_EMAIL:'hello@example.com',CONTACT_FROM:'Tvuna AI <website@notify.example.com>',RESEND_API_KEY:'test-server-key',TURNSTILE_SECRET_KEY:'test-turnstile-secret',TURNSTILE_SITE_KEY:'test-site-key'});
const input={contactName:'איש בדיקה',businessName:'עסק בדיקה',contactMethod:'email',contactValue:'test@example.com',submissionId:'0a254f81-e10d-4ed6-a4bc-c94d3cbf0267',website:'',message:'שלום\nHow can you help?',turnstileToken:'test-token'};
const request=(changes={},headers={})=>new Request('https://www.tvuna.app/api/contact',{method:'POST',headers:{origin:'https://www.tvuna.app','content-type':'application/json',...headers},body:JSON.stringify({...input,...changes})});
const verified=()=>Response.json({success:true,hostname:'www.tvuna.app',action:'contact'});
const never=async()=>{assert.fail('No provider should have been contacted');};

test('default configuration uses the business mailbox and WhatsApp number without enabling an unconfigured form',()=>{
 const c=getContactConfig({});assert.equal(c.ready,false);assert.equal(c.email,'hello@tvuna.app');assert.match(c.whatsappUrl,/^https:\/\/wa.me\/972503388741\?text=/);
});
test('WhatsApp requires an international number and encodes the draft',()=>{
 assert.equal(whatsappNumber('+972 50-338-8741'),'972503388741');assert.equal(whatsappLink('0503388741'),null);
 const url=new URL(whatsappLink('+972503388741','שלום & היי'));assert.equal(url.searchParams.get('text'),'שלום & היי');
});
test('rejects cross-origin requests before contacting providers',async()=>{
 assert.equal((await handleContact(request({}, {origin:'https://attacker.example'}),config,never)).status,403);
 assert.equal((await handleContact(request({}, {'sec-fetch-site':'cross-site'}),config,never)).status,403);
});
test('rejects invalid JSON content type',async()=>{assert.equal((await handleContact(request({}, {'content-type':'text/plain'}),config,never)).status,415);});
test('bounds declared and streamed request size',async()=>{
 assert.equal((await handleContact(request({}, {'content-length':'9000'}),config,never)).status,413);
 assert.equal((await handleContact(request({message:'x'.repeat(9000)}),config,never)).status,413);
});
test('invalid fields and honeypot never reach provider',async()=>{
 assert.equal((await handleContact(request({website:'bot'}),config,never)).status,400);
 assert.equal((await handleContact(request({contactName:'<script>'}),config,never)).status,400);
 assert.equal((await handleContact(request({message:'x'.repeat(1201)}),config,never)).status,400);
});
test('missing configuration is unavailable, never a false success',async()=>{
 const res=await handleContact(request(),getContactConfig({}),never);assert.equal(res.status,503);assert.equal((await res.json()).ok,undefined);
});
test('token is required server-side',async()=>{assert.equal((await handleContact(request({turnstileToken:''}),config,never)).status,400);});
for(const result of [{success:false},{success:true,hostname:'other.example',action:'contact'},{success:true,hostname:'www.tvuna.app',action:'login'}])test('rejects invalid verification '+JSON.stringify(result),async()=>{
 let calls=0;const res=await handleContact(request(),config,async()=>{calls++;return Response.json(result);});assert.equal(res.status,400);assert.equal(calls,1);
});
test('verification outage does not send email',async()=>{
 let calls=0;const res=await handleContact(request(),config,async()=>{calls++;throw new Error('offline');});assert.equal(res.status,503);assert.equal(calls,1);
});
for(const method of ['email','whatsapp'])test(method+' callback reaches fixed recipient after verification',async()=>{
 const calls=[];const res=await handleContact(request({contactMethod:method,contactValue:method==='email'?'test@example.com':'+12025550100',to:'attacker@example.com'}),config,async(url,options)=>{
  calls.push(url);
  if(calls.length===1){assert.equal(options.body.get('secret'),'test-turnstile-secret');return verified();}
  assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'tvuna-contact/'+input.submissionId);
  const mail=JSON.parse(options.body);assert.deepEqual(mail.to,['hello@example.com']);assert.equal(mail.from,config.from);assert.equal(mail.reply_to,method==='email'?'test@example.com':undefined);
  assert.match(mail.text,/עסק בדיקה/);assert.ok(!options.body.includes('test-token'));return Response.json({id:'provider-email-id'});
 });assert.equal(res.status,200);assert.deepEqual(await res.json(),{ok:true,reference:input.submissionId});assert.equal(calls.length,2);
});
test('retries keep the provider idempotency key',async()=>{
 const keys=[];for(let i=0;i<2;i++)await handleContact(request(),config,async(url,options)=>{if(url.includes('siteverify'))return verified();keys.push(options.headers['Idempotency-Key']);return Response.json({id:'same-email'});});assert.equal(keys[0],keys[1]);
});
test('HTML message is escaped and plain text is retained',()=>{
 const email=leadEmail({...input,message:'<img src=x onerror=alert(1)> & "hello"'},config);assert.ok(!email.html.includes('<img'));assert.ok(email.html.includes('&lt;img'));assert.ok(email.text.includes('<img'));
});
for(const status of [403,429,500])test('mail provider '+status+' does not report success or leak secrets',async()=>{
 const res=await handleContact(request(),config,async(url)=>url.includes('siteverify')?verified():Response.json({message:'private-provider-detail',key:'test-server-key'},{status}));
 assert.equal(res.status,status===429?429:502);const body=await res.text();assert.ok(!body.includes('private-provider-detail'));assert.ok(!body.includes('test-server-key'));assert.ok(!body.includes('"ok":true'));
});
test('provider timeout returns uncertainty and no false success',async()=>{
 const res=await handleContact(request(),config,async(url)=>{if(url.includes('siteverify'))return verified();throw new Error('timeout');});assert.equal(res.status,504);assert.equal((await res.json()).code,'uncertain');
});
test('provider malformed success is rejected',async()=>{
 const res=await handleContact(request(),config,async(url)=>url.includes('siteverify')?verified():Response.json({}));assert.equal(res.status,502);
});
