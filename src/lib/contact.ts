export const BROOKE_CONTACT = {
  name: "Brooke Snader",
  fullName: "Brooke Matthew Snader",
  group: "The Scott Gordon Group",
  brokerage: "Douglas Elliman Real Estate",
  legalBrokerage: "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
  brokerageLicense: "CQ1020232",
  phone: "561-891-0816",
  phoneDisplay: "(561) 891-0816",
  phoneHref: "tel:+15618910816",
  email: "brooke.snader@gmail.com",
  license: "BK3291335",
  privacyUrl: "https://www.elliman.com/privacy-policy",
  termsUrl: "https://www.elliman.com/terms-of-service",
} as const;

export const advisorProfile = {
  name: BROOKE_CONTACT.name,
  title: "Broker Associate",
  brokerage: BROOKE_CONTACT.brokerage,
  brokerageLicense: BROOKE_CONTACT.brokerageLicense,
  mobile: BROOKE_CONTACT.phone,
  mobileHref: BROOKE_CONTACT.phoneHref,
  license: BROOKE_CONTACT.license,
  email: BROOKE_CONTACT.email,
  privacyUrl: BROOKE_CONTACT.privacyUrl,
  termsUrl: BROOKE_CONTACT.termsUrl,
} as const;
