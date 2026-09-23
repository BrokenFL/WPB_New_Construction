/** Visible buyer paths shared by prerendering and the SPA. No mutable project facts. */
const plans=(id,label)=>[label,`/floorplans/#floorplans-${id}`];
const inquiry=id=>['Plan a sales-gallery visit with The Scott Gordon Group',`/inquire/?project=${id}&interest=availability`];
const guides={
 'nora-house':['Before a NORA House sales-gallery visit',[plans('nora-house','Review released NORA House floor plans'),['Compare NORA House and Banyan Tree','/compare/?projects=nora-house,banyan-tree'],['Explore the Downtown condo corridor','/corridors/downtown-west-palm-beach/'],inquiry('nora-house')]],
 'banyan-tree':['Before a Banyan Tree sales-gallery visit',[['Request the current Banyan Tree floor-plan packet','/inquire/?project=banyan-tree&interest=floorplans'],['Compare Banyan Tree and NORA House','/compare/?projects=banyan-tree,nora-house'],['Explore the Downtown condo corridor','/corridors/downtown-west-palm-beach/'],inquiry('banyan-tree')]],
 'olara':['Compare the residence before the appointment',[['Read the Olara Residence D layout guide','/floorplans/olara/residence-d/'],['Compare Olara and Ritz-Carlton','/compare/?projects=olara,ritz-carlton-wpb'],['Explore North Flagler condos','/corridors/north-flagler/'],inquiry('olara')]],
 'ritz-carlton-wpb':['Compare the residence before the appointment',[plans('ritz-carlton-wpb','Review released Ritz-Carlton floor plans'),['Compare Ritz-Carlton and Olara','/compare/?projects=ritz-carlton-wpb,olara'],['Explore North Flagler condos','/corridors/north-flagler/'],inquiry('ritz-carlton-wpb')]],
 'north-flagler':['From a North Flagler shortlist to a specific plan',[['Review Olara pricing and floor plans','/projects/olara/'],['Review the Ritz-Carlton buyer guide','/projects/ritz-carlton-wpb/'],['Study Olara Residence D','/floorplans/olara/residence-d/'],['Compare Olara and Ritz-Carlton','/compare/?projects=olara,ritz-carlton-wpb']]],
 'nora-house-turns-the-district-into-a-buyer-decision':['Research the current NORA House offering',[['NORA House prices, released plans and sales-gallery guidance','/projects/nora-house/'],plans('nora-house','Review NORA House floor plans')]],
 'nora-district-downtown-transformation':['Considering a condominium in the district?',[['Research NORA House condos and released floor plans','/projects/nora-house/'],['Compare Downtown condominium settings','/corridors/downtown-west-palm-beach/']]],
};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderRevenueBuyerResearch(key){
 const entry=Object.hasOwn(guides,key)?guides[key]:undefined;
 if(!entry)return '';
 const intro=key==='banyan-tree'?'Ask for the current residence packet, then compare layouts and services. We can help confirm availability and arrange an introduction before your visit.':'Use the published plans to narrow the choices. Ask us to confirm current residence availability and arrange an introduction before your visit.';
 return `<link rel="stylesheet" href="/assets/styles/revenue-buyer-research.css"><section class="section revenue-buyer-research" data-revenue-buyer-research="${escape(key)}"><h2>${escape(entry[0])}</h2><p>${escape(intro)}</p><nav aria-label="Related buyer research"><ul>${entry[1].map(([label,href])=>`<li><a href="${escape(href)}">${escape(label)}</a></li>`).join('')}</ul></nav></section>`;
}
