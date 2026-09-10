import assert from 'node:assert/strict';
import test from 'node:test';
import { wireInquiryContext } from '../../src/lib/inquiryContext.ts';
import { rememberLeadAttribution } from '../../src/lib/leadCapture.ts';

test('bridge applies immediately, replaces request families, and respects manual selections', () => {
  const keys=['window','document','location','HTMLSelectElement'];
  const saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const optionSets=[
    {
      name:'legacy options',
      interest:['Request current availability','Request private floor-plan packet','Compare buildings','Schedule private tour','Ask the team about this building'],
      pricing:'Request private floor-plan packet',
      manual:'Schedule private tour',
    },
    {
      name:'canonical options',
      interest:['Request current availability','Get pricing + floor-plan packet','Compare my shortlist','Schedule a conversation or tour','Ask about this project / plan'],
      pricing:'Get pricing + floor-plan packet',
      manual:'Schedule a conversation or tour',
    },
  ];

  try {
    for(const options of optionSets){
      const store=new Map();
      const events=new Map();
      let fields;
      const form={dataset:{},querySelector:selector=>fields[selector]??null};
      class Select {
        constructor(name,values){
          this.name=name;
          this.form=form;
          this.options=values.map(value=>({value,textContent:value}));
          this._value=this.options[0]?.value??'';
        }
        get value(){return this._value;}
        set value(value){this._value=this.options.some(option=>option.value===value)?value:'';}
        dispatchEvent(event){
          assert.equal(event.bubbles,true,`${options.name}: synchronized select changes must bubble`);
          events.get(event.type)?.({type:event.type,target:this,bubbles:event.bubbles});
          return true;
        }
      }
      const project=new Select('project',['','olara','south-flagler-house']);
      const interest=new Select('interest',options.interest);
      const context={value:'contact_page'};
      const name={value:''};
      fields={
        '[name="lead_capture_context"]':context,
        'select[name="project"]':project,
        'select[name="interest"]':interest,
        '[name="project_name"]':name,
      };
      const location={href:'https://example.invalid/inquire/',pathname:'/inquire/',search:''};
      const globals={location,document:{referrer:''},HTMLSelectElement:Select,window:{location,addEventListener:()=>{},sessionStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)}}};
      for(const [key,value] of Object.entries(globals))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});

      rememberLeadAttribution({cta_context:'floorplan:olara:residence-d',cta_location:'floorplan-entity-intro',corridor:'north-flagler'});
      const sync=wireInquiryContext({querySelector:()=>form,addEventListener:(event,handler)=>events.set(event,handler)});
      // No later observer or commercial import is allowed to be necessary.
      assert.equal(project.value,'olara',options.name);assert.equal(context.value,'floorplan:olara:residence-d',options.name);
      assert.equal(interest.value,'Request current availability',options.name);
      assert.equal(form.dataset.leadCtaLocation,'floorplan-entity-intro',options.name);
      rememberLeadAttribution({cta_context:'commercial:buildings:pricing-packet'},{replaceRequest:true});sync();
      assert.equal(project.value,'',options.name);assert.equal(interest.value,options.pricing,options.name);
      assert.equal(name.value,'',options.name);assert.equal(form.dataset.leadCorridor,undefined,options.name);
      project.value='south-flagler-house';project.dispatchEvent({type:'change',bubbles:true});sync();
      assert.equal(project.value,'south-flagler-house',options.name);
      rememberLeadAttribution({cta_context:'floorplan:olara:residence-d',corridor:'north-flagler'},{replaceRequest:true});sync();
      assert.equal(project.value,'olara',options.name);assert.equal(interest.value,'Request current availability',options.name);
      interest.value=options.manual;interest.dispatchEvent({type:'change',bubbles:true});sync();
      assert.equal(interest.value,options.manual,options.name);
    }
  } finally {
    for(const key of keys){const descriptor=saved.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});
