import fs from 'fs';
import path from 'path';

const root = process.cwd();
const csvPath = path.join(root, 'data.csv');
const outputDir = path.join(root, 'src', 'data');
const outputPath = path.join(outputDir, 'portfolio.json');

const parseCsv = (text) => {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows.filter((r) => r.length > 0);
};

const csv = fs.readFileSync(csvPath, 'utf8');
const rows = parseCsv(csv);
const header = rows[0].map((item) => item.trim());
const records = rows.slice(1).map((row) => {
  const obj = {};
  header.forEach((key, index) => {
    obj[key] = row[index] ?? '';
  });
  return obj;
});

const inferProjectType = (row) => {
  const title = (row.title || '').toLowerCase();
  const desc = (row.description || '').toLowerCase();
  const sec = (row.section || '').toLowerCase();
  const tech = (row.technology || '').toLowerCase();
  const cat = (row.category || '').toLowerCase();

  if (row.project_type && row.project_type.trim()) {
    return row.project_type.trim();
  }

  if (
    title.includes('customer support') ||
    title.includes('document intelligence') ||
    title.includes('knowledge platform')
  ) {
    return 'END-TO-END AI SYSTEM';
  }

  if (title.includes('qlora') || title.includes('fine-tuning') || cat.includes('fine-tuning')) {
    return 'LLM EXPERIMENT';
  }

  if (title.includes('optuna') || title.includes('quad-tune') || cat.includes('optimization')) {
    return 'ML OPTIMIZATION';
  }

  if (sec === 'projects') {
    return 'ACADEMIC RESEARCH';
  }

  if (sec === 'github_projects') {
    if (title.includes('scraper')) return 'AUTOMATED DATA PIPELINE';
    if (title.includes('vortex') || title.includes('safe stack') || title.includes('evaluate')) return 'ML ARCHITECTURE';
    return 'SOFTWARE PROJECT';
  }

  if (sec === 'kaggle_notebooks') {
    if (title.includes('scraper')) return 'AUTOMATED DATA PIPELINE';
    if (title.includes('rag') || title.includes('chatbot')) return 'RAG PROTOTYPE';
    if (title.includes('stack') || title.includes('lgbm') || title.includes('xgb') || title.includes('pipeline') || tech.includes('gradient boosting')) {
      return 'ML EXPERIMENT';
    }
    if (title.includes('eda') || title.includes('analysis') || title.includes('deep dive') || cat.includes('eda') || cat.includes('analysis')) {
      return 'RESEARCH & ANALYSIS';
    }
    return 'NOTEBOOK';
  }

  if (sec === 'kaggle_datasets') {
    return 'DATASET & CURATION';
  }

  if (sec === 'kaggle_models') {
    return 'TRAINED MODEL';
  }

  return 'TECHNICAL WORK';
};

const splitCategories = (rawCategory) => {
  if (!rawCategory) return [];
  return rawCategory
    .split(/[/,+]/)
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c) => !c.toLowerCase().includes('not specified'));
};

const splitTech = (rawTech) => {
  if (!rawTech) return [];
  return rawTech
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !t.toLowerCase().includes('not specified'));
};

const normalized = {
  sourceFile: 'data.csv',
  totalRows: records.length,
  sections: Array.from(new Set(records.map((row) => row.section).filter(Boolean))),
  records: records.map((row) => {
    const title = row.title?.trim() || '';
    const category = row.category?.trim() || '';
    const description = row.description?.trim() || '';
    const technology = row.technology?.trim() || '';
    const platform = row.platform?.trim() || '';
    const url = row.url?.trim() || '';
    const year = row.year?.trim() || '';
    const importance = row.importance?.trim() || '';
    const portfolio_priority = row.portfolio_priority?.trim() || '';
    const animation_scene = row.animation_scene?.trim() || '';
    const display_on_homepage = row.display_on_homepage?.trim().toUpperCase() === 'TRUE';
    const project_type = inferProjectType(row);
    const categories = splitCategories(category);
    const technologies = splitTech(technology);

    return {
      ...row,
      title,
      category,
      categories,
      description,
      technology,
      technologies,
      platform,
      url,
      year,
      importance,
      portfolio_priority,
      animation_scene,
      display_on_homepage,
      project_type,
    };
  })
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));
console.log(`Normalized ${records.length} rows from ${csvPath} → ${outputPath}`);
