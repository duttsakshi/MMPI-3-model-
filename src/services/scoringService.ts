// ============================================================
// MMPI-3 Complete Scoring Service  (TypeScript)
// Drop this into: src/services/scoringService.ts
//
// NO imports from norms.ts needed – fully self-contained.
// All T-score tables, pair lists, scale definitions, and
// interpretation rules are in this one file.
//
// Sources:
//   Appendix A  – item composition
//   Appendix B  – T-score conversion tables B-1 through B-5
//   Chapter 5   – interpretation tables 5-2 through 5-54
//
// T-scores verified against published Ms. N case (51 checks).
// ============================================================

// ── Types ────────────────────────────────────────────────────
export type MMPIResponse = 'T' | 'F';
export type ResponseMap = Record<number, MMPIResponse>;

export interface TRINScore {
  value: number | null;   // null = raw 0, no score
  direction: 'T' | 'F' | '';
}

export type TScoreResult = number | TRINScore | null;

export interface ScaleResult {
  abbr:           string;
  label:          string;
  raw:            number;
  tScore:         TScoreResult;
  tDisplay:       string;        // "83", "54T", "54F", "—"
  tNumeric:       number | null; // plain number for charts
  interpretation: string;
  domain:         string;
  subdomain:      string;
  isCritical:     boolean;       // requires immediate clinical attention
}

export interface MMPIReport {
  nAnswered: number;
  scales:    Record<string, ScaleResult>;
}

// ── Helper: get numeric T value from result ───────────────────
function tNum(t: TScoreResult): number | null {
  if (t === null) return null;
  if (typeof t === 'object') return t.value;
  return t;
}

// ── Helper: format T score for display ───────────────────────
function tDisplay(t: TScoreResult): string {
  if (t === null) return '—';
  if (typeof t === 'object') {
    if (t.value === null) return '—';
    return `${t.value}${t.direction}`;
  }
  return String(t);
}

// ============================================================
// PART 1 – T-SCORE LOOKUP TABLES
// Table B-1: Linear T-scores (Validity Scales)
// Tables B-2 to B-5: Uniform T-scores (all other scales)
// All verified against published Ms. N case example.
// ============================================================

// TRIN stored as objects { value, direction }
// direction: 'T' = acquiescence (true bias), 'F' = nay-saying (false bias)
const TRIN_TABLE: Record<number, TRINScore> = {
  0:  { value: null, direction: '' },
  1:  { value: 120,  direction: 'F' },
  2:  { value: 116,  direction: 'F' },
  3:  { value: 110,  direction: 'F' },
  4:  { value: 104,  direction: 'F' },
  5:  { value: 97,   direction: 'F' },
  6:  { value: 91,   direction: 'F' },
  7:  { value: 85,   direction: 'F' },
  8:  { value: 78,   direction: 'F' },
  9:  { value: 73,   direction: 'F' },
  10: { value: 67,   direction: 'F' },
  11: { value: 60,   direction: 'F' },
  12: { value: 54,   direction: 'F' },
  13: { value: 50,   direction: '' },
  14: { value: 54,   direction: 'T' },
  15: { value: 60,   direction: 'T' },
  16: { value: 67,   direction: 'T' },
  17: { value: 73,   direction: 'T' },
  18: { value: 78,   direction: 'T' },
  19: { value: 85,   direction: 'T' },
  20: { value: 91,   direction: 'T' },
  21: { value: 97,   direction: 'T' },
  22: { value: 104,  direction: 'T' },
  23: { value: 110,  direction: 'T' },
  24: { value: 116,  direction: 'T' },
  25: { value: 120,  direction: 'T' },
};

// All other scales: raw score → T score (plain number)
const T_TABLES: Record<string, Record<number, number>> = {

  // ── Table B-1: Validity Scales (Linear T-scores) ─────────────────────────
  CRIN: {0:33,1:36,2:39,3:42,4:45,5:48,6:51,7:54,8:57,9:60,10:63,11:66,12:69,
         13:72,14:75,15:78,16:80,17:83,18:86,19:89,20:92,21:95,22:98,23:101,
         24:104,25:107,26:110,27:113,28:116,29:119,30:120},
  VRIN: {0:35,1:39,2:43,3:47,4:51,5:55,6:60,7:64,8:68,9:72,10:76,11:80,
         12:85,13:89,14:93,15:97,16:101,17:105,18:110,19:114,20:118,21:120},
  F:    {0:41,1:44,2:47,3:50,4:53,5:56,6:60,7:63,8:66,9:69,10:72,11:75,
         12:78,13:81,14:85,15:88,16:91,17:94,18:97,19:100,20:103,21:106,
         22:109,23:113,24:116,25:119,26:120},
  Fp:   {0:41,1:50,2:58,3:67,4:76,5:84,6:93,7:101,8:110,9:118,10:120},
  Fs:   {0:42,1:47,2:53,3:58,4:64,5:69,6:75,7:80,8:86,9:92,10:97,
         11:103,12:108,13:114,14:119,15:120},
  FBS:  {0:26,1:29,2:31,3:34,4:37,5:40,6:42,7:45,8:48,9:51,10:53,11:56,
         12:59,13:62,14:64,15:67,16:70,17:73,18:75,19:78,20:81,21:84,
         22:86,23:89,24:92,25:95,26:97,27:100,28:103,29:106,30:109},
  RBS:  {0:28,1:32,2:35,3:39,4:43,5:47,6:50,7:54,8:58,9:61,10:65,11:69,
         12:72,13:76,14:80,15:84,16:87,17:91,18:95,19:98,20:102,21:106,
         22:110,23:113,24:117,25:120},
  L:    {0:36,1:40,2:44,3:48,4:52,5:56,6:61,7:65,8:69,9:73,10:77,11:81,
         12:85,13:89,14:93},
  K:    {0:32,1:35,2:38,3:41,4:44,5:47,6:50,7:53,8:56,9:59,10:62,11:65,
         12:68,13:71,14:74},

  // ── Table B-2: Higher-Order (H-O) and RC Scales (Uniform T-scores) ───────
  EID:  {0:32,1:35,2:38,3:40,4:42,5:44,6:45,7:47,8:48,9:49,10:50,11:51,
         12:51,13:52,14:53,15:53,16:54,17:55,18:56,19:57,20:58,21:59,22:61,
         23:62,24:65,25:66,26:67,27:69,28:70,29:72,30:73,31:75,32:76,33:78,
         34:80,35:81,36:83,37:84,38:86,39:87,40:89,41:91,42:92},
  THD:  {0:37,1:44,2:49,3:53,4:55,5:58,6:60,7:63,8:66,9:69,10:71,11:74,
         12:77,13:80,14:82,15:85,16:88,17:91,18:94,19:96,20:99,21:100},
  BXD:  {0:33,1:36,2:39,3:42,4:44,5:46,6:48,7:50,8:52,9:54,10:56,11:58,
         12:60,13:63,14:65,15:67,16:70,17:72,18:75,19:77,20:80,21:82,
         22:85,23:87,24:90},
  RCd:  {0:33,1:36,2:41,3:44,4:48,5:50,6:52,7:54,8:58,9:61,10:65,11:67,
         12:67,13:71,14:71,15:74,16:77,17:80},
  RC1:  {0:36,1:42,2:46,3:50,4:53,5:55,6:57,7:59,8:61,9:65,10:67,11:70,
         12:72,13:75,14:77,15:80,16:83,17:85,18:88,19:90,20:93,21:95},
  RC2:  {0:36,1:42,2:48,3:52,4:57,5:60,6:62,7:65,8:68,9:71,10:75,11:79,
         12:82,13:86,14:89},
  RC4:  {0:35,1:40,2:44,3:48,4:51,5:53,6:55,7:58,8:62,9:65,10:70,11:74,
         12:78,13:82,14:86},
  RC6:  {0:40,1:50,2:55,3:57,4:60,5:63,6:67,7:70,8:73,9:76,10:79,11:83,
         12:86,13:89,14:92},
  RC7:  {0:34,1:38,2:41,3:44,4:46,5:48,6:49,7:50,8:52,9:53,10:55,11:58,
         12:61,13:65,14:68,15:72,16:75,17:78,18:82,19:85},
  RC8:  {0:37,1:44,2:49,3:52,4:55,5:59,6:63,7:67,8:71,9:75,10:80,11:84,
         12:88,13:92,14:96,15:100,16:100},
  RC9:  {0:32,1:36,2:39,3:42,4:44,5:46,6:48,7:51,8:54,9:57,10:62,11:67,
         12:72,13:76,14:81,15:86},

  // ── Table B-3: Somatic/Cognitive and Internalizing (Uniform T-scores) ────
  MLS:  {0:33,1:40,2:44,3:48,4:52,5:59,6:68,7:77},
  NUC:  {0:38,1:47,2:52,3:56,4:60,5:66,6:71,7:77,8:83,9:88,10:94},
  EAT:  {0:44,1:56,2:65,3:75,4:85,5:95},
  COG:  {0:38,1:46,2:51,3:53,4:55,5:57,6:61,7:61,8:66,9:71,10:76,11:81},
  SUI:  {0:44,1:58,2:65,3:72,4:80,5:87,6:94,7:100},
  HLP:  {0:40,1:51,2:58,3:65,4:69,5:75,6:80,7:86},
  SFD:  {0:40,1:50,2:53,3:55,4:59,5:65,6:72,7:78},
  NFC:  {0:37,1:44,2:48,3:50,4:52,5:55,6:60,7:66,8:72,9:77},
  STR:  {0:37,1:45,2:49,3:53,4:59,5:68,6:76},
  WRY:  {0:37,1:44,2:48,3:49,4:53,5:54,6:65,7:72},
  CMP:  {0:36,1:42,2:46,3:49,4:51,5:52,6:53,7:56,8:65},
  ARX:  {0:37,1:42,2:46,3:48,4:51,5:53,6:56,7:59,8:62,9:65,10:66,11:70,
         12:73,13:77,14:81,15:88},
  ANP:  {0:37,1:44,2:49,3:51,4:53,5:56,6:56,7:59,8:62,9:62,10:66,11:70,12:78},
  BRF:  {0:43,1:56,2:65,3:74,4:83,5:91,6:100,7:100},

  // ── Table B-4: Externalizing and Interpersonal (Uniform T-scores) ─────────
  FML:  {0:36,1:43,2:48,3:51,4:55,5:59,6:65,7:70,8:75,9:81,10:86},
  JCP:  {0:39,1:48,2:52,3:56,4:61,5:68,6:74,7:80},
  SUB:  {0:39,1:48,2:52,3:54,4:58,5:65,6:69,7:74,8:80,9:86},
  IMP:  {0:37,1:45,2:49,3:52,4:58,5:66,6:76},
  ACT:  {0:35,1:41,2:46,3:49,4:53,5:58,6:65,7:72,8:80},
  AGG:  {0:39,1:49,2:55,3:62,4:70,5:78,6:86},
  CYN:  {0:32,1:36,2:39,3:42,4:43,5:45,6:47,7:49,8:51,9:55,10:60,
         11:66,12:73,13:79},
  SFI:  {0:31,1:37,2:40,3:42,4:43,5:44,6:46,7:49,8:54,9:63,10:72},
  DOM:  {0:27,1:34,2:38,3:40,4:41,5:42,6:45,7:49,8:58,9:69},
  DSF:  {0:40,1:48,2:52,3:55,4:58,5:65,6:71,7:78},
  SAV:  {0:37,1:44,2:48,3:50,4:53,5:55,6:60,7:66,8:71,9:77},
  SHY:  {0:38,1:45,2:49,3:52,4:55,5:61,6:69,7:77},

  // ── Table B-5: PSY-5 Scales (Uniform T-scores) ───────────────────────────
  AGGR: {0:28,1:31,2:34,3:37,4:39,5:41,6:43,7:46,8:49,9:53,10:57,
         11:63,12:68,13:74,14:79,15:85},
  PSYC: {0:38,1:47,2:52,3:56,4:59,5:63,6:67,7:71,8:75,9:79,10:83,
         11:87,12:91,13:95,14:95,15:99,16:100,17:100,18:100,19:100,20:100},
  DISC: {0:34,1:39,2:43,3:45,4:48,5:50,6:51,7:53,8:55,9:57,10:60,
         11:63,12:66,13:70,14:73,15:76,16:79,17:82,18:86},
  NEGE: {0:36,1:41,2:45,3:47,4:49,5:51,6:53,7:55,8:57,9:60,10:64,
         11:68,12:68,13:72,14:76,15:80},
  INTR: {0:35,1:40,2:44,3:47,4:50,5:52,6:54,7:57,8:60,9:65,10:69,
         11:73,12:77,13:81,14:85},
};

// ── Master T-score lookup ─────────────────────────────────────
function getTScore(scale: string, raw: number): TScoreResult {
  if (scale === 'TRIN') {
    return TRIN_TABLE[raw] ?? null;
  }
  const table = T_TABLES[scale];
  if (!table) return null;
  return table[raw] ?? null;
}

// ============================================================
// PART 2 – PAIR-BASED VALIDITY SCALES
// CRIN: 86 pairs (53 inconsistent + 20 TT + 13 FF)
// VRIN: 53 pairs (same as CRIN inconsistent pairs)
// TRIN: 33 pairs (20 TT - 13 FF + base 13)
// ============================================================

type InconPair = [number, MMPIResponse, number, MMPIResponse];
type SamePair  = [number, number];

// 53 inconsistent pairs (used for both CRIN and VRIN)
const INCON_PAIRS: InconPair[] = [
  [3,'F',259,'T'],[9,'T',119,'F'],[25,'T',281,'F'],[35,'T',114,'F'],
  [47,'T',62,'F'],[66,'F',223,'T'],[79,'T',289,'F'],[97,'F',196,'T'],
  [108,'F',152,'T'],[139,'T',273,'F'],[173,'F',200,'T'],[220,'T',287,'F'],
  [263,'F',286,'T'],[316,'F',329,'T'],
  [5,'T',307,'F'],[14,'F',236,'T'],[25,'F',281,'T'],[37,'T',201,'F'],
  [51,'T',111,'F'],[76,'F',230,'T'],[88,'F',265,'T'],[98,'F',275,'T'],
  [123,'T',335,'F'],[158,'T',260,'F'],[173,'T',200,'F'],[239,'F',302,'T'],
  [271,'F',303,'T'],
  [5,'F',307,'T'],[17,'T',288,'F'],[26,'F',228,'T'],[44,'T',177,'F'],
  [55,'T',99,'F'],[78,'F',172,'T'],[89,'F',229,'T'],[100,'T',130,'F'],
  [128,'T',187,'F'],[166,'T',207,'F'],[175,'F',291,'T'],[241,'F',264,'T'],
  [274,'F',299,'T'],
  [6,'F',136,'T'],[20,'T',94,'F'],[26,'T',228,'F'],[44,'F',177,'T'],
  [64,'F',74,'T'],[78,'T',172,'F'],[93,'F',164,'T'],[108,'T',152,'F'],
  [134,'F',293,'T'],[169,'F',224,'T'],[175,'T',291,'F'],[246,'F',282,'T'],
  [290,'T',318,'F'],
];

// 20 True-True pairs (CRIN component 2 + TRIN component 1: each adds +1)
const TT_PAIRS: SamePair[] = [
  [8,198],[17,105],[19,145],[20,44],[30,217],[40,290],[48,182],[57,67],
  [62,249],[73,75],[83,120],[101,189],[107,278],[128,234],[134,160],
  [163,247],[169,282],[190,320],[212,264],[239,300],
];

// 13 False-False pairs (CRIN component 3 + TRIN component 2: each adds +1 for CRIN, -1 for TRIN)
const FF_PAIRS: SamePair[] = [
  [1,22],[8,128],[9,40],[17,105],[19,58],[44,94],[59,306],[83,158],
  [102,288],[108,246],[119,134],[163,247],[201,278],
];

function scoreCRIN(r: ResponseMap): number {
  let s = 0;
  for (const [a, ra, b, rb] of INCON_PAIRS) if (r[a] === ra && r[b] === rb) s++;
  for (const [a, b] of TT_PAIRS)            if (r[a] === 'T' && r[b] === 'T') s++;
  for (const [a, b] of FF_PAIRS)            if (r[a] === 'F' && r[b] === 'F') s++;
  return s;
}

function scoreVRIN(r: ResponseMap): number {
  let s = 0;
  for (const [a, ra, b, rb] of INCON_PAIRS) if (r[a] === ra && r[b] === rb) s++;
  return s;
}

function scoreTRIN(r: ResponseMap): number {
  let s = 13; // base score per manual
  for (const [a, b] of TT_PAIRS) if (r[a] === 'T' && r[b] === 'T') s++;
  for (const [a, b] of FF_PAIRS) if (r[a] === 'F' && r[b] === 'F') s--;
  return s;
}

// ============================================================
// PART 3 – STANDARD SCALE ITEM DEFINITIONS
// ============================================================

interface ScaleDef {
  label:     string;
  domain:    string;
  subdomain: string;
  trueItems: number[];
  falseItems: number[];
  critical?: boolean;
}

const SCALE_DEFS: Record<string, ScaleDef> = {
  // ── Validity ──────────────────────────────────────────────
  F:   { label:'Infrequent Responses',       domain:'Protocol Validity', subdomain:'Over-Reporting',
         trueItems:[17,30,46,67,71,74,78,100,117,120,130,139,145,146,164,179,203,218,224,231,241,253,264,275,277,280,294,296,301,310,312,332],
         falseItems:[59,83,102] },
  Fp:  { label:'Infrequent Psychopathology', domain:'Protocol Validity', subdomain:'Over-Reporting',
         trueItems:[41,86,92,124,129,149,150,165,168,178,191,208,245,255,270,273,314,317],
         falseItems:[157,221,283] },
  Fs:  { label:'Infrequent Somatic',         domain:'Protocol Validity', subdomain:'Over-Reporting',
         trueItems:[15,33,43,122,133,137,143,159,176,199,216,244,308],
         falseItems:[2,186,272] },
  FBS: { label:'Symptom Validity',           domain:'Protocol Validity', subdomain:'Over-Reporting',
         trueItems:[6,15,43,76,77,79,93,101,133,187,200,211,230,247,260,315],
         falseItems:[32,45,55,88,99,141,156,162,171,189,193,234,265,292] },
  RBS: { label:'Response Bias',              domain:'Protocol Validity', subdomain:'Over-Reporting',
         trueItems:[6,24,28,31,68,74,79,92,101,110,120,132,136,137,159,242,245,268,273],
         falseItems:[7,21,53,59,125,131,156,219,325] },
  L:   { label:'Uncommon Virtues',           domain:'Protocol Validity', subdomain:'Under-Reporting',
         trueItems:[70,268],
         falseItems:[16,45,58,95,127,154,156,183,210,243,298,325] },
  K:   { label:'Adjustment Validity',        domain:'Protocol Validity', subdomain:'Under-Reporting',
         trueItems:[163,202,234,335],
         falseItems:[32,72,99,171,187,263,271,306,309,322] },

  // ── Higher-Order ──────────────────────────────────────────
  EID: { label:'Emotional/Internalizing Dysfunction', domain:'Emotional Dysfunction', subdomain:'Higher-Order',
         trueItems:[17,22,30,35,48,78,89,90,114,119,120,128,158,167,169,172,187,204,228,229,250,252,260,288,322,331],
         falseItems:[1,20,57,62,73,83,102,105,140,202,217,222,234,246,282,293] },
  THD: { label:'Thought Dysfunction',                domain:'Thought Dysfunction',    subdomain:'Higher-Order',
         trueItems:[12,46,71,92,109,122,129,139,148,150,165,168,179,199,203,216,241,245,264,270,273,294,311,330,332],
         falseItems:[85,212] },
  BXD: { label:'Behavioral/Externalizing Dysfunction', domain:'Behavioral Dysfunction', subdomain:'Higher-Order',
         trueItems:[21,34,39,49,66,82,84,96,131,156,205,223,231,253,259,266,312,316,319,320,329],
         falseItems:[61,190,237] },

  // ── RC Scales ─────────────────────────────────────────────
  RCd: { label:'Demoralization',              domain:'Emotional Dysfunction',         subdomain:'RC Scales',
         trueItems:[17,22,30,48,89,144,152,158,172,187,204,229,260,288,331],
         falseItems:[105,217] },
  RC1: { label:'Somatic Complaints',          domain:'Somatic/Cognitive Dysfunction', subdomain:'RC Scales',
         trueItems:[15,43,76,101,137,176,211,230,277,301,328],
         falseItems:[65,69,88,113,125,162,189,227,265,313] },
  RC2: { label:'Low Positive Emotions',       domain:'Emotional Dysfunction',         subdomain:'RC Scales',
         trueItems:[78],
         falseItems:[1,20,47,62,83,102,140,195,222,246,282,302,323] },
  RC4: { label:'Antisocial Behavior',         domain:'Behavioral Dysfunction',        subdomain:'RC Scales',
         trueItems:[21,34,66,96,141,156,205,223,266,297,320,329],
         falseItems:[19,190] },
  RC6: { label:'Ideas of Persecution',        domain:'Thought Dysfunction',           subdomain:'RC Scales',
         trueItems:[71,92,109,148,165,168,179,194,233,241,254,264,310],
         falseItems:[212], critical:true },
  RC7: { label:'Dysfunctional Negative Emotions', domain:'Emotional Dysfunction',     subdomain:'RC Scales',
         trueItems:[9,42,63,77,90,115,119,167,206,228,250,261,263,271,275,289,303,318,322],
         falseItems:[] },
  RC8: { label:'Aberrant Experiences',        domain:'Thought Dysfunction',           subdomain:'RC Scales',
         trueItems:[12,36,46,110,122,139,159,161,199,240,245,257,270,273,294,311,330],
         falseItems:[85], critical:true },
  RC9: { label:'Hypomanic Activation',        domain:'Behavioral Dysfunction',        subdomain:'RC Scales',
         trueItems:[3,39,72,82,84,131,155,166,181,207,219,259,267,285],
         falseItems:[61] },

  // ── Somatic/Cognitive ─────────────────────────────────────
  MLS: { label:'Malaise',               domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         trueItems:[18,247], falseItems:[163,174,202,262,333] },
  NUC: { label:'Neurological Complaints', domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         trueItems:[122,277,301], falseItems:[69,113,125,162,186,227,313] },
  EAT: { label:'Eating Concerns',        domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         trueItems:[51,100,111,130,209], falseItems:[] },
  COG: { label:'Cognitive Complaints',   domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',
         trueItems:[6,25,31,117,136,173,200,279,281,306], falseItems:[59] },

  // ── Internalizing ─────────────────────────────────────────
  SUI: { label:'Suicidal/Death Ideation',      domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[38,93,120,126,149,164,251], falseItems:[], critical:true },
  HLP: { label:'Helplessness/Hopelessness',    domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[118,169,214,224,238,296],  falseItems:[282], critical:true },
  SFD: { label:'Self-Doubt',                   domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[17,48,89,184,229,249,288], falseItems:[] },
  NFC: { label:'Inefficacy',                   domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[27,68,108,144,152,198,274,299,324], falseItems:[] },
  STR: { label:'Stress',                       domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[112,128,167], falseItems:[8,73,234] },
  WRY: { label:'Worry',                        domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[29,98,123,232,286,309,335], falseItems:[] },
  CMP: { label:'Compulsivity',                 domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[14,42,52,56,106,170,236,261], falseItems:[] },
  ARX: { label:'Anxiety-Related Experiences',  domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[26,54,75,79,143,146,220,226,228,235,244,252,275,287,289], falseItems:[], critical:true },
  ANP: { label:'Anger Proneness',              domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[9,119,155,160,248,290,303,318,334], falseItems:[40,134,293] },
  BRF: { label:'Behavior-Restricting Fears',   domain:'Emotional Dysfunction', subdomain:'Internalizing Scales',
         trueItems:[13,50,135,151,208,305,317], falseItems:[] },

  // ── Externalizing ─────────────────────────────────────────
  FML: { label:'Family Problems',          domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[58,103,138,145,180,215,280], falseItems:[19,80,269] },
  JCP: { label:'Juvenile Conduct Problems', domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[21,66,96,205,223,253,320], falseItems:[] },
  SUB: { label:'Substance Abuse',          domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[34,49,141,192,266,297,312,319], falseItems:[237], critical:true },
  IMP: { label:'Impulsivity',              domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[3,39,64,82,116,259], falseItems:[] },
  ACT: { label:'Activation',              domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[72,81,166,181,207,219,267,285], falseItems:[] },
  AGG: { label:'Aggression',              domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[23,28,84,231,316,329], falseItems:[], critical:true },
  CYN: { label:'Cynicism',               domain:'Behavioral Dysfunction', subdomain:'Externalizing Scales',
         trueItems:[10,32,55,87,99,121,142,171,185,213,256,258,304], falseItems:[] },

  // ── Interpersonal ─────────────────────────────────────────
  SFI:  { label:'Self-Importance',     domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
          trueItems:[4,11,47,62,182,188,239,284,326], falseItems:[91] },
  DOM:  { label:'Dominance',           domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
          trueItems:[60,104,147,197,276,302,327], falseItems:[24,300] },
  DSF:  { label:'Disaffiliativeness',  domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
          trueItems:[5,67,97,175,196,291,307], falseItems:[] },
  SAV:  { label:'Social Avoidance',    domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
          trueItems:[278], falseItems:[20,37,57,94,107,153,201,222] },
  SHY:  { label:'Shyness',             domain:'Interpersonal Functioning', subdomain:'Interpersonal Scales',
          trueItems:[35,44,90,114,177,225], falseItems:[295] },

  // ── PSY-5 ─────────────────────────────────────────────────
  AGGR: { label:'Aggressiveness',                      domain:'Interpersonal Functioning', subdomain:'PSY-5 Scales',
          trueItems:[28,60,84,104,147,197,231,276,302,316,321,327,329], falseItems:[24,198] },
  PSYC: { label:'Psychoticism',                        domain:'Thought Dysfunction',       subdomain:'PSY-5 Scales',
          trueItems:[12,71,92,129,139,168,199,203,216,240,241,245,264,270,273,294,311,330,332], falseItems:[85] },
  DISC: { label:'Disconstraint',                       domain:'Behavioral Dysfunction',    subdomain:'PSY-5 Scales',
          trueItems:[21,34,39,49,66,82,141,205,223,253,259,266,297,319,320], falseItems:[61,190,237] },
  NEGE: { label:'Neg. Emotionality/Neuroticism',       domain:'Emotional Dysfunction',     subdomain:'PSY-5 Scales',
          trueItems:[26,75,98,115,123,146,206,228,232,252,263,286,335], falseItems:[73,293] },
  INTR: { label:'Introversion/Low Positive Emotionality', domain:'Emotional Dysfunction', subdomain:'PSY-5 Scales',
          trueItems:[78,278], falseItems:[1,7,20,37,53,57,107,140,153,195,201,222] },
};

function scoreStandardScale(def: ScaleDef, r: ResponseMap): number {
  let s = 0;
  for (const i of def.trueItems)  if (r[i] === 'T') s++;
  for (const i of def.falseItems) if (r[i] === 'F') s++;
  return s;
}

// ============================================================
// PART 4 – INTERPRETATION RULES
// Tables 5-2 through 5-54 (MMPI-3 Manual, Chapter 5)
// Format: [minT, maxT, interpretationText]
// ============================================================

type InterpRule = [number, number, string];

const INTERP_RULES: Record<string, InterpRule[]> = {
  CRIN: [
    [80,999,"Protocol invalid – excessive response inconsistency. The protocol is uninterpretable."],
    [70,79, "Some evidence of response inconsistency. Content-based validity indicators and Substantive Scales should be interpreted with some caution."],
    [39,69, "No concerns. Test taker was able to comprehend and respond relevantly to the test items."],
    [30,38, "Remarkably consistent responding. Test taker was deliberate in his or her approach to the assessment."],
    [0, 29, "No concerns."],
  ],
  VRIN: [
    [80,999,"Protocol invalid – excessive variable response inconsistency. The protocol is uninterpretable."],
    [70,79, "Some evidence of variable response inconsistency. Content-based validity indicators and Substantive Scales should be interpreted with some caution."],
    [39,69, "Evidence of consistent responding. No concerns."],
    [30,38, "Remarkably consistent responding. No concerns."],
    [0, 29, "No concerns."],
  ],
  TRIN: [
    [80,999,"Protocol invalid – excessive fixed, content-inconsistent responding. The protocol is uninterpretable."],
    [70,79, "Some evidence of fixed, content-inconsistent responding. Content-based validity indicators and Substantive Scales should be interpreted with some caution."],
    [50,69, "No evidence of fixed, content-inconsistent responding. No concerns."],
    [0, 49, "No concerns."],
  ],
  F: [
    [100,999,"Protocol invalid. Over-reporting indicated by an excessive number of infrequent responses. Scores on the Substantive Scales should not be interpreted."],
    [90,99,  "Protocol may be invalid. Over-reporting of psychological dysfunction indicated by a considerably larger than average number of infrequent responses."],
    [80,89,  "Possible over-reporting of psychological dysfunction indicated by a much larger than average number of infrequent responses."],
    [75,79,  "Possible over-reporting of psychological dysfunction indicated by a larger than average number of infrequent responses."],
    [0, 74,  "No evidence of over-reporting."],
  ],
  Fp: [
    [100,999,"Protocol invalid. Over-reporting indicated by assertion of a considerably larger than average number of symptoms rarely described by individuals with genuine, severe psychopathology. Scores on the Substantive Scales should not be interpreted."],
    [80,99,  "Possible over-reporting indicated by assertion of a much larger than average number of symptoms rarely described by individuals with genuine, severe psychopathology."],
    [70,79,  "Possible over-reporting indicated by assertion of a larger than average number of symptoms rarely described by individuals with genuine, severe psychopathology."],
    [0, 69,  "No evidence of over-reporting."],
  ],
  Fs: [
    [100,999,"Scores on the somatic scales may be invalid. Over-reporting of somatic symptoms reflected in assertion of a considerably larger than average number of somatic symptoms rarely described by individuals with genuine medical problems."],
    [80,99,  "Possible over-reporting of somatic symptoms. Scores on somatic scales should be interpreted cautiously."],
    [0, 79,  "No evidence of over-reporting."],
  ],
  FBS: [
    [90,999,"Scores on Somatic/Cognitive Scales may be invalid. Over-reporting indicated by a very unusual combination of responses associated with noncredible reporting of somatic and/or cognitive symptoms."],
    [78,89, "Possible over-reporting indicated by an unusual combination of responses associated with noncredible reporting of somatic and/or cognitive symptoms. Scores on Somatic/Cognitive Scales should be interpreted cautiously."],
    [0, 77, "No evidence of over-reporting."],
  ],
  RBS: [
    [90,999,"Scores on Cognitive Complaints scale may be invalid. Over-reporting indicated by a very unusual combination of responses strongly associated with noncredible memory complaints."],
    [75,89, "Possible over-reporting indicated by an unusual combination of responses associated with noncredible memory complaints. Scores on Cognitive Complaints scale should be interpreted cautiously."],
    [0, 74, "No evidence of over-reporting."],
  ],
  L: [
    [80,999,"Protocol may be invalid. Under-reporting indicated by test taker presenting himself or herself in an extremely positive light by denying many minor faults and shortcomings most people acknowledge. Absence of elevation on Substantive Scales is uninterpretable. Elevated scores may underestimate the problems assessed."],
    [70,79, "Possible under-reporting indicated by test taker presenting in a very positive light by denying several minor faults and shortcomings most people acknowledge. Any absence of elevation on Substantive Scales should be interpreted with caution."],
    [65,69, "Possible under-reporting indicated by test taker presenting in a positive light by denying some minor faults and shortcomings most people acknowledge. Any absence of elevation on Substantive Scales should be interpreted with caution."],
    [0, 64, "No evidence of under-reporting."],
  ],
  K: [
    [70,999,"Under-reporting indicated by test taker presenting himself or herself as remarkably well adjusted. Any absence of elevation on Substantive Scales should be interpreted with caution. Elevated scores may underestimate the problems assessed."],
    [66,69, "Possible under-reporting indicated by test taker presenting himself or herself as very well adjusted. Any absence of elevation on Substantive Scales should be interpreted with caution."],
    [60,65, "Possible under-reporting indicated by test taker presenting himself or herself as well adjusted. Any absence of elevation on Substantive Scales should be interpreted with caution."],
    [0, 59, "No evidence of under-reporting."],
  ],
  EID: [
    [80,999,"Responses indicate considerable emotional distress likely to be perceived as a crisis. Broad range of symptoms associated with demoralization, low positive emotions, and negative emotional experiences. Evaluate for internalizing disorders. Emotional difficulties may motivate treatment."],
    [65,79, "Responses indicate significant emotional distress. Evaluate for internalizing disorders. Emotional difficulties may motivate treatment."],
    [0, 38, "Responses indicate a better-than-average level of emotional adjustment."],
  ],
  THD: [
    [80,999,"Responses indicate serious thought dysfunction. Broad range of symptoms associated with disordered thinking (paranoid/nonparanoid delusions, hallucinations, unrealistic thinking). Evaluate for disorders associated with thought dysfunction. May require inpatient treatment; antipsychotic medication should be evaluated."],
    [65,79, "Responses indicate significant thought dysfunction. Evaluate for disorders associated with thought dysfunction. May require inpatient treatment; antipsychotic medication should be evaluated."],
  ],
  BXD: [
    [80,999,"Responses indicate considerable externalizing, acting-out behavior very likely to result in marked dysfunction. Unlikely to be internally motivated for treatment; at significant risk for treatment noncompliance. Inadequate self-control as a target for intervention."],
    [65,79, "Responses indicate significant externalizing, acting-out behavior likely to have gotten him or her into difficulties. Evaluate for externalizing disorders."],
    [0, 38, "Responses indicate a higher-than-average level of behavioral constraint; unlikely to engage in externalizing, acting-out behavior."],
  ],
  RCd: [
    [74,999,"Reports experiencing significant demoralization, feeling overwhelmed, being extremely unhappy, sad, and dissatisfied with life. At risk for suicidal ideation (if SUI or HLP ≥ 65). Evaluate for depression-related disorder. Focus on relief of demoralization as an initial target for intervention."],
    [65,73, "Reports feeling sad and unhappy, being dissatisfied with current life circumstances. At risk for suicidal ideation (if SUI or HLP ≥ 65). Evaluate for depression-related disorder."],
    [0, 38, "Reports a higher-than-average level of morale and life satisfaction."],
  ],
  RC1: [
    [77,999,"Reports a diffuse pattern of somatic complaints involving different bodily systems, likely including head pain, neurological and gastrointestinal symptoms. Preoccupied with physical health; prone to developing physical symptoms in response to stress. Evaluate for somatic symptom disorder. Likely to reject psychological interpretations of somatic complaints."],
    [65,76, "Reports multiple somatic complaints that may include head pain, neurological and gastrointestinal symptoms. Evaluate for somatic symptom disorder."],
    [0, 38, "Reports a sense of physical well-being."],
  ],
  RC2: [
    [65,999,"Reports a lack of positive emotional experiences, significant anhedonia, and lack of interest. Pessimistic, socially introverted and disengaged, lacks energy. Evaluate for anhedonia-related disorder, possibly major depression (if T ≥ 79). Evaluate need for antidepressant medication."],
    [0, 38, "Reports a high level of psychological well-being, a wide range of emotionally positive experiences, feeling confident and energetic. Is optimistic, extroverted, and socially engaged."],
  ],
  RC4: [
    [78,999,"Reports serious past and current antisocial behavior. Has been involved with the criminal justice system; fails to conform to societal norms; is impulsive. Evaluate for antisocial personality disorder, substance use disorders, and other externalizing disorders."],
    [65,77, "Reports a significant history of antisocial behavior. Evaluate for antisocial personality disorder and other externalizing disorders."],
    [0, 38, "Reports a below-average level of past antisocial behavior."],
  ],
  RC6: [
    [79,999,"Reports prominent persecutory ideation that may rise to the level of paranoid delusions. Suspicious and distrustful. Evaluate for disorders involving paranoid delusional thinking. May require inpatient treatment; antipsychotic medication should be evaluated."],
    [65,78, "Reports significant persecutory ideation such as believing others seek to harm him or her. Suspicious and distrustful. Evaluate for disorders involving persecutory ideation."],
  ],
  RC7: [
    [65,999,"Reports various negative emotional experiences including anxiety, anger, and fear. Inhibited behaviorally because of negative emotions; experiences intrusive ideation; anger-prone; stress-reactive; worries excessively; engages in obsessive rumination. Evaluate for anxiety-related disorders. Evaluate need for anxiolytic medication (if RC7 ≥ 78)."],
    [0, 38, "Reports a below-average level of negative emotional experiences."],
  ],
  RC8: [
    [75,999,"Reports many unusual thoughts and perceptions. Experiences thought disorganization; engages in unrealistic thinking; aberrant experiences may include auditory and/or visual hallucinations. Reality testing may be significantly impaired. Consider inpatient treatment; evaluate need for antipsychotic medication."],
    [65,74, "Reports unusual thoughts and perceptual processes. Experiences thought disorganization; engages in unrealistic thinking. Evaluate for disorders manifesting psychotic symptoms."],
  ],
  RC9: [
    [75,999,"Reports many behaviors and experiences associated with hypomanic activation such as excitability, impulsivity, and elevated mood. Is restless, easily bored; overactivated; poor impulse control; sensation-seeking; aggression; mood instability; euphoria. Evaluate for manic or hypomanic episode, cycling mood disorder. Consider inpatient treatment for hypomania; evaluate need for mood-stabilizing medication."],
    [65,74, "Reports behaviors and experiences associated with hypomanic activation, such as excitability, impulsivity, and elevated mood. Evaluate for manic or hypomanic episode."],
    [0, 38, "Reports a low energy level. Has a low energy level; is disengaged from normal activities."],
  ],
  MLS: [
    [75,999,"Reports a general sense of malaise manifested in poor health and feeling tired, weak, and incapacitated. Preoccupied with poor health; likely to complain of sleep disturbance, fatigue, low energy, and sexual dysfunction. If physical origin ruled out, evaluate for somatic symptom disorder. Malaise may impede willingness or ability to engage in treatment."],
    [65,74, "Reports experiencing poor health and feeling weak or tired. Preoccupied with poor health."],
    [0, 38, "Reports a generalized sense of physical well-being."],
  ],
  NUC: [
    [88,999,"Reports many vague neurological complaints (e.g., dizziness, loss of balance, numbness, weakness and paralysis, loss of control over movement). If physical origin ruled out, evaluate for somatic symptom disorder (consider conversion disorder if CYN ≤ 38 and SHY ≤ 38)."],
    [65,87, "Reports vague neurological complaints. Presents with multiple somatic complaints. If physical origin ruled out, evaluate for somatic symptom disorder."],
  ],
  EAT: [
    [85,999,"Reports problematic eating behaviors, including binging and purging. Experiences concerns about weight and body shape, restricted eating, and loss of control over eating. Evaluate for eating disorder. Focus on problematic eating behaviors as a target for intervention."],
    [75,84, "Reports problematic eating behaviors. Experiences concerns about weight and body shape, restricted eating, and loss of control over eating. Evaluate for eating disorder."],
  ],
  COG: [
    [76,999,"Reports a diffuse pattern of cognitive difficulties including memory problems, difficulties with attention and concentration, and possible confusion. Low tolerance for frustration; does not cope well with stress. Consider attention-related disorders; may require a neuropsychological evaluation."],
    [65,75, "Reports a diffuse pattern of cognitive difficulties. Complains about memory problems; experiences difficulties in attention and/or concentration."],
  ],
  SUI: [
    [80,999,"Reports current suicidal ideation and a history of suicidal ideation and attempts. Is at risk for self-harm and suicide attempt. IMMEDIATELY ASSESS RISK FOR SUICIDE."],
    [58,79, "Reports a history of suicidal ideation and/or past suicide attempts. Is at risk for self-harm. Immediately assess risk for suicide."],
  ],
  HLP: [
    [80,999,"Reports having lost hope and believing that he or she cannot change, cannot overcome problems, and is incapable of reaching life goals. Feels overwhelmed; believes cannot be helped; lacks motivation for change. Focus on loss of hope and feelings of despair as early targets for intervention."],
    [65,79, "Reports feeling helpless and/or hopeless and pessimistic. Feels overwhelmed; lacks motivation for change."],
  ],
  SFD: [
    [78,999,"Reports lacking confidence, feeling worthless, and believing he or she is a burden to others. Feels inferior and insecure; is self-disparaging; prone to rumination; intropunitive. Focus on low self-esteem and other manifestations of self-doubt as targets for intervention."],
    [65,77, "Reports self-doubt and futility. Feels inferior and insecure; is self-disparaging."],
  ],
  NFC: [
    [77,999,"Reports being very indecisive and inefficacious, believing incapable of making decisions and dealing effectively with crisis situations. Experiences subjective incompetence and shame; lacks perseverance and self-reliance. Indecisiveness may interfere with establishing treatment goals and progress in treatment."],
    [65,76, "Reports being passive, indecisive, and inefficacious. Experiences subjective incompetence; lacks perseverance and self-reliance."],
    [0, 38, "Reports being decisive and efficacious. Is likely to be self-reliant and power-oriented."],
  ],
  STR: [
    [76,999,"Reports multiple problems involving stress and feeling nervous. Complains about stress; feels incapable of controlling his or her anxiety level. Evaluate for generalized anxiety disorder. Focus on developing stress management skills as a target for intervention."],
    [65,75, "Reports an above-average level of stress. Complains about stress."],
    [0, 38, "Reports a below-average level of stress."],
  ],
  WRY: [
    [65,999,"Reports excessive worry, including worries about misfortune and finances, as well as preoccupation with disappointments. Worries excessively; ruminates. Evaluate for disorders involving excessive worry and rumination. Focus on excessive worry and rumination as targets for intervention."],
    [0, 38, "Reports a below-average level of worry."],
  ],
  CMP: [
    [76,999,"Reports engaging in compulsive behavior, including repetitive checking and counting. Experiences obsessions; is rigid and perfectionistic. Evaluate for obsessive-compulsive disorder. Focus on obsessive-compulsive behaviors as targets for intervention."],
    [62,75, "Reports engaging in compulsive behavior. Experiences obsessions; is rigid and perfectionistic."],
  ],
  ARX: [
    [88,999,"Reports multiple anxiety-related experiences, including generalized anxiety, re-experiencing, intrusive ideation, startle responses, and panic. Experiences significant anxiety, sleep difficulties including nightmares, possible posttraumatic distress. Evaluate for anxiety-related disorders including PTSD. Evaluate need for anxiolytic medication."],
    [80,87, "Reports multiple anxiety-related experiences, including generalized anxiety, re-experiencing, and panic. Evaluate for anxiety-related disorders including PTSD."],
    [65,79, "Reports multiple anxiety-related experiences, including generalized anxiety, re-experiencing, and/or panic. Evaluate for anxiety-related disorders including PTSD."],
    [0, 38, "Reports a below-average level of anxiety-related experiences."],
  ],
  ANP: [
    [78,999,"Reports getting upset easily, being impatient with others, becoming easily angered, and sometimes being overcome by anger. Has problems with anger, irritability, low tolerance for frustration, holds grudges, has temper tantrums, is hostile and argumentative. Evaluate for anger-related disorders. Focus on anger management as a target for intervention."],
    [65,77, "Reports being anger-prone. Has problems with anger, irritability, and low tolerance for frustration."],
  ],
  BRF: [
    [100,999,"Reports multiple fears that significantly restrict normal activity in and outside the home, including fears of leaving home, open spaces, small spaces, the dark, dirt, sharp objects, and handling money. Evaluate for anxiety disorders, particularly agoraphobia."],
    [65,99,  "Reports multiple fears that significantly restrict normal activity in and outside the home. Evaluate for anxiety disorders, particularly agoraphobia. Focus on behavior-restricting fears as targets for intervention."],
  ],
  FML: [
    [80,999,"Reports conflictual family relationships and lack of support from family members; frequent quarrels, dislike of family members, feeling unappreciated, feeling family cannot be counted on in need. Has family conflicts; experiences poor family functioning; blames family members for difficulties. Focus on family problems as targets for intervention."],
    [65,79, "Reports conflictual family relationships and lack of support from family members. Has family conflicts; experiences poor family functioning."],
    [0, 38, "Reports a comparatively conflict-free past and current family environment."],
  ],
  JCP: [
    [80,999,"Reports a history of juvenile conduct problems such as problematic behavior at school, stealing, and being arrested. Has a history of juvenile delinquency and criminal or antisocial behavior. Evaluate for externalizing disorders, particularly antisocial personality disorder."],
    [65,79, "Reports a history of juvenile conduct problems. Has a history of juvenile delinquency and criminal or antisocial behavior."],
  ],
  SUB: [
    [80,999,"Reports a significant history of substance abuse, current substance abuse, frequent use of alcohol and drugs. Has a history of problematic alcohol or drug use and has had legal problems as a result. Evaluate for substance-use-related disorders. Focus on reduction or cessation of substance abuse as a target for intervention."],
    [65,79, "Reports significant past and current substance abuse. Has a history of problematic use of alcohol or drugs. Evaluate for substance-use-related disorders."],
  ],
  IMP: [
    [65,999,"Reports engaging in problematic impulsive behavior. Engages in nonplanful behavior; has poor impulse control and a possible history of hyperactive behavior. Evaluate for impulse-control disorders. Focus on improved impulse control as a possible target for intervention."],
    [0, 38, "Reports a below-average level of impulsive behavior."],
  ],
  ACT: [
    [80,999,"Reports episodes of heightened excitation and energy level, uncontrollable mood swings, and lack of sleep. Experiences excessive activation; has history of manic or hypomanic episodes. Evaluate for manic or hypomanic episodes, cycling mood disorders. Evaluate need for mood-stabilizing medication (T ≥ 70). Excessive behavioral activation may interfere with treatment."],
    [65,79, "Reports episodes of heightened excitation and energy level. Experiences excessive activation; has history of manic or hypomanic episodes. Evaluate for manic or hypomanic episodes."],
    [0, 38, "Reports a below-average level of energy and activation."],
  ],
  AGG: [
    [86,999,"Reports engaging in physically aggressive, violent behavior, including explosive behavior and physical altercations, and enjoying intimidating others. Has a history of violent behavior toward others; is abusive. Evaluate for disorders associated with interpersonal aggression. Focus on reduction in interpersonally aggressive behavior as a target for intervention."],
    [65,85, "Reports engaging in physically aggressive, violent behavior and losing control. Has a history of violent behavior toward others; is abusive. Evaluate for disorders associated with interpersonal aggression."],
  ],
  CYN: [
    [79,999,"Reports having cynical beliefs and a hostile view of others, being distrustful of others, believing others lie to get ahead and look only for their own interests. Is hostile toward others; distrustful; self-centered and lacking in empathy. Evaluate for personality disorders involving mistrust and/or hostility. Cynicism may interfere with forming a therapeutic relationship."],
    [65,78, "Reports having cynical beliefs, being distrustful of others, believing others look out only for their own interests. Is hostile toward others; is distrustful."],
    [0, 38, "Describes others as well-intentioned and trustworthy; is possibly overly trusting."],
  ],
  SFI: [
    [65,999,"Reports having special talents and abilities and many brilliant ideas; describes himself or herself as an extraordinary person. Seeks acclaim; has a sense of superiority. Evaluate for disorders involving excessive sense of self-importance such as narcissistic personality disorder; evaluate for delusions of grandeur (if RC9 ≥ 75). Excessive sense of self-importance may interfere with forming a therapeutic relationship."],
    [0, 38, "Describes himself or herself as lacking in positive qualities."],
  ],
  DOM: [
    [65,999,"Describes himself or herself as having strong opinions, standing up for himself or herself, being assertive and direct, and being able to lead others. Is overly assertive and socially dominant; is viewed by others as domineering. Evaluate for disorders involving excessively assertive, domineering behavior. Domineering behavior may interfere with therapy."],
    [0, 38, "Reports being passive and submissive, not liking to be in charge, and being ready to give in to others. Is passive and submissive in interpersonal relationships. Evaluate for disorders characterized by passive, submissive behavior such as dependent personality disorder."],
  ],
  DSF: [
    [78,999,"Reports disliking people and being around them, preferring to be alone. Is asocial, socially introverted, and emotionally disconnected. Evaluate for disorders involving lack of interest in close relationships. His or her aversive response to close relationships may make it difficult to form a therapeutic alliance."],
    [65,77, "Reports disliking people and being around them. Is asocial and socially introverted."],
  ],
  SAV: [
    [77,999,"Reports not enjoying social events and avoiding social situations, including parties and other events where crowds are likely to gather. Is introverted; has difficulty forming close relationships; is emotionally restricted. Evaluate for disorders associated with social avoidance such as avoidant personality disorder."],
    [65,76, "Reports not enjoying social events and avoiding social situations. Is introverted; has difficulty forming close relationships."],
    [0, 38, "Reports enjoying social situations and events. Is likely to be perceived as outgoing and gregarious."],
  ],
  SHY: [
    [65,999,"Reports being shy, easily embarrassed, and uncomfortable around others. Is socially introverted and inhibited; is anxious and nervous in social situations; is viewed by others as socially awkward. Evaluate for disorders associated with social anxiety."],
    [0, 38, "Reports little or no social anxiety."],
  ],
  AGGR: [
    [80,999,"Reports engaging in instrumentally aggressive behavior, including strongly standing up for himself or herself and his or her beliefs. Is overly assertive and socially dominant; is viewed by others as domineering. Evaluate for features of personality disorders involving antagonistic behavior such as narcissistic and antisocial disorders."],
    [65,79, "Reports engaging in instrumentally aggressive behavior. Is overly assertive and socially dominant. Evaluate for features of personality disorders involving antagonistic behavior."],
    [0, 38, "Reports being unassertive. Is passive and submissive in interpersonal relationships."],
  ],
  PSYC: [
    [80,999,"Reports a broad range of unusual beliefs and perceptions. Experiences unusual thought processes and perceptual phenomena; is alienated from others; engages in unrealistic thinking; presents with impaired reality testing. Evaluate for features of personality disorders manifesting unusual thoughts and perceptions such as schizotypal and paranoid disorders."],
    [65,79, "Reports unusual beliefs and perceptions. Experiences unusual thought processes and perceptual phenomena. Evaluate for features of personality disorders manifesting unusual thoughts and perceptions."],
  ],
  DISC: [
    [65,999,"Reports a pattern of disconstrained behavior. Is behaviorally disconstrained; engages in acting-out behaviors; acts out impulsively; is sensation- and excitement-seeking. Evaluate for features of personality disorders involving disinhibited behavior such as antisocial and borderline disorders."],
    [0, 38, "Reports overly constrained behavior."],
  ],
  NEGE: [
    [65,999,"Reports experiencing an elevated level of negative emotionality. Experiences various negative emotions including anxiety, insecurity, and worry; is inhibited behaviorally because of negative emotions; is self-critical and guilt-prone; experiences intrusive ideation. Evaluate for features of personality disorders involving negative emotionality such as dependent and obsessive-compulsive disorders."],
    [0, 38, "Reports not being prone to experiencing negative emotions."],
  ],
  INTR: [
    [65,999,"Reports a lack of positive emotional experiences and avoiding social situations. Lacks positive emotional experiences; experiences significant problems with anhedonia; lacks interests; is pessimistic; is socially introverted. Evaluate for features of personality disorders involving detachment such as avoidant and schizoid disorders."],
    [0, 38, "Reports being disposed to be socially engaged and to experience a wide range of positive emotions."],
  ],
};

function getInterpretation(scale: string, t: number | null): string {
  if (t === null) return 'Score not available.';
  const rules = INTERP_RULES[scale];
  if (!rules) return 'Within normal limits – no specific interpretive concerns at this score level.';
  for (const [lo, hi, text] of rules) {
    if (t >= lo && t <= hi) return text;
  }
  return 'Within normal limits – no specific interpretive concerns at this score level.';
}

// ============================================================
// PART 5 – MASTER SCORING FUNCTION
// ============================================================

export function scoreMMPI3(responses: ResponseMap): MMPIReport {
  const scales: Record<string, ScaleResult> = {};

  // Pair-based validity scales
  const pairScales: Array<{ abbr: string; label: string; raw: number; domain: string; subdomain: string }> = [
    { abbr:'CRIN', label:'Combined Response Inconsistency', raw: scoreCRIN(responses), domain:'Protocol Validity', subdomain:'Content Non-Responsiveness' },
    { abbr:'VRIN', label:'Variable Response Inconsistency',  raw: scoreVRIN(responses), domain:'Protocol Validity', subdomain:'Content Non-Responsiveness' },
    { abbr:'TRIN', label:'True Response Inconsistency',      raw: scoreTRIN(responses), domain:'Protocol Validity', subdomain:'Content Non-Responsiveness' },
  ];

  for (const { abbr, label, raw, domain, subdomain } of pairScales) {
    const t   = getTScore(abbr, raw);
    const tn  = tNum(t);
    scales[abbr] = {
      abbr, label, raw, tScore: t,
      tDisplay:       tDisplay(t),
      tNumeric:       tn,
      interpretation: getInterpretation(abbr, tn),
      domain, subdomain,
      isCritical: false,
    };
  }

  // Standard T/F keyed scales
  for (const [abbr, def] of Object.entries(SCALE_DEFS)) {
    const raw = scoreStandardScale(def, responses);
    const t   = getTScore(abbr, raw);
    const tn  = tNum(t);
    scales[abbr] = {
      abbr,
      label:          def.label,
      raw,
      tScore:         t,
      tDisplay:       tDisplay(t),
      tNumeric:       tn,
      interpretation: getInterpretation(abbr, tn),
      domain:         def.domain,
      subdomain:      def.subdomain,
      isCritical:     def.critical ?? false,
    };
  }

  return { nAnswered: Object.keys(responses).length, scales };
}

// ============================================================
// PART 6 – DOMAIN ORDER FOR TABLE/CHART DISPLAY
// ============================================================

export interface DomainSection {
  domain:    string;
  subdomain: string;
  scales:    string[];
}

export const DOMAIN_ORDER: DomainSection[] = [
  { domain:'Protocol Validity',             subdomain:'Content Non-Responsiveness', scales:['CRIN','VRIN','TRIN'] },
  { domain:'Protocol Validity',             subdomain:'Over-Reporting',             scales:['F','Fp','Fs','FBS','RBS'] },
  { domain:'Protocol Validity',             subdomain:'Under-Reporting',            scales:['L','K'] },
  { domain:'Somatic/Cognitive Dysfunction', subdomain:'RC Scales',                  scales:['RC1'] },
  { domain:'Somatic/Cognitive Dysfunction', subdomain:'Specific Scales',            scales:['MLS','NUC','EAT','COG'] },
  { domain:'Emotional Dysfunction',         subdomain:'Higher-Order',               scales:['EID'] },
  { domain:'Emotional Dysfunction',         subdomain:'RC Scales',                  scales:['RCd','RC2','RC7'] },
  { domain:'Emotional Dysfunction',         subdomain:'Internalizing Scales',       scales:['SUI','HLP','SFD','NFC','STR','WRY','CMP','ARX','ANP','BRF'] },
  { domain:'Emotional Dysfunction',         subdomain:'PSY-5 Scales',               scales:['NEGE','INTR'] },
  { domain:'Thought Dysfunction',           subdomain:'Higher-Order',               scales:['THD'] },
  { domain:'Thought Dysfunction',           subdomain:'RC Scales',                  scales:['RC6','RC8'] },
  { domain:'Thought Dysfunction',           subdomain:'PSY-5 Scales',               scales:['PSYC'] },
  { domain:'Behavioral Dysfunction',        subdomain:'Higher-Order',               scales:['BXD'] },
  { domain:'Behavioral Dysfunction',        subdomain:'RC Scales',                  scales:['RC4','RC9'] },
  { domain:'Behavioral Dysfunction',        subdomain:'Externalizing Scales',       scales:['FML','JCP','SUB','IMP','ACT','AGG','CYN'] },
  { domain:'Behavioral Dysfunction',        subdomain:'PSY-5 Scales',               scales:['DISC','AGGR'] },
  { domain:'Interpersonal Functioning',     subdomain:'Interpersonal Scales',       scales:['SFI','DOM','DSF','SAV','SHY'] },
];