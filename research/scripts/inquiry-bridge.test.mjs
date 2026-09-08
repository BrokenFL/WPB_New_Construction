import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveQueryInquiryInterest, wireInquiryContext } from '../../src/lib/inquiryContext.ts';
import { rememberLeadAttribution } from '../../src/lib/leadCapture.ts';

test('bridge applies immediately, replaces request families, and respects manual selections', () => {
  const keys=['window','document','location','HTMLSelectElement','HTMLFormElement'];
  const saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const store=new Map();
  const events=new Map();
  const form={dataset:{},querySelector:selector=>fields[selector]??null};
  class Select { constructor(name){this.name=name;this.value='';this.form=form;} }
  class Form {}
  const project=new Select('project');
  const interest=new Select('interest');
  const context={value:'contact_page'};
  const name={value:''};
  const fields={
    '[name="lead_capture_context"]':context,
    'select[name="project"]':project,
    'select[name="interest"]':interest,
    '[name="project_name"]':name,
  };
  const location={href:'https://example.invalid/inquire/',pathname:'/inquire/',search:''};
  const globals={location,document:{referrer:''},HTMLSelectElement:Select,HTMLFormElement:Form,window:{location,addEventListener:()=>{},sessionStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)}}};
  try {
    for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
    rememberLeadAttribution({cta_context:'floorplan:olara:residence-d',cta_location:'floorplan-entity-intro',corridor:'north-flagler'});
    const sync=wireInquiryContext({querySelector:()=>form,addEventListener:(event,handler)=>events.set(event,handler)});
    // No later observer or commercial import is allowed to be necessary.
    assert.equal(project.value,'olara');assert.equal(context.value,'floorplan:olara:residence-d');
    assert.equal(form.dataset.leadCtaLocation,'floorplan-entity-intro');
    rememberLeadAttribution({cta_context:'commercial:buildings:pricing-packet'},{replaceRequest:true});sync();
    assert.equal(project.value,'');assert.equal(interest.value,'Request private floor-plan packet');
    assert.equal(name.value,'');assert.equal(form.dataset.leadCorridor,undefined);
    project.value='south-flagler-house';events.get('change')({target:project});sync();
    assert.equal(project.value,'south-flagler-house');
    rememberLeadAttribution({cta_context:'floorplan:olara:residence-d',corridor:'north-flagler'},{replaceRequest:true});sync();
    assert.equal(project.value,'olara');assert.equal(interest.value,'Request current availability');
    interest.value='Schedule private tour';events.get('change')({target:interest});sync();
    assert.equal(interest.value,'Schedule private tour');
  } finally {
    for(const key of keys){const descriptor=saved.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});

test('query intent resolver admits legacy and Batch 4 values but rejects arbitrary query text', () => {
  assert.equal(resolveQueryInquiryInterest('availability'),'Request current availability');
  assert.equal(resolveQueryInquiryInterest('Request current availability'),'Request current availability');
  assert.equal(resolveQueryInquiryInterest('floorplans'),'Request private floor-plan packet');
  assert.equal(resolveQueryInquiryInterest('compare'),'Compare buildings');
  assert.equal(resolveQueryInquiryInterest('Pricing + floor-plan packet'),'Pricing + floor-plan packet');
  for (const value of ['pricing packet','name@example.invalid','Schedule private tour','',null]) assert.equal(resolveQueryInquiryInterest(value),undefined);
});

test('explicit query requests apply once per navigation and a changed request replaces stale auto-population', async () => {
  const keys=['window','document','location','HTMLSelectElement','HTMLFormElement'];
  const saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const listeners=new Map();
  const makeOption=(value)=>({value,textContent:value});
  let form;
  class Form {}
  class Select {
    constructor(name,values){this.name=name;this.value='';this.form=form;this.options=values.map(makeOption);}
    append(option){this.options.push(option);}
  }
  const location={href:'https://example.invalid/inquire/?project=rosewood&interest=Request%20current%20availability',pathname:'/inquire/',search:'?project=rosewood&interest=Request%20current%20availability'};
  const project=new Select('project',['','rosewood-residences-west-palm-beach','maison-dor','olara']);
  const interest=new Select('interest',['Request current availability','Request private floor-plan packet','Compare buildings','Schedule private tour']);
  const context={value:'floorplan:olara:residence-d'};
  const source={value:''};
  const message={value:''};
  const fields={
    '[name="lead_capture_context"]':context,
    '[name="source_page"]':source,
    'select[name="project"]':project,
    'select[name="interest"]':interest,
    'textarea[name="message"]':message,
  };
  form=Object.assign(new Form(),{dataset:{leadProjectSlug:'olara',leadCtaLabel:'old',leadCtaLocation:'floorplan-entity'},querySelector:selector=>fields[selector]??null});
  const app={querySelector:()=>form,addEventListener:(event,handler)=>listeners.set(event,handler)};
  const document={
    referrer:'',
    createElement:(tag)=>tag==='option'?makeOption(''):{dataset:{},remove(){},replaceChildren(){},append(){}},
  };
  const globals={location,document,HTMLSelectElement:Select,HTMLFormElement:Form,window:{location,addEventListener:(event,handler)=>listeners.set(`window:${event}`,handler),sessionStorage:{getItem:()=>null,setItem:()=>{}}}};
  try {
    for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
    const sync=wireInquiryContext(app);
    // The legacy route initializer owns alias -> canonical normalization and has
    // already selected Rosewood before the shared bridge runs.
    project.value='rosewood-residences-west-palm-beach';sync();
    assert.equal(interest.value,'Request current availability');
    assert.equal(source.value,location.href);
    assert.equal(form.dataset.leadProjectSlug,undefined);

    location.search='?project=rosewood&interest=Pricing%20%2B%20floor-plan%20packet';
    location.href='https://example.invalid/inquire/'+location.search;
    project.value='rosewood-residences-west-palm-beach';
    // A new navigation fingerprint must replace the prior auto-populated value.
    location.pathname='/projects/rosewood-residences-west-palm-beach/';sync();
    location.pathname='/inquire/';sync();
    assert.equal(interest.value,'Pricing + floor-plan packet');
    assert.ok(interest.options.some(option=>option.value==='Pricing + floor-plan packet'));

    // Subsequent observer/submit synchronization for the same request cannot
    // overwrite a buyer's manual selection.
    interest.value='Schedule private tour';
    listeners.get('change')({target:interest});
    sync();sync();
    assert.equal(interest.value,'Schedule private tour');

    // Changing both project and request produces a new initialization pass.
    location.pathname='/projects/maison-dor/';sync();
    location.pathname='/inquire/';
    location.search='?project=maison-dor&interest=Request%20current%20availability';
    location.href='https://example.invalid/inquire/'+location.search;
    project.value='maison-dor';sync();
    assert.equal(project.value,'maison-dor');
    assert.equal(interest.value,'Request current availability');
  } finally {
    for(const key of keys){const descriptor=saved.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});
