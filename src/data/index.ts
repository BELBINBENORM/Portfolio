import portfolio from './portfolio.json';

export type PortfolioRow = {
  section: string;
  title: string;
  category: string;
  categories?: string[];
  description: string;
  technology: string;
  technologies?: string[];
  platform: string;
  url: string;
  year: string;
  importance: string;
  portfolio_priority: string;
  animation_scene: string;
  display_on_homepage: boolean;
  project_type?: string;
  id?: string;
  number?: number | string;
  tagline?: string;
  type?: string;
  url_type?: string;
  slug?: string;
  active?: boolean;
  featured?: boolean;
  feature?: boolean;
  isLive?: boolean;
  statusNote?: string;
  display_in?: string[];
  problem?: string;
  solution?: string;
  features?: string;
  roadmap?: string;
  result_impact?: string;
  arch_desc?: string;
  arch_nodes?: string;
  arch_conn?: string;
  github_url?: string;
  live_url?: string;
  docs_url?: string;
  kaggle_url?: string;
  skillLync_url?: string;
  icon_dark?: string;
  icon_light?: string;
};

export type HeroPersona = {
  id?: number | string;
  role: string;
  slug: string;
  meta_tittle: string;
  meta_description: string;
  kicker: string;
  headline: string;
  subheadline: string;
  description: string;
  skills: string;
};

export type SkillRecord = {
  id?: number | string;
  name: string;
  category: string;
  icon_dark?: string;
  icon_light?: string;
  show?: boolean;
};

export type PortfolioData = {
  sourceFile: string;
  totalRows: number;
  sections: string[];
  records: PortfolioRow[];
  contact_description?: string;
  heroes?: HeroPersona[];
  skills?: SkillRecord[];
};

export const portfolioData = portfolio as PortfolioData;

export const heroes: HeroPersona[] = portfolioData.heroes ?? [];
export const skills: SkillRecord[] = portfolioData.skills ?? [];
export const contactDescription = portfolioData.contact_description?.trim() ?? '';

const contactProfileRoles = ['Data Scientist', 'AI/ML Engineer', 'AI Engineer', 'Python Developer'];
export const contactSkills = contactProfileRoles
  .flatMap((role) => heroes.find((hero) => hero.role.toLowerCase() === role.toLowerCase())?.skills.split('|') ?? [])
  .reduce<string[]>((uniqueSkills, skill) => {
    const normalizedSkill = skill.trim();
    if (normalizedSkill && !uniqueSkills.some((existing) => existing.toLowerCase() === normalizedSkill.toLowerCase())) {
      uniqueSkills.push(normalizedSkill);
    }
    return uniqueSkills;
  }, []);

export const profileLinks = portfolioData.records.filter((row) => row.section === 'profile' && row.display_on_homepage);
export const experienceRows = portfolioData.records.filter((row) => row.section === 'experience');
export const educationRows = portfolioData.records.filter((row) => row.section === 'education');
export const skillRows = skills.map((skill) => ({
  section: 'skills',
  title: skill.name,
  category: skill.category,
  description: skill.category,
  technology: skill.name,
  platform: 'Skills',
  url: '',
  year: '',
  importance: '',
  portfolio_priority: '',
  animation_scene: 'skills_network',
  display_on_homepage: true,
  icon_dark: skill.icon_dark,
  icon_light: skill.icon_light,
})) as PortfolioRow[];
export const projectRows = portfolioData.records.filter((row) => row.section === 'projects');
export const githubProjects = projectRows.filter((row) => row.url_type === 'git' || row.url_type === 'github' || Boolean(row.github_url));
export const kaggleDatasets = projectRows.filter((row) => row.category === 'PUBLISHED DATASETS');
export const kaggleNotebooks = projectRows.filter(
  (row) =>
    row.url_type === 'kaggle' &&
    row.category !== 'PUBLISHED DATASETS' &&
    !String(row.url || row.kaggle_url || '').includes('/models/'),
);
export const kaggleModels = projectRows.filter((row) => String(row.url || row.kaggle_url || '').includes('/models/'));
export const certificationRows = portfolioData.records.filter((row) => row.section === 'certifications');
export const externalLinks = portfolioData.records.filter((row) => row.section === 'external_links');

export const DEFAULT_PERSONA_SLUG = '/';

export const getHeroBySlug = (pathname: string): HeroPersona => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return (
    heroes.find((hero) => (hero.slug.replace(/\/+$/, '') || '/') === normalized) ||
    heroes.find((hero) => hero.slug === '/') ||
    heroes[0] || {
      role: 'Software Engineer',
      slug: '/',
      meta_tittle: 'BELBIN BENO RM | Portfolio - Software Engineer',
      meta_description:
        'Architecting end-to-end Generative AI systems, high-performance machine learning optimization pipelines, autonomous agent workflows, and production-grade software.',
      kicker: 'AI • DATA • SOFTWARE ENGINEERING',
      headline: 'BUILDING INTELLIGENT SYSTEMS',
      subheadline: 'Production AI, Machine Learning & Scalable Data Architecture',
      description:
        'Architecting end-to-end Generative AI systems, high-performance machine learning optimization pipelines, autonomous agent workflows, and production-grade software.',
      skills: 'Generative AI | Machine Learning | Data Engineering | Backend Engineering',
    }
  );
};

export const matchesPersona = (project: PortfolioRow, role: string): boolean =>
  (project.display_in || []).some((item) => item.toLowerCase() === role.toLowerCase());

export const sortByPriority = (a: PortfolioRow, b: PortfolioRow): number => {
  const aVal = a.portfolio_priority === '' || a.portfolio_priority == null ? Number.POSITIVE_INFINITY : Number(a.portfolio_priority);
  const bVal = b.portfolio_priority === '' || b.portfolio_priority == null ? Number.POSITIVE_INFINITY : Number(b.portfolio_priority);
  return aVal - bVal;
};

export const personaProjects = (role: string): PortfolioRow[] =>
  projectRows.filter((project) => matchesPersona(project, role)).sort(sortByPriority);

export const featuredSystemsForPersona = (role: string): PortfolioRow[] =>
  personaProjects(role)
    .filter((project) => project.featured === true || (project.portfolio_priority !== '' && project.portfolio_priority != null))
    .sort(sortByPriority);

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const skillGroups: SkillGroup[] = Object.values(
  skills.reduce<Record<string, SkillGroup>>((groups, skill) => {
    const id = slugify(skill.category) || 'other';
    if (!groups[id]) {
      groups[id] = { id, name: skill.category, skills: [] };
    }
    groups[id].skills.push(skill.name);
    return groups;
  }, {}),
);

export const skillIcons: Record<string, string> = Object.fromEntries(
  skills.filter((skill) => skill.icon_dark).map((skill) => [skill.name, skill.icon_dark as string]),
);

const skillSynonyms: Record<string, string[]> = {
  'generative ai': ['generative ai', 'genai', 'gen ai', 'llm', 'rag', 'ai agent', 'qlora', 'prompt engineering', 'document intelligence', 'transformers'],
  'llm': ['llm', 'large language model', 'llama', 'transformers', 'hugging face', 'qlora', 'lora', 'langchain', 'prompt', 'ollama', 'gemini', 'openai'],
  'ai agents': ['ai agent', 'ai agents', 'agents', 'agent', 'tool calling', 'tools', 'langchain', 'agent workflows'],
  'rag': ['rag', 'retrieval-augmented', 'retrieval', 'pgvector', 'vector search', 'vector database', 'embeddings', 'document intelligence', 'chunking', 'semantic search'],
  'prompt engineering': ['prompt engineering', 'prompt', 'prompts', 'grounded answer', 'grounded responses'],
  'llm fine-tuning': ['fine-tuning', 'fine tuning', 'qlora', 'lora', 'transformers', 'hugging face', 'adaptation'],
  'qlora': ['qlora', 'lora', 'fine-tuning', 'peft'],
  'lora': ['lora', 'qlora', 'fine-tuning', 'peft'],
  'embeddings': ['embeddings', 'embedding', 'vector', 'pgvector', 'semantic search', 'vector search'],
  'vector databases': ['vector database', 'vector search', 'pgvector', 'vector', 'embeddings', 'semantic indexing'],
  'langchain': ['langchain', 'agents', 'rag', 'llm'],
  'nlp': ['nlp', 'natural language', 'transformers', 'text', 'sentiment', 'language model'],
  'document ai': ['document ai', 'document intelligence', 'document processing', 'pdf', 'chunking', 'rag'],

  'machine learning': ['machine learning', 'ml', 'scikit-learn', 'xgboost', 'lightgbm', 'catboost', 'optuna', 'stacking', 'ensemble', 'regression', 'classification'],
  'deep learning': ['deep learning', 'cnn', 'transformers', 'neural network', 'qlora', 'fine-tuning'],
  'model training': ['model training', 'training', 'stacking', 'xgboost', 'lightgbm', 'catboost', 'qlora', 'optuna', 'ensemble'],
  'model evaluation': ['model evaluation', 'evaluate', 'evaluation', 'cross-validation', 'oof', 'logloss', 'shap', 'lime', 'validation'],
  'feature engineering': ['feature engineering', 'features', 'feature selection', 'transformations', 'outlier', 'kurtosis', 'interaction terms'],
  'hyperparameter optimization': ['hyperparameter optimization', 'hyperparameter tuning', 'optuna', 'tuning', 'quad-tune', 'parallel optuna'],
  'optuna': ['optuna', 'hyperparameter optimization', 'hyperparameter tuning', 'quad-tune'],
  'parallel computing': ['parallel computing', 'parallel', 'parallelized', 'quad-tune', 'multiprocessing'],

  'python': ['python', 'oop', 'pandas', 'scikit-learn', 'fastapi'],
  'fastapi': ['fastapi', 'rest api', 'pydantic', 'uvicorn', 'api endpoints'],
  'rest apis': ['rest api', 'rest apis', 'rest', 'api', 'fastapi', 'http', 'endpoints'],
  'api integration': ['api integration', 'apis', 'api', 'fastapi', 'llm api', 'rest'],
  'postgresql': ['postgresql', 'postgres', 'pgvector', 'sqlalchemy', 'relational database'],
  'vector search': ['vector search', 'vector similarity', 'pgvector', 'embeddings', 'semantic search'],
  'database design': ['database design', 'database', 'postgresql', 'sqlalchemy', 'sql', 'persistence'],
  'backend development': ['backend', 'fastapi', 'api', 'database', 'sqlalchemy', 'services', 'architecture'],

  'docker': ['docker', 'dockerfile', 'container', 'containerization'],
  'git': ['git', 'version control', 'github'],
  'github': ['github', 'git', 'repo', 'repository'],
  'deployment': ['deployment', 'deploy', 'docker', 'backend', 'api', 'real time'],
  'experiment tracking': ['experiment tracking', 'cross-validation', 'optuna', 'oof', 'stratified k-fold', 'evaluation'],
  'model optimization': ['model optimization', 'optuna', 'hyperparameter', 'qlora', 'parallel', 'stacking', 'pruning'],
  'performance optimization': ['performance optimization', '4x speed', 'parallel computing', 'optuna', 'parallelized', 'stacking', 'reducing manual processing'],

  'pandas': ['pandas', 'data analysis', 'dataframe', 'data manipulation'],
  'numpy': ['numpy', 'numerical', 'array'],
  'scikit-learn': ['scikit-learn', 'sklearn', 'machine learning', 'stacking', 'cross-validation', 'ridgecv'],
  'data analysis': ['data analysis', 'eda', 'analysis', 'pandas', 'visualization', 'exploratory'],
  'data visualization': ['data visualization', 'visualization', 'matplotlib', 'tableau', 'power bi', 'eda', 'charts'],
  'statistical analysis': ['statistical analysis', 'statistics', 'probability', 'distribution', 'correlation', 'forecasting'],
};

const skillDedicatedKeywords: Record<string, string[]> = {
  'generative ai': ['ai knowledge platform', 'knowledge platform', 'generative ai', 'ragforge', 'aegisai'],
  'llm': ['qlora fine-tuning', 'qlora', 'llama', 'transformers', 'gemini'],
  'ai agents': ['ai customer support', 'customer support', 'agent', 'aegisai', 'ragforge'],
  'rag': ['ragforge', 'document intelligence', 'retrieval-augmented', 'pdf chatbot'],
  'prompt engineering': ['ai customer support', 'customer support', 'prompt'],
  'llm fine-tuning': ['qlora heart disease', 'qlora fine-tuning', 'fine-tuning'],
  'qlora': ['qlora heart disease', 'qlora', 'peft'],
  'lora': ['qlora heart disease', 'lora', 'adapters'],
  'embeddings': ['ragforge', 'document intelligence', 'embeddings'],
  'vector databases': ['ragforge', 'pgvector', 'vector'],
  'langchain': ['ai customer support', 'customer support', 'langchain'],
  'nlp': ['nlp', 'transformers', 'natural language', 'classification'],
  'document ai': ['ragforge', 'document intelligence', 'document processing'],

  'machine learning': ['vortex', 'safe stack', 'machine learning'],
  'deep learning': ['qlora', 'deep learning'],
  'model training': ['vortex', 'safestack', 'ensemble'],
  'model evaluation': ['vortex', 'evaluation', 'cross-validation', 'shap'],
  'feature engineering': ['vortex feature', 'feature engineering', 'feature selection'],
  'hyperparameter optimization': ['quad-tune', 'parallel optuna'],
  'optuna': ['quad-tune', 'optuna'],
  'parallel computing': ['quad-tune', 'parallel computing'],

  'python': ['ragforge', 'fastapi', 'python'],
  'fastapi': ['ragforge', 'aegisai', 'fastapi'],
  'rest apis': ['ragforge', 'customer support', 'rest api'],
  'api integration': ['ai customer support', 'customer support', 'api integration'],
  'postgresql': ['ragforge', 'postgresql', 'pgvector'],
  'vector search': ['ragforge', 'vector search', 'pgvector'],
  'database design': ['ragforge', 'postgresql', 'database design'],
  'backend development': ['ragforge', 'fastapi', 'backend'],

  'docker': ['ragforge', 'docker'],
  'git': ['github', 'git', 'version control'],
  'github': ['github', 'git'],
  'deployment': ['ragforge', 'docker', 'render'],
  'experiment tracking': ['vortex', 'stratified k-fold', 'oof'],
  'model optimization': ['quad-tune', 'optuna', 'model optimization'],
  'performance optimization': ['quad-tune', '4x speed'],

  'pandas': ['data analysis', 'pandas', 'data manipulation'],
  'numpy': ['numpy', 'numerical', 'array'],
  'scikit-learn': ['vortex', 'scikit-learn', 'ridgecv'],
  'data analysis': ['tableau', 'data analytics', 'data analysis'],
  'data visualization': ['power bi', 'visualization', 'matplotlib'],
  'statistical analysis': ['statistics', 'probability', 'forecasting'],
};

export const parseTechnologyList = (value: string): string[] =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.toLowerCase().includes('not specified'));

export interface EvidenceResult {
  records: PortfolioRow[];
  technologies: string[];
}

export const getSkillEvidence = (skillName: string): EvidenceResult => {
  const lowerName = skillName.trim().toLowerCase();
  const searchTerms = skillSynonyms[lowerName] || [lowerName];
  const preferredTerms = skillDedicatedKeywords[lowerName] || [];

  const matchedRecords = portfolioData.records.filter((row) => {
    if (row.section === 'skills' || row.section === 'linkedin_posts' || row.section === 'profile' || row.section === 'external_links') {
      return false;
    }

    const haystack = [
      row.title,
      row.description,
      row.technology,
      row.platform,
      row.category,
      row.project_type || '',
      row.tagline || '',
      row.problem || '',
      row.solution || '',
      ...(row.categories || []),
      ...(row.technologies || []),
      ...(row.display_in || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.some((term) => haystack.includes(term));
  });

  const scoreRecord = (row: PortfolioRow) => {
    const title = row.title.toLowerCase();
    const desc = row.description.toLowerCase();
    const tech = row.technology.toLowerCase();
    let score = 0;

    preferredTerms.forEach((term, idx) => {
      if (title.includes(term)) score += 300 - idx * 20;
      else if (desc.includes(term)) score += 120 - idx * 10;
      else if (tech.includes(term)) score += 80 - idx * 10;
    });

    if (title.includes(lowerName)) score += 200;
    if (tech.includes(lowerName)) score += 100;
    if (desc.includes(lowerName)) score += 50;

    if (row.project_type === 'END-TO-END AI SYSTEM') score += 30;
    if (row.url_type === 'git' || row.github_url) score += 25;
    if (row.url_type === 'kaggle') score += 15;
    if (row.section === 'experience') score += 15;
    if (row.section === 'certifications') score += 10;
    if (row.featured) score += 20;

    return score;
  };

  const sortedRecords = [...matchedRecords].sort((a, b) => scoreRecord(b) - scoreRecord(a));

  const techSet = new Set<string>();
  sortedRecords.forEach((row) => {
    if (row.technology) {
      parseTechnologyList(row.technology).forEach((t) => techSet.add(t));
    }
  });

  return {
    records: sortedRecords,
    technologies: Array.from(techSet),
  };
};

export const allConstellationProjects = projectRows;

export const matchesProjectCategory = (item: PortfolioRow, selectedCategoryId: string): boolean => {
  if (!selectedCategoryId || selectedCategoryId === 'ALL') return true;
  const cat = (item.category || '').trim();
  return cat.toLowerCase() === selectedCategoryId.trim().toLowerCase();
};

export const matchesConstellationFilter = matchesProjectCategory;
