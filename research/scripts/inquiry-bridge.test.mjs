import assert from 'node:assert/strict';
import test from 'node:test';
import { wireInquiryContext } from '../../src/lib/inquiryContext.ts';
import { rememberLeadAttribution } from '../../src/lib/leadCapture.ts';

test('bridge applies immediately, replaces request families, and respects manual selections', () => {
  const keys=['window','document','location','HTMLSelectElement'];
  const saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const store=new Map();
  const events=new Map();
  const form={dataset:{},querySelector:selector=>fields[selector]??null};
  class Select { constructor(name){this.name=name;this.value='';this.form=form;} }
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
  const globals={location,document:{referrer:''},HTMLSelectElement:Select,window:{location,addEventListener:()=>{},sessionStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)}}};
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
