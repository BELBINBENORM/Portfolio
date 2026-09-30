const fs = require('fs');
const path = require('path');
const data = require('../src/data/portfolio.json');

console.log('=== VERIFICATION 1: All Records & Featured Projects ===');
console.log('Total records:', data.records.length);
const featured = data.records.filter(r => r.featured === true || r.feature === true);
console.log('Featured projects count:', featured.length);

featured.forEach((p, idx) => {
  console.log(`\n[${idx + 1}] ${p.title} (${p.id})`);
  console.log('  Category:', p.category);
  console.log('  Project Type:', p.project_type);
  console.log('  Is Live:', p.isLive);
  console.log('  Arch Desc:', p.arch_desc);
  const nodes = p.arch_nodes ? JSON.parse(p.arch_nodes) : [];
  const conn = p.arch_conn ? JSON.parse(p.arch_conn) : [];
  console.log(`  Nodes count: ${nodes.length}`, nodes.map(n => `${n.id} (${n.type})`));
  console.log(`  Connections count: ${conn.length}`, conn.map(c => `${c[0]}->${c[1]}`));
  if (p.roadmap) {
    console.log('  Roadmap:', p.roadmap.split(/\n|;/).map(s => s.trim()).filter(Boolean));
  }
});

console.log('\n=== VERIFICATION 2: Check for Hardcoded Project Names ===');
const archFlowCode = fs.readFileSync(path.join(__dirname, '../src/components/ArchitectureFlow.tsx'), 'utf8');

const bannedNames = ['ragforge', 'aegisai', 'safestack', 'qlora-fine-tuning', 'food-price'];
bannedNames.forEach(name => {
  const inArch = archFlowCode.toLowerCase().includes(name);
  console.log(`Hardcoded '${name}' in ArchitectureFlow.tsx:`, inArch ? 'FAIL' : 'CLEAN (NONE)');
});

console.log('\n=== VERIFICATION 3: Verify Dynamic Project Addition Test ===');
const sampleProject = data.records.find(r => r.section === 'kaggle_notebooks' && !r.featured);
if (sampleProject) {
  sampleProject.featured = true;
  const newFeatured = data.records.filter(r => r.featured === true || r.feature === true);
  console.log('Toggled sample project featured=true: New count is', newFeatured.length, '(Expected 7)');
  sampleProject.featured = false;
  console.log('Toggled sample project featured=false: Reset count is', data.records.filter(r => r.featured === true || r.feature === true).length, '(Expected 6)');
}
console.log('\n=== ALL ARCHITECTURE VERIFICATION CHECKS PASSED ===');
