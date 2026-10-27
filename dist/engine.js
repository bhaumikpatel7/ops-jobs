/* Local, evidence-led resume tools. No resume content leaves this browser. */

const TERMS = {
  'customer service': ['client service', 'customer support', 'served customers', 'assisted customers', 'helped customers', 'assisted clients', 'supported customers'],
  'client service': ['customer service', 'client support', 'assisted clients'],
  'records management': ['record management', 'records administration', 'record keeping', 'recordkeeping', 'maintained records', 'managed records'],
  'records retention': ['retention schedules', 'record retention'],
  'document management': ['document control', 'managed documents', 'document administration'],
  'document processing': ['processed documents', 'processing documents'],
  'data entry': ['entered data', 'entering data', 'data input'],
  'data accuracy': ['accurate data entry', 'validated data', 'verified data accuracy'],
  'database maintenance': ['maintained databases', 'maintaining databases', 'updated databases'],
  'microsoft word': ['ms word', 'word processing with word'],
  'microsoft excel': ['ms excel', 'excel spreadsheets', 'spreadsheet work in excel'],
  'microsoft office': ['ms office'],
  'word processing': ['typed correspondence', 'word processor', 'word processing software'],
  'administrative support': ['office administration', 'administrative assistance', 'administrative assistant', 'office support'],
  'clerical support': ['clerical work', 'clerical duties', 'clerical assistance'],
  'filing': ['filed documents', 'filed records', 'maintained files'],
  'cash handling': ['handled cash', 'cashier', 'cash transactions'],
  'payment processing': ['processed payments', 'processing payments'],
  'reconciliation': ['reconciled accounts', 'reconciled payments', 'reconciled transactions'],
  'confidentiality': ['confidential information', 'confidential records', 'confidential documents'],
  'privacy': ['privacy protection', 'personal information protection'],
  'attention to detail': ['detail oriented', 'detail-oriented', 'meticulous'],
  'communication': ['communicated', 'communicating', 'communication skills'],
  'written communication': ['written correspondence', 'business writing', 'wrote correspondence'],
  'verbal communication': ['oral communication', 'communicated verbally'],
  'problem solving': ['problem-solving', 'resolved problems', 'solved problems'],
  'conflict resolution': ['resolved conflicts', 'resolved disputes', 'de-escalation'],
  'organization': ['organizational skills', 'organisational skills'],
  'time management': ['managed deadlines', 'prioritized tasks', 'prioritised tasks'],
  'scheduling': ['scheduled appointments', 'appointment booking'],
  'telephone inquiries': ['answered phone inquiries', 'answered telephone enquiries', 'handled telephone inquiries'],
  'public inquiries': ['answered public inquiries', 'responded to public enquiries'],
  'complaint resolution': ['resolved complaints', 'handled complaints'],
  'service delivery': ['delivered services', 'service provision'],
  'legislation': ['legislative requirements'],
  'regulations': ['regulatory requirements'],
  'policies and procedures': ['policies & procedures', 'policies procedures'],
  'accessibility': ['accessible service', 'accessible customer service'],
  'teamwork': ['team collaboration', 'collaborated with colleagues', 'worked collaboratively'],
  'independent work': ['worked independently', 'work independently'],
  'bilingual': ['bilingualism'],
  'french': ['francais', 'français'],
  'english': [],
  'research': ['researched'],
  'reporting': ['prepared reports', 'produced reports'],
  'statistics': ['statistical analysis'],
  'invoicing': ['prepared invoices', 'processed invoices'],
  'bookkeeping': ['book keeping'],
  'licensing': ['licence processing', 'license processing'],
  'registration': ['registrations'],
  'customer relationship management': ['crm'],
  'typing': ['keyboard skills', 'keyboarding'],
  'scanning': ['scanned documents', 'scanned records'],
  'archiving': ['archived records', 'archived documents'],
  'retrieval': ['retrieved records', 'retrieved documents'],
  'excel': [],
  'word': [],
  'outlook': [],
  'sharepoint': [],
  'sap': [],
  'salesforce': [],
  'mfippa': [],
  'fippa': [],
  'aoda': []
};

const INFLECTIONS = {
  records: 'record', documents: 'document', databases: 'database', customers: 'customer', clients: 'client',
  payments: 'payment', accounts: 'account', transactions: 'transaction', inquiries: 'inquiry', enquiries: 'inquiry',
  enquiry: 'inquiry', files: 'file', reports: 'report', policies: 'policy', procedures: 'procedure',
  regulations: 'regulation', registrations: 'registration', skills: 'skill', complaints: 'complaint',
  invoices: 'invoice', applications: 'application', schedules: 'schedule', requirements: 'requirement',
  licences: 'licence', licenses: 'licence', license: 'licence'
};

function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
    .map(word => INFLECTIONS[word] || word).join(' ');
}

function contains(text, phrase) {
  const key = normalize(phrase);
  return Boolean(key) && ` ${normalize(text)} `.includes(` ${key} `);
}

function cleanKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  const seen = new Set();
  return keywords.map(v => String(v ?? '').trim().slice(0, 100)).filter(v => {
    const key = normalize(v);
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 60);
}

function evidenceLines(resume) {
  return String(resume ?? '').split(/\r?\n/).map(v => v.trim()).filter(Boolean)
    .filter(v => !/^(?:seeking|looking for|objective\b|desired\b|target role\b|tailored application\b)/i.test(v));
}

function isEvidence(line, phrase) {
  if (!contains(line, phrase)) return false;
  const n = normalize(line);
  // Never promote explicit absence or an intention to learn into a qualification.
  if (/\b(?:no experience|not experienced|not proficient|not familiar|lack of|lacked experience|lacking experience|willing to|want to learn|would like to|plan to learn|hope to learn|seeking to learn|aspire to|interested in)\b/.test(n)) return false;
  return true;
}

/** Suggest a short, editable list from the actual job description. */
export function extractKeywords(description) {
  const text = String(description ?? '');
  if (!text.trim()) return [];
  const matched = Object.keys(TERMS).filter(term => contains(text, term));
  // Avoid scoring both a named product and its short label independently.
  const filtered = matched.filter(term => !((term === 'word' && matched.includes('microsoft word')) || (term === 'excel' && matched.includes('microsoft excel'))));
  const result = filtered.slice(0, 24);
  if (result.length >= 6) return result;
  const stop = new Set('about above across after again against also among and any applicant applicants application apply appropriate are area areas available based being below both but can candidate candidates career careers city closing competition contact could date day days department description do each employment ensure experience for from full further general government has have high highly how hours including information into job jobs knowledge may more must need needs new not number offer office one only opportunity other our part per person please position positions posting preferred provide provided provides qualified qualifications related required requirement requirements responsibilities role salary seeking service should skill skills some such support team than that the their them there these they this those through time title under understand use used using various was well were what when where which who will with within work working would year years you your'.split(' '));
  const counts = new Map();
  for (const word of normalize(text).split(' ')) {
    if (word.length < 5 || stop.has(word) || /^\d/.test(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const extras = [...counts].sort((a, b) => b[1] - a[1]).map(([word]) => word);
  for (const word of extras) {
    if (!result.some(term => contains(term, word))) result.push(word);
    if (result.length >= 12) break;
  }
  return cleanKeywords(result).slice(0, 24);
}

/** Literal keyword coverage, plus separately identified equivalent experience. */
export function analyze(resume, keywords) {
  const terms = cleanKeywords(keywords);
  const lines = evidenceLines(resume);
  const matched = [], missing = [], supported = [], evidence = {};
  for (const term of terms) {
    const literal = lines.find(line => isEvidence(line, term));
    if (literal) {
      matched.push(term); supported.push(term); evidence[term] = literal; continue;
    }
    missing.push(term);
    const dictionaryKey = Object.keys(TERMS).find(key => normalize(key) === normalize(term));
    const aliases = dictionaryKey ? TERMS[dictionaryKey] : [];
    const equivalent = lines.find(line => aliases.some(alias => isEvidence(line, alias)));
    if (equivalent) { supported.push(term); evidence[term] = equivalent; }
  }
  return {score: terms.length ? Math.round(matched.length / terms.length * 100) : 0, total: terms.length, matched, missing, evidence, supported};
}

/** Reframe verified evidence while retaining all source employment facts. */
export function createDraft(resume, job = {}, keywords = [], profile = {}) {
  const source = String(resume ?? '').trim();
  const original = analyze(source, keywords);
  if (!source) return {text: '', analysis: original, changes: []};
  const highlights = original.supported.map(term => `${term.charAt(0).toUpperCase() + term.slice(1)} — ${original.evidence[term].replace(/^[•*\-]\s*/, '')}`);
  const qualifications = highlights.length ? `RELEVANT QUALIFICATIONS\n${highlights.map(v => `• ${v}`).join('\n')}\n\n` : '';
  const substantive = `${qualifications}ORIGINAL EXPERIENCE & EDUCATION\n${source}`;
  const header = [profile.name?.trim(), job.title ? `Tailored application: ${job.title}` : '', job.employer || job.organization || ''].filter(Boolean).join('\n');
  const text = [header, substantive].filter(Boolean).join('\n\n');
  const changes = ['Preserved the complete original resume, including employment dates, titles and education.'];
  if (highlights.length) changes.unshift(`Added ${highlights.length} job-relevant qualifications, each backed by wording in the original resume.`);
  const reframed = original.supported.filter(term => !original.matched.includes(term));
  if (reframed.length) changes.push(`Used the posting's terminology for equivalent experience: ${reframed.join(', ')}.`);
  if (original.missing.some(term => !original.supported.includes(term))) changes.push('Left unsupported requirements as gaps; no qualifications were invented.');
  return {text, analysis: analyze(substantive, keywords), changes};
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const encoder = new TextEncoder();
let crcTable;
function crc32(bytes) {
  if (!crcTable) crcTable = Uint32Array.from({length:256}, (_, n) => {
    let c = n; for (let k=0; k<8; k++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1; return c >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
}
function joinBytes(parts) {
  const out = new Uint8Array(parts.reduce((n,p) => n+p.length,0));
  let at=0; for (const part of parts) {out.set(part,at); at+=part.length;} return out;
}
function header(size) { const bytes=new Uint8Array(size); return [bytes,new DataView(bytes.buffer)]; }

/** Standards-compliant UTF-8 ZIP, stored entries, suitable for DOCX and batch packages. */
export function createZip(files) {
  const local=[], central=[]; let offset=0;
  if (!Array.isArray(files) || files.length > 65535) throw new Error('Invalid ZIP file list.');
  const names = new Set();
  for (const file of files) {
    const name=String(file.name ?? '').replace(/\\/g,'/');
    if (!name || name.startsWith('/') || name.split('/').some(v => v==='..') || names.has(name)) throw new Error('Invalid or duplicate ZIP path.');
    names.add(name);
    const nameBytes=encoder.encode(name), data=typeof file.data==='string'?encoder.encode(file.data):new Uint8Array(file.data);
    if (nameBytes.length > 65535) throw new Error('ZIP path is too long.');
    const crc=crc32(data); const [lh,lv]=header(30);
    lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true); lv.setUint16(6,0x800,true);
    lv.setUint16(12,0x21,true); lv.setUint32(14,crc,true); lv.setUint32(18,data.length,true); lv.setUint32(22,data.length,true); lv.setUint16(26,nameBytes.length,true);
    local.push(lh,nameBytes,data);
    const [ch,cv]=header(46); cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true); cv.setUint16(8,0x800,true);
    cv.setUint16(14,0x21,true); cv.setUint32(16,crc,true); cv.setUint32(20,data.length,true); cv.setUint32(24,data.length,true); cv.setUint16(28,nameBytes.length,true); cv.setUint32(42,offset,true);
    central.push(ch,nameBytes); offset+=lh.length+nameBytes.length+data.length;
  }
  const directory=joinBytes(central), [end,ev]=header(22);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(8,files.length,true); ev.setUint16(10,files.length,true); ev.setUint32(12,directory.length,true); ev.setUint32(16,offset,true);
  return joinBytes([...local,directory,end]);
}

export function createDocx(text) {
  const xmlEscape = value => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const paragraphs=String(text ?? '').split(/\r?\n/).map((line, i) => {
    if (line.trim() === '--- PAGE BREAK ---') return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    const heading=!!line.trim() && line.length<90 && (line===line.toUpperCase() || i===0);
    return `<w:p><w:pPr><w:spacing w:after="${line.trim()?'100':'40'}"/>${heading?'<w:keepNext/>':''}</w:pPr><w:r><w:rPr>${heading?'<w:b/>':''}<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="${heading?'24':'22'}"/></w:rPr><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
  }).join('');
  return createZip([
    {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'},
    {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},
    {name:'word/document.xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`}
  ]);
}
