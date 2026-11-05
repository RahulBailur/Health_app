/* Safety checks shared by the browser and the server. Emergencies are caught
   with plain pattern matching so they never wait on (or depend on) an AI call. */

const EMERGENCY = [
  /chest (pain|tight|pressure)/i, /heart attack/i, /stroke/i, /face (droop|drooping)/i, /slurred speech/i,
  /can'?t breathe|cannot breathe|difficulty breathing|short(ness)? of breath/i, /faint(ed|ing)?|passed out|unconscious/i,
  /anaphyla|throat (swelling|closing)|swollen (lips|tongue|throat)|severe allergic/i, /seizure|fits/i,
  /suicid|kill myself|self.?harm/i, /overdose|poison(ed|ing)?/i, /vomiting blood|black stool/i,
];

const BLOOD_THINNERS = /blood thinner|warfarin|acitrom|acenocoumarol|apixaban|rivaroxaban|dabigatran|clopidogrel|aspirin|ecosprin/i;
const INTERACTING = /fish oil|omega|turmeric|curcumin|ginkgo|garlic (pill|capsule|supplement)|vitamin e|vitamin k|green tea extract|supplement|ashwagandha/i;

export const isEmergency = (q: string) => EMERGENCY.some((r) => r.test(q));
export const mentionsBloodThinner = (q: string) => BLOOD_THINNERS.test(q);
export const needsInteractionWarning = (q: string) => BLOOD_THINNERS.test(q) && INTERACTING.test(q);
