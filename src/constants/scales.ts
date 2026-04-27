export type Response = 'true' | 'false' | null;

export interface ValidityPair {
  id1: number;
  id2: number;
  inconsistent: [Response, Response][];
  weight?: number;
}

export interface ValidityScale {
  name: string;
  description: string;
  pairs: ValidityPair[];
  offset?: number;
}

export interface ScoringScale {
  name: string;
  description: string;
  items: number[];
  reverseItems?: number[];
}

// Helper to convert Python-style tuples to ValidityPairs
const convertInconToPairs = (tuples: [number, string, number, string][]): ValidityPair[] => {
  return tuples.map(([id1, r1, id2, r2]) => ({
    id1,
    id2,
    inconsistent: [[r1.toLowerCase() as Response, r2.toLowerCase() as Response]]
  }));
};

const convertTTToPairs = (tuples: [number, number][], weight?: number): ValidityPair[] => {
  return tuples.map(([id1, id2]) => ({
    id1,
    id2,
    inconsistent: [['true', 'true']],
    weight
  }));
};

const convertFFToPairs = (tuples: [number, number][], weight?: number): ValidityPair[] => {
  return tuples.map(([id1, id2]) => ({
    id1,
    id2,
    inconsistent: [['false', 'false']],
    weight
  }));
};

// Data from Python logic
const CRIN_INCON_DATA: [number, string, number, string][] = [
    [3,  'F', 259, 'T'], [9,  'T', 119, 'F'], [25, 'T', 281, 'F'], [35, 'T', 114, 'F'],
    [47, 'T',  62, 'F'], [66, 'F', 223, 'T'], [79, 'T', 289, 'F'], [97, 'F', 196, 'T'],
    [108,'F', 152, 'T'], [139,'T', 273, 'F'], [173,'F', 200, 'T'], [220,'T', 287, 'F'],
    [263,'F', 286, 'T'], [316,'F', 329, 'T'], [5,  'T', 307, 'F'], [14, 'F', 236, 'T'],
    [25, 'F', 281, 'T'], [37, 'T', 201, 'F'], [51, 'T', 111, 'F'], [76, 'F', 230, 'T'],
    [88, 'F', 265, 'T'], [98, 'F', 275, 'T'], [123,'T', 335, 'F'], [158,'T', 260, 'F'],
    [173,'T', 200, 'F'], [239,'F', 302, 'T'], [271,'F', 303, 'T'], [5,  'F', 307, 'T'],
    [17, 'T', 288, 'F'], [26, 'F', 228, 'T'], [44, 'T', 177, 'F'], [55, 'T',  99, 'F'],
    [78, 'F', 172, 'T'], [89, 'F', 229, 'T'], [100,'T', 130, 'F'], [128,'T', 187, 'F'],
    [166,'T', 207, 'F'], [175,'F', 291, 'T'], [241,'F', 264, 'T'], [274,'F', 299, 'T'],
    [6,  'F', 136, 'T'], [20, 'T',  94, 'F'], [26, 'T', 228, 'F'], [44, 'F', 177, 'T'],
    [64, 'F',  74, 'T'], [78, 'T', 172, 'F'], [93, 'F', 164, 'T'], [108,'T', 152, 'F'],
    [134,'F', 293, 'T'], [169,'F', 224, 'T'], [175,'T', 291, 'F'], [246,'F', 282, 'T'],
    [290,'T', 318, 'F']
];

const CRIN_TT_DATA: [number, number][] = [
    [8,   198], [17,  105], [19,  145], [20,   44], [30,  217],
    [40,  290], [48,  182], [57,   67], [62,  249], [73,   75],
    [83,  120], [101, 189], [107, 278], [128, 234], [134, 160],
    [163, 247], [169, 282], [190, 320], [212, 264], [239, 300]
];

const CRIN_FF_DATA: [number, number][] = [
    [1,   22], [8,  128], [9,   40], [17,  105], [19,   58], [44,   94],
    [59, 306], [83, 158], [102, 288], [108, 246], [119, 134],
    [163, 247], [201, 278]
];

export const VALIDITY_SCALES: ValidityScale[] = [
  {
    name: 'CRIN',
    description: 'Combined Response Inconsistency',
    pairs: [
      ...convertInconToPairs(CRIN_INCON_DATA),
      ...convertTTToPairs(CRIN_TT_DATA),
      ...convertFFToPairs(CRIN_FF_DATA)
    ]
  },
  {
    name: 'VRIN',
    description: 'Variable Response Inconsistency',
    pairs: convertInconToPairs(CRIN_INCON_DATA)
  },
  {
    name: 'TRIN',
    description: 'True Response Inconsistency',
    offset: 13,
    pairs: [
      ...convertTTToPairs(CRIN_TT_DATA, 1),
      ...convertFFToPairs(CRIN_FF_DATA, -1)
    ]
  }
];


  // ── Scale definitions ─────────────────────────────────────────────────────────
 
export interface ScaleDef {
  label: string;
  domain: string;
  subdomain: string;
  true: number[];
  false: number[];
  critical?: boolean;
}
 
export const SCALES: Record<string, ScaleDef> = {
  // Validity
  F:   { label:'Infrequent Responses', domain:'Protocol Validity', subdomain:'Over-Reporting',
         true:[17,30,46,67,71,74,78,100,117,120,130,139,145,146,164,179,203,218,224,231,241,253,264,275,277,280,294,296,301,310,312,332], false:[59,83,102] },
  Fp:  { label:'Infrequent Psychopathology', domain:'Protocol Validity', subdomain:'Over-Reporting',
         true:[41,86,92,124,129,149,150,165,168,178,191,208,245,255,270,273,314,317], false:[157,221,283] },
  Fs:  { label:'Infrequent Somatic', domain:'Protocol Validity', subdomain:'Over-Reporting',
         true:[15,33,43,122,133,137,143,159,176,199,216,244,308], false:[2,186,272] },
  FBS: { label:'Symptom Validity', domain:'Protocol Validity', subdomain:'Over-Reporting',
         true:[6,15,43,76,77,79,93,101,133,187,200,211,230,247,260,315], false:[32,45,55,88,99,141,156,162,171,189,193,234,265,292] },
  RBS: { label:'Response Bias', domain:'Protocol Validity', subdomain:'Over-Reporting',
         true:[6,24,28,31,68,74,79,92,101,110,120,132,136,137,159,242,245,268,273], false:[7,21,53,59,125,131,156,219,325] },
  L:   { label:'Uncommon Virtues', domain:'Protocol Validity', subdomain:'Under-Reporting',
         true:[70,268], false:[16,45,58,95,127,154,156,183,210,243,298,325] },
  K:   { label:'Adjustment Validity', domain:'Protocol Validity', subdomain:'Under-Reporting',
         true:[163,202,234,335], false:[32,72,99,171,187,263,271,306,309,322] },
  // Higher-Order
  EID: { label:'Emotional/Internalizing Dysfunction', domain:'Emotional Dysfunction', subdomain:'Higher-Order',
         true:[17,22,30,35,48,78,89,90,114,119,120,128,158,167,169,172,187,204,228,229,250,252,260,288,322,331], false:[1,20,57,62,73,83,102,105,140,202,217,222,234,246,282,293] },
  THD: { label:'Thought Dysfunction', domain:'Thought Dysfunction', subdomain:'Higher-Order',
         true:[12,46,71,92,109,122,129,139,148,150,165,168,179,199,203,216,241,245,264,270,273,294,311,330,332], false:[85,212] },
  BXD: { label:'Behavioral/Externalizing Dysfunction', domain:'Behavioral Dysfunction', subdomain:'Higher-Order',
         true:[21,34,39,49,66,82,84,96,131,156,205,223,231,253,259,266,312,316,319,320,329], false:[61,190,237] },
  // RC Scales
  RCd: { label:'Demoralization', domain:'Emotional Dysfunction', subdomain:'RC Scales',
         true:[17,22,30,48,89,144,152,158,172,187,204,229,260,288,331], false:[105,217] },
  RC1: { label:'Somatic Complaints', domain:'Somatic/Cognitive Dysfunction', subdomain:'RC Scales',
         true:[15,43,76,101,137,176,211,230,277,301,328], false:[65,69,88,113,125,162,189,227,265,313] },
  RC2: { label:'Low Positive Emotions', domain:'Emotional Dysfunction', subdomain:'RC Scales',
         true:[78], false:[1,20,47,62,83,102,140,195,222,246,282,302,323] },
  RC4: { label:'Antisocial Behavior', domain:'Behavioral Dysfunction', subdomain:'RC Scales',
         true:[21,34,66,96,141,156,205,223,266,297,320,329], false:[19,190] },
  RC6: { label:'Ideas of Persecution', domain:'Thought Dysfunction', subdomain:'RC Scales',
         true:[71,92,109,148,165,168,179,194,233,241,254,264,310], false:[212], critical:true },
  RC7: { label:'Dysfunctional Negative Emotions', domain:'Emotional Dysfunction', subdomain:'RC Scales',
         true:[9,42,63,77,90,115,119,167,206,228,250,261,263,271,275,289,303,318,322], false:[] },
  RC8: { label:'Aberrant Experiences', domain:'Thought Dysfunction', subdomain:'RC Scales',
         true:[12,36,46,110,122,139,159,161,199,240,245,257,270,273,294,311,330], false:[85], critical:true },
  RC9: { label:'Hypomanic Activation', domain:'Behavioral Dysfunction', subdomain:'RC Scales',
         true:[3,39,72,82,84,131,155,166,181,207,219,259,267,285], false:[61] },
  // Somatic/Cognitive
  MLS: { label:'Malaise', domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         true:[18,247], false:[163,174,202,262,333] },
  NUC: { label:'Neurological Complaints', domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         true:[122,277,301], false:[69,113,125,162,186,227,313] },
  EAT: { label:'Eating Concerns', domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         true:[51,100,111,130,209], false:[] },
  COG: { label:'Cognitive Complaints', domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         true:[6,25,31,117,136,173,200,279,281,306], false:[59] },
  // Internalizing
  SUI: { label:'Suicidal/Death Ideation', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[38,93,120,126,149,164,251], false:[], critical:true },
  HLP: { label:'Helplessness/Hopelessness', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[118,169,214,224,238,296], false:[282], critical:true },
  SFD: { label:'Self-Doubt', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[17,48,89,184,229,249,288], false:[] },
  NFC: { label:'Inefficacy', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[27,68,108,144,152,198,274,299,324], false:[] },
  STR: { label:'Stress', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[112,128,167], false:[8,73,234] },
  WRY: { label:'Worry', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[29,98,123,232,286,309,335], false:[] },
  CMP: { label:'Compulsivity', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[14,42,52,56,106,170,236,261], false:[] },
  ARX: { label:'Anxiety-Related Experiences', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[26,54,75,79,143,146,220,226,228,235,244,252,275,287,289], false:[], critical:true },
  ANP: { label:'Anger Proneness', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[9,119,155,160,248,290,303,318,334], false:[40,134,293] },
  BRF: { label:'Behavior-Restricting Fears', domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         true:[13,50,135,151,208,305,317], false:[] },
  // Externalizing
  FML: { label:'Family Problems', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[58,103,138,145,180,215,280], false:[19,80,269] },
  JCP: { label:'Juvenile Conduct Problems', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[21,66,96,205,223,253,320], false:[] },
  SUB: { label:'Substance Abuse', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[34,49,141,192,266,297,312,319], false:[237], critical:true },
  IMP: { label:'Impulsivity', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[3,39,64,82,116,259], false:[] },
  ACT: { label:'Activation', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[72,81,166,181,207,219,267,285], false:[] },
  AGG: { label:'Aggression', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[23,28,84,231,316,329], false:[], critical:true },
  CYN: { label:'Cynicism', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         true:[10,32,55,87,99,121,142,171,185,213,256,258,304], false:[] },
  // Interpersonal
  SFI: { label:'Self-Importance', domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
         true:[4,11,47,62,182,188,239,284,326], false:[91] },
  DOM: { label:'Dominance', domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
         true:[60,104,147,197,276,302,327], false:[24,300] },
  DSF: { label:'Disaffiliativeness', domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
         true:[5,67,97,175,196,291,307], false:[] },
  SAV: { label:'Social Avoidance', domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
         true:[278], false:[20,37,57,94,107,153,201,222] },
  SHY: { label:'Shyness', domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
         true:[35,44,90,114,177,225], false:[295] },
  // PSY-5
  AGGR: { label:'Aggressiveness', domain:'Interpersonal Functioning', subdomain:'PSY-5 Scales',
          true:[28,60,84,104,147,197,231,276,302,316,321,327,329], false:[24,198] },
  PSYC: { label:'Psychoticism', domain:'Thought Dysfunction', subdomain:'PSY-5 Scales',
          true:[12,71,92,129,139,168,199,203,216,240,241,245,264,270,273,294,311,330,332], false:[85] },
  DISC: { label:'Disconstraint', domain:'Behavioral Dysfunction', subdomain:'PSY-5 Scales',
          true:[21,34,39,49,66,82,141,205,223,253,259,266,297,319,320], false:[61,190,237] },
  NEGE: { label:'Neg. Emotionality/Neuroticism', domain:'Emotional Dysfunction', subdomain:'PSY-5 Scales',
          true:[26,75,98,115,123,146,206,228,232,252,263,286,335], false:[73,293] },
  INTR: { label:'Introversion/Low Positive Emotionality', domain:'Emotional Dysfunction', subdomain:'PSY-5 Scales',
          true:[78,278], false:[1,7,20,37,53,57,107,140,153,195,201,222] },
};

// Helper to map SCALES to the old ScoringScale format for backward compatibility
const mapToScoringScale = (keys: string[]): ScoringScale[] => {
  return keys.map(key => ({
    name: key,
    description: SCALES[key].label,
    items: SCALES[key].true,
    reverseItems: SCALES[key].false
  }));
};

export const INFREQUENT_SCALES = mapToScoringScale(['F', 'Fp', 'Fs']);
export const BIAS_VIRTUE_SCALES = mapToScoringScale(['FBS', 'RBS', 'L', 'K']);
export const HO_SCALES = mapToScoringScale(['EID', 'THD', 'BXD']);
export const RC_SCALES = mapToScoringScale(['RCd', 'RC1', 'RC2', 'RC4', 'RC6', 'RC7', 'RC8', 'RC9']);
export const SOMATIC_COGNITIVE_SCALES = mapToScoringScale(['MLS', 'NUC', 'EAT', 'COG']);
export const INTERNALIZING_SCALES = mapToScoringScale(['SUI', 'HLP', 'SFD', 'NFC', 'STR', 'WRY', 'CMP', 'ARX', 'ANP', 'BRF']);
export const EXTERNALIZING_SCALES = mapToScoringScale(['FML', 'JCP', 'SUB', 'IMP', 'ACT', 'AGG', 'CYN']);
export const INTERPERSONAL_SCALES = mapToScoringScale(['SFI', 'DOM', 'DSF', 'SAV', 'SHY']);
export const PSY5_SCALES = mapToScoringScale(['AGGR', 'PSYC', 'DISC', 'NEGE', 'INTR']);

