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
};

export type PortfolioData = {
  sourceFile: string;
  totalRows: number;
  sections: string[];
  records: PortfolioRow[];
};

export const portfolioData = portfolio as PortfolioData;

export const profileLinks = portfolioData.records.filter((row) => row.section === 'profile' && row.display_on_homepage);
export const experienceRows = portfolioData.records.filter((row) => row.section === 'experience');
export const educationRows = portfolioData.records.filter((row) => row.section === 'education');
export const skillRows = portfolioData.records.filter((row) => row.section === 'skills');
export const projectRows = portfolioData.records.filter((row) => row.section === 'projects');
export const githubProjects = portfolioData.records.filter((row) => row.section === 'github_projects');
export const kaggleDatasets = portfolioData.records.filter((row) => row.section === 'kaggle_datasets');
export const kaggleNotebooks = portfolioData.records.filter((row) => row.section === 'kaggle_notebooks');
export const kaggleModels = portfolioData.records.filter((row) => row.section === 'kaggle_models');
export const certificationRows = portfolioData.records.filter((row) => row.section === 'certifications');
export const externalLinks = portfolioData.records.filter((row) => row.section === 'external_links');

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'genai',
    name: 'AI / Generative AI',
    skills: [
      'Generative AI',
      'LLM',
      'AI Agents',
      'RAG',
      'Prompt Engineering',
      'LLM Fine-Tuning',
      'QLoRA',
      'LoRA',
      'Embeddings',
      'Vector Databases',
      'LangChain',
      'NLP',
      'Document AI',
    ],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Model Training',
      'Model Evaluation',
      'Feature Engineering',
      'Hyperparameter Optimization',
      'Optuna',
      'Parallel Computing',
    ],
  },
  {
    id: 'backend',
    name: 'Backend / AI Engineering',
    skills: [
      'Python',
      'FastAPI',
      'REST APIs',
      'API Integration',
      'PostgreSQL',
      'Vector Search',
      'Database Design',
      'Backend Development',
    ],
  },
  {
    id: 'mlops',
    name: 'MLOps / Engineering',
    skills: [
      'Docker',
      'Git',
      'GitHub',
      'Deployment',
      'Experiment Tracking',
      'Model Optimization',
      'Performance Optimization',
    ],
  },
  {
    id: 'data',
    name: 'Data / Analytics',
    skills: [
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'Data Analysis',
      'Data Visualization',
      'Statistical Analysis',
    ],
  },
];

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
  'generative ai': ['ai knowledge platform', 'knowledge platform', 'generative ai'],
  'llm': ['qlora fine-tuning: predicting heart disease', 'qlora fine-tuning', 'llama', 'transformers'],
  'ai agents': ['ai customer support platform', 'customer support platform', 'agent'],
  'rag': ['ai document intelligence', 'document intelligence', 'retrieval-augmented'],
  'prompt engineering': ['ai customer support platform', 'customer support', 'prompt'],
  'llm fine-tuning': ['qlora fine-tuning: predicting heart disease', 'qlora fine-tuning', 'fine-tuning'],
  'qlora': ['qlora fine-tuning: predicting heart disease', 'qlora', 'peft'],
  'lora': ['qlora fine-tuning: predicting heart disease', 'lora', 'adapters'],
  'embeddings': ['ai document intelligence', 'document intelligence', 'embeddings'],
  'vector databases': ['ai knowledge platform', 'knowledge platform', 'pgvector'],
  'langchain': ['ai customer support platform', 'customer support', 'langchain'],
  'nlp': ['nlp', 'transformers', 'natural language', 'classification'],
  'document ai': ['ai document intelligence', 'document intelligence', 'document processing'],

  'machine learning': ['vortex intelligence suite', 'vortex intelligence', 'machine learning practitioner'],
  'deep learning': ['intro to deep learning', 'advanced deep learning using python', 'deep learning'],
  'model training': ['vortex intelligence suite', 'five-model stacking', 'ensemble'],
  'model evaluation': ['vortex intelligence suite', 'evaluation', 'cross-validation', 'shap'],
  'feature engineering': ['vortex intelligence suite', 'feature engineering', 'feature selection'],
  'hyperparameter optimization': ['quad-tune: 4x speed parallel optuna framework', 'quad-tune', 'parallel optuna'],
  'optuna': ['quad-tune: 4x speed parallel optuna framework', 'quad-tune', 'optuna'],
  'parallel computing': ['quad-tune: 4x speed parallel optuna framework', 'quad-tune', 'parallel computing'],

  'python': ['vortex intelligence suite', 'python oop', 'fastapi'],
  'fastapi': ['ai knowledge platform', 'knowledge platform', 'fastapi'],
  'rest apis': ['ai customer support platform', 'customer support', 'rest api'],
  'api integration': ['ai customer support platform', 'customer support', 'api integration'],
  'postgresql': ['ai knowledge platform', 'knowledge platform', 'postgresql'],
  'vector search': ['ai document intelligence', 'document intelligence', 'vector search'],
  'database design': ['ai knowledge platform', 'knowledge platform', 'database design'],
  'backend development': ['ai knowledge platform', 'knowledge platform', 'backend'],

  'docker': ['ai knowledge platform', 'knowledge platform', 'docker'],
  'git': ['github profile', 'git', 'version control'],
  'github': ['github profile', 'primary github'],
  'deployment': ['ai knowledge platform', 'knowledge platform', 'docker deployment'],
  'experiment tracking': ['vortex intelligence suite', 'stratified k-fold', 'oof'],
  'model optimization': ['quad-tune: 4x speed parallel optuna framework', 'quad-tune', 'model optimization'],
  'performance optimization': ['quad-tune: 4x speed parallel optuna framework', 'quad-tune', '4x speed'],

  'pandas': ['data analytics and data science', 'pandas', 'data manipulation'],
  'numpy': ['numerical', 'array', 'matrix'],
  'scikit-learn': ['vortex intelligence suite', 'scikit-learn', 'ridgecv'],
  'data analysis': ['data analysis and visualization with tableau', 'data analytics', 'tableau'],
  'data visualization': ['effective dashboards using power bi', 'power bi', 'visualization'],
  'statistical analysis': ['statistics and probability for data sciences', 'statistics', 'probability'],
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

  // Search through all records excluding skill definition rows
  const matchedRecords = portfolioData.records.filter((row) => {
    if (row.section === 'skills' || row.section === 'linkedin_posts') return false;

    const haystack = [
      row.title,
      row.description,
      row.technology,
      row.platform,
      row.category,
      row.project_type || '',
      ...(row.categories || []),
      ...(row.technologies || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.some((term) => haystack.includes(term));
  });

  // Calculate high-specificity match score for non-repeating precision
  const scoreRecord = (row: PortfolioRow) => {
    const title = row.title.toLowerCase();
    const desc = row.description.toLowerCase();
    const tech = row.technology.toLowerCase();
    let score = 0;

    // Check specific preferred terms
    preferredTerms.forEach((term, idx) => {
      if (title.includes(term)) score += 300 - idx * 20;
      else if (desc.includes(term)) score += 120 - idx * 10;
      else if (tech.includes(term)) score += 80 - idx * 10;
    });

    // Exact skill match bonus
    if (title.includes(lowerName)) score += 200;
    if (tech.includes(lowerName)) score += 100;
    if (desc.includes(lowerName)) score += 50;

    // Type bonus
    if (row.project_type === 'END-TO-END AI SYSTEM') score += 30;
    if (row.section === 'github_projects') score += 25;
    if (row.section === 'kaggle_notebooks') score += 15;
    if (row.section === 'experience') score += 15;
    if (row.section === 'certifications') score += 10;

    return score;
  };

  const sortedRecords = [...matchedRecords].sort((a, b) => scoreRecord(b) - scoreRecord(a));

  // Extract unique technologies used across these matched records
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

export const allConstellationProjects = [
  ...githubProjects,
  ...kaggleNotebooks,
  ...kaggleDatasets,
  ...kaggleModels,
  ...projectRows,
];
