import { useMemo, useState, useEffect, useRef, type CSSProperties } from 'react';
import {
  ArrowDown,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  Orbit,
  Search,
  Sparkles,
  Terminal,
  Workflow,
  CheckCircle2,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import {
  certificationRows,
  educationRows,
  experienceRows,
  externalLinks,
  getSkillEvidence,
  githubProjects,
  kaggleDatasets,
  kaggleModels,
  kaggleNotebooks,
  parseTechnologyList,
  profileLinks,
  projectRows,
  skillGroups,
  skillRows,
  type PortfolioRow,
  type SkillGroup,
} from './data';

const credibilityTags = [
  'LLM',
  'RAG',
  'AI AGENTS',
  'GENERATIVE AI',
  'FASTAPI',
  'PYTHON',
  'MACHINE LEARNING',
  'POSTGRESQL',
];

const stageSpecs = [
  { id: 'data', label: '01 DATA', color: 'cyan', desc: 'Ingestion & Validation' },
  { id: 'ml', label: '02 MACHINE LEARNING', color: 'orange', desc: 'Optimization & Ensembles' },
  { id: 'genai', label: '03 GENERATIVE AI', color: 'violet', desc: 'LLMs, RAG & Agents' },
  { id: 'aieng', label: '04 AI ENGINEERING', color: 'blue', desc: 'FastAPI & Vector DBs' },
  { id: 'projects', label: '05 SYSTEMS', color: 'lime', desc: 'End-to-End Production' },
];

function HeroNeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const numNodes = 42;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }[] = [];

    const colors = ['#5ad7ff', '#b594ff', '#5d7cff', '#efd18d', '#a3e635'];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.35,
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const opacity = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(135, 162, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes and connect to mouse
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Subtle mouse pull
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 160) {
          const mAlpha = (1 - mdist / 160) * 0.35;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(90, 215, 255, ${mAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.alpha;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-neural-canvas" aria-hidden="true" />;
}

const getProjectStructure = (project: { title: string; description: string; technology: string; category?: string; project_type?: string; project_categories?: string[]; }) => {
  const title = project.title.toLowerCase();
  const desc = project.description;
  const tech = project.technology;

  if (title.includes('customer support')) {
    return {
      problem: 'Enterprise support requires real-time, context-grounded agent orchestration with persistent multi-session memory.',
      data: 'Customer issue histories, domain documentation, and relational ticket records stored in PostgreSQL.',
      approach: 'Autonomous LLM agent workflows with LangChain tool calling, semantic RAG retrieval, and structured API integration.',
      technology: tech || 'Python, FastAPI, LLM, Generative AI, AI Agents, RAG, LangChain, PostgreSQL, Embeddings',
      result: 'End-to-end operational AI customer support platform with tool-assisted issue resolution and grounded answers.',
    };
  }

  if (title.includes('document intelligence')) {
    return {
      problem: 'Unstructured documents contain critical insights trapped across dense PDFs and non-standard layouts.',
      data: 'Multi-format PDF, technical papers, and text document corpora indexed with high-dimensional vector embeddings.',
      approach: 'End-to-end RAG architecture with semantic chunking, pgvector similarity indexing, and grounded LLM reasoning.',
      technology: tech || 'Python, FastAPI, LLM, RAG, Document Processing, Embeddings, pgvector, PostgreSQL',
      result: 'Production-ready document intelligence system supporting real-time document Q&A and semantic retrieval.',
    };
  }

  if (title.includes('knowledge platform')) {
    return {
      problem: 'Building a production-ready knowledge engine requires reliable vector search, tool calling, and containerized backend.',
      data: 'Document chunks, embeddings, and chat sessions stored in PostgreSQL with pgvector.',
      approach: 'FastAPI backend orchestrating local/API LLMs (Ollama / Llama 3.2), automated pytest verification, and Docker deployment.',
      technology: tech || 'Python, FastAPI, Pydantic, SQLAlchemy, PostgreSQL, pgvector, RAG, Ollama, Docker',
      result: 'Full-stack AI knowledge platform supporting multi-tenant document ingestion and agentic workflows.',
    };
  }

  if (title.includes('quad-tune') || title.includes('optuna')) {
    return {
      problem: 'Serial hyperparameter tuning in machine learning creates severe experimentation bottlenecks.',
      data: 'High-dimensional Kaggle tabular datasets and complex multi-model parameter search spaces.',
      approach: 'Parallelized Optuna framework with multi-worker trial execution and intelligent early-stopping pruning.',
      technology: tech || 'Python, Optuna, Hyperparameter Optimization, Parallel Computing, Machine Learning',
      result: '4x acceleration in hyperparameter tuning speed with reproducible trial tracking and performance gains.',
    };
  }

  if (title.includes('qlora') || title.includes('fine-tuning')) {
    return {
      problem: 'Adapting large language models for specialized healthcare prediction under strict compute constraints.',
      data: 'Clinical prediction dataset with formatted instruction-tuning prompts.',
      approach: 'Parameter-efficient fine-tuning (PEFT / QLoRA) with 4-bit NormalFloat quantization, LoRA adapters, and Hugging Face Transformers.',
      technology: tech || 'Python, LLM, QLoRA, LoRA, Fine-Tuning, Transformers, Hugging Face, NLP',
      result: 'Fine-tuned domain-adapted LLM demonstrating high parameter efficiency and low-memory adaptation.',
    };
  }

  if (title.includes('vortex intelligence') || title.includes('vortex-intelligence')) {
    return {
      problem: 'Complex machine learning workflows suffer from fragmented diagnostics, inconsistent validation, and non-standardized feature pipelines.',
      data: 'Multi-modal tabular and analytical datasets requiring structured preprocessing and rigorous validation.',
      approach: 'Unified ML architecture integrating automated exploratory data diagnostics, robust cross-validation schemes, and reproducible model evaluation.',
      technology: tech || 'Python, Scikit-learn, Feature Engineering, Cross-Validation, Model Evaluation, Data Analytics, Pandas, NumPy',
      result: 'Modular production-ready ML intelligence suite accelerating experiment validation and model reliability.',
    };
  }

  return {
    problem: desc.split(/\s+as\s+/i)[0] || 'Domain challenge addressed with engineering and data modeling.',
    data: desc.includes('dataset') || desc.includes('data') ? 'Domain datasets curated for robust modeling and evaluation.' : 'Data is foundational to the engineering approach.',
    approach: desc.includes('RAG') || desc.includes('retrieval')
      ? 'Retrieval and reasoning are used to ground generated answers.'
      : 'Built with practical experimentation, modular architecture, and repeatable pipelines.',
    technology: tech || 'Python-based technical stack',
    result: desc.includes('deployed') || desc.includes('backend') || desc.includes('automated')
      ? 'System output designed for real-world use and scalable operations.'
      : 'Technical implementation supporting reproducible machine learning and engineering workflows.',
  };
};

function ProjectsHeroCarousel({ systems }: { systems: PortfolioRow[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentSystem = systems[currentIndex] || systems[0];
  const structure = getProjectStructure(currentSystem);

  // Auto-advance timer (every 6 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const totalDuration = 6000;
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % systems.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, systems.length, currentIndex]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? systems.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % systems.length);
    setProgress(0);
  };

  return (
    <div
      className="netflix-hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Projects As Systems Hero Carousel"
    >
      {/* Main Cinematic Hero Banner Stage */}
      <div className="netflix-hero-stage">
        <div className="netflix-stage-ambient" aria-hidden="true">
          <div className="ambient-glow" />
          <div className="ambient-grid-lines" />
        </div>

        {/* Left/Right Arrow Navigation Controls */}
        <button
          type="button"
          className="netflix-nav-arrow arrow-prev"
          onClick={handlePrev}
          aria-label="Previous featured system"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          className="netflix-nav-arrow arrow-next"
          onClick={handleNext}
          aria-label="Next featured system"
        >
          <ChevronRight size={24} />
        </button>

        <div className="netflix-hero-content">
          {/* Left Column: Title, Metadata, Tech Chips & CTA */}
          <div className="netflix-hero-info">
            <div className="netflix-hero-kicker">
              <span className="netflix-kicker-badge">
                FEATURED SYSTEM 0{currentIndex + 1} / 0{systems.length}
              </span>
              <span className="netflix-type-badge">
                {currentSystem.project_type || 'END-TO-END AI SYSTEM'}
              </span>
              <span className="netflix-platform-badge">
                {currentSystem.platform}
              </span>
            </div>

            <h3 className="netflix-hero-title">{currentSystem.title}</h3>

            <p className="netflix-hero-desc">{currentSystem.description}</p>

            {/* Tech Stack Pills */}
            <div className="netflix-tech-chips">
              {parseTechnologyList(currentSystem.technology).slice(0, 8).map((tech) => (
                <span key={tech} className="netflix-tech-chip">
                  {tech}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="netflix-hero-actions">
              <a
                href={currentSystem.url}
                target="_blank"
                rel="noreferrer"
                className="netflix-primary-cta"
              >
                <span>{currentSystem.platform === 'GitHub' ? 'VIEW REPOSITORY' : 'VIEW NOTEBOOK / CODE'}</span>
                <ExternalLink size={16} />
              </a>
              <a
                href="#architecture"
                className="netflix-secondary-cta"
              >
                <span>VIEW ARCHITECTURE</span>
                <Workflow size={15} />
              </a>
            </div>
          </div>

          {/* Right Column: Architectural Blueprint & System Breakdown */}
          <div className="netflix-hero-blueprint">
            <div className="blueprint-header">
              <div className="blueprint-status-dot" />
              <span className="blueprint-title">SYSTEM ARCHITECTURE SPECIFICATION</span>
              <span className="blueprint-env">PRODUCTION</span>
            </div>

            <div className="blueprint-grid">
              <div className="blueprint-item">
                <span className="blueprint-label">01 PROBLEM</span>
                <p className="blueprint-val">{structure.problem}</p>
              </div>
              <div className="blueprint-item">
                <span className="blueprint-label">02 DATA ARCHITECTURE</span>
                <p className="blueprint-val">{structure.data}</p>
              </div>
              <div className="blueprint-item">
                <span className="blueprint-label">03 ENGINEERING APPROACH</span>
                <p className="blueprint-val">{structure.approach}</p>
              </div>
              <div className="blueprint-item">
                <span className="blueprint-label">04 RESULT &amp; IMPACT</span>
                <p className="blueprint-val highlight-result">{structure.result}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip / Drawer */}
      <div className="netflix-thumbnail-strip" role="tablist" aria-label="System slide selector">
        {systems.map((system, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={system.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`netflix-thumb-card ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              {isActive && (
                <div
                  className="netflix-thumb-progress"
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="netflix-thumb-inner">
                <span className="netflix-thumb-num">0{idx + 1}</span>
                <div className="netflix-thumb-text">
                  <span className="netflix-thumb-title">{system.title}</span>
                  <span className="netflix-thumb-platform">{system.platform}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectSystemCard({ project }: { project: PortfolioRow }) {
  const [isHovering, setIsHovering] = useState(false);
  const structure = getProjectStructure(project);

  return (
    <article
      className="project-system"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="project-head">
        <div className="project-badges">
          <span className="project-type-badge">{project.project_type || 'END-TO-END AI SYSTEM'}</span>
          <span className="project-platform-badge">{project.platform}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="project-system-desc">{project.description}</p>
      </div>

      <div className="structure" data-active={isHovering ? 'true' : 'false'}>
        <div><span>PROBLEM</span><strong>{structure.problem}</strong></div>
        <div><span>DATA</span><strong>{structure.data}</strong></div>
        <div><span>APPROACH</span><strong>{structure.approach}</strong></div>
        <div><span>TECHNOLOGY</span><strong>{structure.technology}</strong></div>
        <div><span>RESULT</span><strong>{structure.result}</strong></div>
      </div>

      <div className="project-meta">
        <a href={project.url} target="_blank" rel="noreferrer">
          {project.platform === 'GitHub' ? 'View Repository' : 'View Notebook / Code'} <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}

function CountUpStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1600;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * value);
            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={elementRef} className="stat-card">
      <span className="stat-num">
        {hasAnimated ? displayValue : 0}
        {suffix}
      </span>
      <small>{label}</small>
    </div>
  );
}

const getCertTheme = (title: string, platform: string) => {
  const t = title.toLowerCase();
  const p = platform.toLowerCase();

  if (t.includes('deep learning') || t.includes('dl')) {
    return {
      code: 'DL',
      colorClass: 'badge-color-violet',
    };
  }
  if (t.includes('machine learning') || t.includes('ml')) {
    return {
      code: 'ML',
      colorClass: 'badge-color-orange',
    };
  }
  if (t.includes('python')) {
    return {
      code: 'PY',
      colorClass: 'badge-color-lime',
    };
  }
  if (t.includes('sql')) {
    return {
      code: 'SQL',
      colorClass: 'badge-color-sky',
    };
  }
  if (t.includes('power bi') || t.includes('tableau') || t.includes('excel') || t.includes('dashboard')) {
    return {
      code: 'BI',
      colorClass: 'badge-color-rose',
    };
  }
  if (t.includes('data science') || t.includes('data analysis') || t.includes('statistics')) {
    return {
      code: 'DS',
      colorClass: 'badge-color-cyan',
    };
  }
  if (t.includes('design thinking') || t.includes('decision') || p.includes('credly')) {
    return {
      code: 'DT',
      colorClass: 'badge-color-gold',
    };
  }
  return {
    code: title.slice(0, 2).toUpperCase(),
    colorClass: 'badge-color-cyan',
  };
};

// Deterministic low-discrepancy 2D distribution using Halton(2, 3) sequence
const getHalton = (index: number, base: number): number => {
  let result = 0;
  let f = 1 / base;
  let i = index;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f = f / base;
  }
  return result;
};

const getConstellationCoordinates = (index: number, cardWidth = 0, cardHeight = 0) => {
  // Seed 7 provides an optimal uniform spread with high minimum distance between adjacent points
  const seed = 7;
  const hx = getHalton(index + seed, 2);
  const hy = getHalton(index + seed, 3);

  // Safe inner margins to guarantee points don't clip the outer card borders
  const x = Number((6 + hx * 88).toFixed(1));
  const y = Number((10 + hy * 80).toFixed(1));

  // Desktop Horizontal Alignment:
  // Points on the right side of the card (x > 50%) pop leftward into open canvas space
  const hPos = x > 50 ? 'pos-left' : 'pos-right';

  // Dynamic Vertical Boundary Detection (Desktop):
  // Points near top/bottom boundaries adjust alignment to prevent vertical clipping
  let vPos = 'v-center';
  if (y < 22) {
    vPos = 'v-top';
  } else if (y > 78) {
    vPos = 'v-bottom';
  }

  // --- MOBILE SIZING & ALIGNMENT (Innermost card boundary) ---
  const cWidth = cardWidth > 0 ? cardWidth : 340;
  const cHeight = cardHeight > 0 ? cardHeight : 360;

  const innerMargin = 8;
  const nodeSize = 16;
  const gap = 10;

  // Available empty vertical space above vs below
  const pointY = (y / 100) * cHeight;
  const spaceAbove = Math.max(0, pointY - innerMargin);
  const spaceBelow = Math.max(0, (cHeight - innerMargin) - (pointY + nodeSize));

  const usableAbove = Math.max(0, spaceAbove - gap);
  const usableBelow = Math.max(0, spaceBelow - gap);
  const isAbove = usableAbove >= usableBelow;
  const mVertical = isAbove ? 'm-above' : 'm-below';
  const maxPopupHeight = Math.max(40, isAbove ? usableAbove : usableBelow);
  const maxPopupWidth = Math.max(180, cWidth - 2 * innerMargin);

  // Horizontal Alignment on Mobile:
  // Center by default; align left/right for points near boundaries to stay strictly in card
  let mHAlign = 'm-center';
  let arrowPct = 50;

  if (x < 24) {
    mHAlign = 'm-left';
    arrowPct = Math.max(12, Math.min(30, Math.round((x / 24) * 25 + 10)));
  } else if (x > 76) {
    mHAlign = 'm-right';
    arrowPct = Math.max(70, Math.min(88, Math.round(100 - ((100 - x) / 24) * 25 - 10)));
  }

  return {
    x,
    y,
    hPos,
    vPos,
    mVertical,
    mHAlign,
    mMaxWidthPx: maxPopupWidth,
    mMaxHeightPx: maxPopupHeight,
    arrowPct,
  };
};

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const certRow1 = useMemo(() => certificationRows.filter((_, idx) => idx % 2 === 0), []);
  const certRow2 = useMemo(() => certificationRows.filter((_, idx) => idx % 2 !== 0), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const v = videoRef.current;
    try {
      if (v) {
        v.muted = true;
        v.loop = true;
        if (prefersReduced) {
          v.pause();
        } else {
          const p = v.play();
        }
      }
    } catch (e) {
      // ignore playback issues
    }

    return () => {
      if (v && !v.paused) try { v.pause(); } catch (e) {}
    };
  }, []);

  // RAG Interactive Architecture Stages
  const ragStages = useMemo(() => [
    { label: 'DOCUMENTS', detail: 'Source documentation, technical PDFs, and structured data are ingested.', kind: 'documents' },
    { label: 'CHUNKING', detail: 'Text is split into semantic token chunks with overlap preservation.', kind: 'chunking' },
    { label: 'EMBEDDINGS', detail: 'Dense embedding models generate semantic vector representations.', kind: 'embeddings' },
    { label: 'POSTGRESQL + PGVECTOR', detail: 'Persistent vector storage with cosine/L2 index for low-latency queries.', kind: 'pgvector' },
    { label: 'SEMANTIC RETRIEVAL', detail: 'Hybrid search retrieves the most contextually relevant passages.', kind: 'retrieval' },
    { label: 'AI AGENTS & TOOLS', detail: 'Tool-enabled reasoning and agent orchestration execute queries.', kind: 'agent' },
    { label: 'GROUNDED ANSWER', detail: 'LLM generates truthful, hallucination-resistant answers with citations.', kind: 'answer' },
  ], []);

  const [selectedRagStage, setSelectedRagStage] = useState<string>('CHUNKING');
  const [isRagAutoPaused, setIsRagAutoPaused] = useState<boolean>(false);

  // Auto-selection cycling through RAG architecture stages (pauses on hover)
  useEffect(() => {
    if (isRagAutoPaused) return;

    const timer = setInterval(() => {
      setSelectedRagStage((curr) => {
        const currentIndex = ragStages.findIndex((s) => s.label === curr);
        const nextIndex = currentIndex === -1 || currentIndex + 1 >= ragStages.length ? 0 : currentIndex + 1;
        return ragStages[nextIndex].label;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [ragStages, isRagAutoPaused]);

  // Featured premier systems (6 core systems)
  const featuredSystems = useMemo(() => {
    const desired = [
      'AI Customer Support Platform',
      'AI Document Intelligence',
      'AI Knowledge Platform',
      'Quad-Tune: 4x Speed Parallel Optuna Framework',
      'QLoRA Fine-Tuning: Predicting Heart Disease',
      'Vortex Intelligence Suite',
    ];

    const list: PortfolioRow[] = [];
    desired.forEach((name) => {
      const match =
        githubProjects.find((p) => p.title.toLowerCase() === name.toLowerCase()) ||
        kaggleNotebooks.find((p) => p.title.toLowerCase() === name.toLowerCase());
      if (match) list.push(match);
    });

    // fallback to any top github projects if missing
    if (list.length === 0) {
      return githubProjects.slice(0, 6);
    }
    return list;
  }, []);

  // Skills As A Network State
  const [activeSkillGroupId, setActiveSkillGroupId] = useState<string>('genai');
  const activeSkillGroup = useMemo(
    () => skillGroups.find((g) => g.id === activeSkillGroupId) || skillGroups[0],
    [activeSkillGroupId]
  );

  const [selectedSkill, setSelectedSkill] = useState<string>('Generative AI');
  const [isSkillAutoPaused, setIsSkillAutoPaused] = useState<boolean>(false);

  // Auto-selection cycling through skills in active group
  useEffect(() => {
    if (isSkillAutoPaused) return;

    const timer = setInterval(() => {
      const skills = activeSkillGroup.skills;
      const currentIndex = skills.indexOf(selectedSkill);
      const nextIndex = currentIndex === -1 || currentIndex + 1 >= skills.length ? 0 : currentIndex + 1;
      setSelectedSkill(skills[nextIndex]);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeSkillGroup, selectedSkill, isSkillAutoPaused]);

  // Group Switcher Tabs
  const handleSelectGroup = (group: SkillGroup) => {
    setActiveSkillGroupId(group.id);
    setSelectedSkill(group.skills[0]);
  };

  const skillEvidenceResult = useMemo(() => {
    return getSkillEvidence(selectedSkill);
  }, [selectedSkill]);

  // Project Constellation State
  const constellationFilterOptions = [
    { id: 'ALL', label: 'ALL PROJECTS' },
    { id: 'SYSTEMS', label: 'END-TO-END AI SYSTEMS' },
    { id: 'GENAI_LLM', label: 'GENERATIVE AI & LLM' },
    { id: 'ML_OPT', label: 'ML & OPTIMIZATION' },
    { id: 'SCRAPERS', label: 'AUTOMATED PIPELINES' },
    { id: 'ACADEMIC', label: 'ACADEMIC RESEARCH' },
    { id: 'DATASETS_MODELS', label: 'DATASETS & MODELS' },
  ];

  const [selectedConstellationFilter, setSelectedConstellationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConstellationEntry, setSelectedConstellationEntry] = useState<PortfolioRow | null>(null);
  const [autoPoppedIndex, setAutoPoppedIndex] = useState<number | null>(null);
  const [isConstellationHovered, setIsConstellationHovered] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Consolidated Master List of All Projects for the Constellation Universe
  const allProjects = useMemo(() => {
    const combined: PortfolioRow[] = [
      ...githubProjects,
      ...kaggleNotebooks,
      ...kaggleDatasets,
      ...kaggleModels,
      ...projectRows,
    ];

    // Deduplicate by URL or Title
    const seen = new Set<string>();
    return combined.filter((item) => {
      const key = `${item.section}-${item.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((item) => {
      const text = `${item.title} ${item.description} ${item.technology} ${item.category} ${item.project_type || ''}`.toLowerCase();

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!text.includes(q)) return false;
      }

      // Category Pill Filter
      if (selectedConstellationFilter === 'ALL') return true;

      if (selectedConstellationFilter === 'SYSTEMS') {
        return (
          item.project_type === 'END-TO-END AI SYSTEM' ||
          item.section === 'github_projects' ||
          text.includes('end-to-end') ||
          text.includes('platform')
        );
      }

      if (selectedConstellationFilter === 'GENAI_LLM') {
        return (
          text.includes('llm') ||
          text.includes('generative ai') ||
          text.includes('rag') ||
          text.includes('agent') ||
          text.includes('qlora') ||
          text.includes('fine-tuning') ||
          text.includes('prompt') ||
          text.includes('document intelligence')
        );
      }

      if (selectedConstellationFilter === 'ML_OPT') {
        return (
          text.includes('machine learning') ||
          text.includes('optuna') ||
          text.includes('optimization') ||
          text.includes('stacking') ||
          text.includes('xgboost') ||
          text.includes('lightgbm') ||
          text.includes('gradient boosting') ||
          text.includes('hyperparameter')
        );
      }

      if (selectedConstellationFilter === 'SCRAPERS') {
        return text.includes('scraper') || text.includes('scraping') || item.project_type === 'AUTOMATED DATA PIPELINE';
      }

      if (selectedConstellationFilter === 'ACADEMIC') {
        return item.section === 'projects' || text.includes('academic') || text.includes('course project');
      }

      if (selectedConstellationFilter === 'DATASETS_MODELS') {
        return item.section === 'kaggle_datasets' || item.section === 'kaggle_models';
      }

      return true;
    });
  }, [allProjects, selectedConstellationFilter, searchQuery]);

  // Automated random constellation point popping (pauses on hover)
  useEffect(() => {
    if (isConstellationHovered) {
      setAutoPoppedIndex(null);
      return;
    }
    const maxPoints = Math.min(filteredProjects.length, 48);
    if (maxPoints === 0) return;

    const initialTimer = setTimeout(() => {
      setAutoPoppedIndex(Math.floor(Math.random() * maxPoints));
    }, 600);

    const interval = setInterval(() => {
      setAutoPoppedIndex((prev) => {
        let next = Math.floor(Math.random() * maxPoints);
        if (maxPoints > 1 && next === prev) {
          next = (next + 1) % maxPoints;
        }
        return next;
      });
    }, 2400);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isConstellationHovered, filteredProjects.length]);

  // Innermost constellation plot card boundary measurement for dynamic mobile sizing
  const constellationRef = useRef<HTMLDivElement | null>(null);
  const [constellationBounds, setConstellationBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = constellationRef.current;
    if (!el) return;

    const updateBounds = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setConstellationBounds({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateBounds();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setConstellationBounds({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      }
    });

    ro.observe(el);
    window.addEventListener('resize', updateBounds);
    window.addEventListener('orientationchange', updateBounds);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('orientationchange', updateBounds);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      aiSystems: allProjects.filter((p) => p.project_type === 'END-TO-END AI SYSTEM' || p.section === 'github_projects').length,
      llmGenAi: allProjects.filter((p) => {
        const t = `${p.title} ${p.technology} ${p.category}`.toLowerCase();
        return t.includes('llm') || t.includes('generative ai') || t.includes('rag') || t.includes('agent') || t.includes('qlora');
      }).length,
      mlOptuna: allProjects.filter((p) => {
        const t = `${p.title} ${p.technology} ${p.category}`.toLowerCase();
        return t.includes('optuna') || t.includes('machine learning') || t.includes('stack') || t.includes('gradient');
      }).length,
      datasets: kaggleDatasets.length,
      academic: projectRows.length,
    };
  }, [allProjects]);

  const githubLink = externalLinks.find((item) => item.title === 'GitHub')?.url ?? 'https://github.com/BELBINBENORM';
  const linkedInLink = externalLinks.find((item) => item.title === 'LinkedIn')?.url ?? 'https://www.linkedin.com/in/belbino/';
  const kaggleLink = externalLinks.find((item) => item.title === 'Kaggle')?.url ?? 'https://www.kaggle.com/belbino';
  const resumeHref = '/resume/BELBIN RESUME - AIML.pdf';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="page-shell">
      {/* Site-wide ambient video */}
      <div className="site-video-wrap" aria-hidden="true">
        <video
          ref={videoRef}
          className="site-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/ai-ambient.jpg"
        >
          <source src="/videos/ai-ambient.mp4" type="video/mp4" />
        </video>
        <div className="site-video-overlay" />
      </div>
      <div className="grain" aria-hidden="true" />

      {/* Sticky Header */}
      <header className="topbar">
        <nav className="brand-lockup" aria-label="Main navigation">
          <div className="brand-title-group">
            <span className="brand-mark">BELBIN BENO R M</span>
            <span className="brand-badge">AI/ML ENGINEER</span>
          </div>
          <div className="nav-links">
            <a href="#work">Systems</a>
            <a href="#architecture">Architecture</a>
            <a href="#skills">Skills Network</a>
            <a href="#constellation">Constellation</a>
            <a href="#journey">Journey</a>
            <a href="#contact">Contact</a>
            <a
              className="resume-cta"
              href={resumeHref}
              download="BELBIN RESUME - AIML.pdf"
              title="Direct PDF Download"
            >
              Resume ↓
            </a>
          </div>
          <button
            type="button"
            className="hamburger-btn"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Navigation Menu Dropdown */}
        <div
          className={`mobile-nav-menu ${isMobileMenuOpen ? 'is-open' : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="mobile-nav-links">
            <a
              href="#work"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">01</span>
              <span>SYSTEMS</span>
            </a>
            <a
              href="#architecture"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">02</span>
              <span>ARCHITECTURE</span>
            </a>
            <a
              href="#skills"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">03</span>
              <span>SKILLS NETWORK</span>
            </a>
            <a
              href="#constellation"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">04</span>
              <span>CONSTELLATION</span>
            </a>
            <a
              href="#journey"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">05</span>
              <span>JOURNEY</span>
            </a>
            <a
              href="#contact"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-accent">06</span>
              <span>CONTACT</span>
            </a>
            <a
              href={resumeHref}
              download="BELBIN RESUME - AIML.pdf"
              className="mobile-resume-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              title="Direct PDF Download"
            >
              <FileText size={15} />
              <span>RESUME</span>
              <span className="resume-download-icon">↓</span>
            </a>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="page-content">
        {/* =========================================================================
            HERO SECTION (AI Engineer Identity & Neural Canvas)
        ========================================================================= */}
        <section className="hero section-panel" id="top">
          <HeroNeuralCanvas />

          <div className="hero-content">
            <div className="hero-kicker-badge">
              <Sparkles size={14} className="kicker-icon" />
              <span>AI/ML ENGINEER & SYSTEM ARCHITECT</span>
            </div>

            <h1 className="hero-headline">
              AI/ML ENGINEER
              <span className="hero-subheadline">
                Building Intelligent Systems with LLMs, RAG & AI Agents
              </span>
            </h1>

            <p className="hero-supporting-text">
              Specialized in architecting end-to-end Generative AI systems, autonomous multi-agent workflows,
              high-accuracy retrieval-augmented generation (RAG) pipelines, and accelerated machine learning optimization frameworks.
            </p>

            {/* Credibility Tech Strip */}
            <div className="hero-credibility-strip" aria-label="Core Technology Competencies">
              <div className="strip-label">CORE DOMAINS:</div>
              <div className="strip-tags">
                {credibilityTags.map((tag) => (
                  <span key={tag} className="credibility-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="hero-action-row">
              <a href="#work" className="primary-btn">
                <Workflow size={16} />
                <span>VIEW PROJECTS</span>
              </a>
              <a
                href={resumeHref}
                download="BELBIN RESUME - AIML.pdf"
                className="secondary-btn"
                title="Direct PDF Download"
              >
                <FileText size={16} />
                <span>DOWNLOAD RESUME</span>
              </a>
              <a href={githubLink} target="_blank" rel="noreferrer" className="ghost-btn">
                <GitBranch size={16} />
                <span>GITHUB</span>
              </a>
              <a href={kaggleLink} target="_blank" rel="noreferrer" className="ghost-btn">
                <Cpu size={16} />
                <span>KAGGLE</span>
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SYSTEM STAGES OVERVIEW
        ========================================================================= */}
        <section className="universe section-panel" id="lab">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">ENGINEERING PIPELINE</span>
              <h2>INTERACTIVE DATA UNIVERSE</h2>
            </div>
          </div>

          <div className="stage-grid">
            {stageSpecs.map((stage) => (
              <article key={stage.id} className={`stage-panel stage-${stage.color}`}>
                <div className="stage-label">{stage.label}</div>
                <div className="stage-desc">{stage.desc}</div>
                <div className="stage-visual stage-visual--data" aria-hidden="true">
                  {stage.id === 'data' && (
                    <>
                      <span className="dot dot-a" />
                      <span className="dot dot-b" />
                      <span className="dot dot-c" />
                      <span className="dot dot-d" />
                    </>
                  )}
                  {stage.id === 'ml' && (
                    <>
                      <span className="node node-a" />
                      <span className="node node-b" />
                      <span className="line line-a" />
                      <span className="line line-b" />
                    </>
                  )}
                  {stage.id === 'genai' && (
                    <>
                      <span className="doc doc-a" />
                      <span className="doc doc-b" />
                      <span className="embedding-ring" />
                    </>
                  )}
                  {stage.id === 'aieng' && (
                    <>
                      <span className="service service-a" />
                      <span className="service service-b" />
                      <span className="service service-c" />
                    </>
                  )}
                  {stage.id === 'projects' && (
                    <>
                      <span className="project-block block-a" />
                      <span className="project-block block-b" />
                      <span className="project-block block-c" />
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================================
            FEATURED ARCHITECTURE (RAG + AGENT SYSTEM)
        ========================================================================= */}
        <section className="rag section-panel" id="architecture">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">PRODUCTION ARCHITECTURE</span>
              <h2>LIVE RAG & MULTI-AGENT PIPELINE</h2>
            </div>
          </div>

          <div
            className="rag-grid"
            onMouseEnter={() => setIsRagAutoPaused(true)}
            onMouseLeave={() => setIsRagAutoPaused(false)}
          >
            <div className="rag-flow" aria-label="Interactive RAG architecture stages">
              {ragStages.map((stage, index) => {
                const ragStyle = { ['--delay' as string]: `${index * 0.1}s` } as CSSProperties;

                return (
                  <button
                    key={stage.label}
                    type="button"
                    className={`rag-node ${selectedRagStage === stage.label ? 'is-active' : ''}`}
                    onClick={() => setSelectedRagStage(stage.label)}
                    style={ragStyle}
                  >
                    <span className="rag-step-num">0{index + 1}</span>
                    <span className="rag-step-title">{stage.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="rag-detail">
              <div className="detail-kicker">STAGE SPECIFICATION</div>
              <h3>{selectedRagStage}</h3>
              <p>
                {selectedRagStage === 'DOCUMENTS' &&
                  'Multi-format ingestion pipeline processing unstructured PDFs, technical specifications, and knowledge records with format sanitization.'}
                {selectedRagStage === 'CHUNKING' &&
                  'Recursive character & token-aware chunking preserving contextual boundaries, metadata headers, and structural relationships.'}
                {selectedRagStage === 'EMBEDDINGS' &&
                  'Dense high-dimensional vector representations generated via state-of-the-art embedding models to capture semantic intent.'}
                {selectedRagStage === 'POSTGRESQL + PGVECTOR' &&
                  'Relational persistence paired with pgvector similarity indexing (IVFFlat/HNSW) for sub-millisecond retrieval and hybrid filtering.'}
                {selectedRagStage === 'SEMANTIC RETRIEVAL' &&
                  'Similarity scoring combined with exact metadata matching to retrieve the most contextually relevant passages.'}
                {selectedRagStage === 'AI AGENTS & TOOLS' &&
                  'Autonomous LangChain/FastAPI agent workflows executing external tool calls, database operations, and multi-turn session reasoning.'}
                {selectedRagStage === 'GROUNDED ANSWER' &&
                  'Synthesized responses strictly grounded on retrieved evidence with source attribution, eliminating hallucinations.'}
              </p>
              <div className="detail-tech">
                <span>FastAPI • PostgreSQL • pgvector • LangChain • Ollama • Llama 3.2 • Python</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECTS AS SYSTEMS (Netflix Hero Banner Carousel)
        ========================================================================= */}
        <section className="projects section-panel" id="work">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">END-TO-END ENGINEERING</span>
              <h2>PROJECTS AS SYSTEMS</h2>
            </div>
          </div>

          <ProjectsHeroCarousel systems={featuredSystems} />
        </section>

        {/* =========================================================================
            SKILLS AS A NETWORK (Unified Fixed-Size Card with Skill List & Capability Blueprint)
        ========================================================================= */}
        <section className="skill-network section-panel" id="skills">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">SKILL → PROJECTS → TECHNOLOGIES</span>
              <h2>SKILLS AS A NETWORK</h2>
            </div>
          </div>

          {/* Group Switcher Tabs */}
          <div className="skill-group-nav" role="tablist">
            {skillGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={activeSkillGroupId === group.id}
                className={`skill-group-tab ${activeSkillGroupId === group.id ? 'is-active' : ''}`}
                onClick={() => handleSelectGroup(group)}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Single Unified Fixed-Size Master Card */}
          <div
            className="skills-unified-card"
            onMouseEnter={() => setIsSkillAutoPaused(true)}
            onMouseLeave={() => setIsSkillAutoPaused(false)}
          >
            {/* Top Bar inside Card */}
            <div className="unified-card-top-bar">
              <div className="card-top-left">
                <span className="blueprint-status-dot" />
                <span className="card-stage-title">CAPABILITY BLUEPRINT</span>
                <span className="stage-group-pill">{activeSkillGroup.name}</span>
              </div>
              <div className="card-top-right">
                <span className="skills-count-badge">{activeSkillGroup.skills.length} SKILLS</span>
              </div>
            </div>

            {/* 2-Column Split: Left = Interactive Orbit Circle, Right = Capability Blueprint */}
            <div className="unified-card-body">
              {/* LEFT PANE: Interactive Radial Orbit / Nodes Bloom (3-Tier Non-Overlapping Distribution) */}
              <div className="network-node-bloom">
                <div className="orbit-track orbit-track-inner" aria-hidden="true" />
                <div className="orbit-track orbit-track-mid" aria-hidden="true" />
                <div className="orbit-track orbit-track-outer" aria-hidden="true" />

                <div className="network-center">
                  <span>AI</span>
                  <small>{activeSkillGroup.name.split('/')[0].trim()}</small>
                </div>

                {activeSkillGroup.skills.map((skill, index) => {
                  const total = activeSkillGroup.skills.length;
                  // Dynamic 3-tier staggered orbit allocation to completely eliminate overlapping
                  let radius = 165;
                  if (total <= 6) {
                    radius = 165;
                  } else if (total <= 8) {
                    radius = index % 2 === 0 ? 215 : 148;
                  } else {
                    // Stagger across 3 tiers (Outer 230px, Mid 180px, Inner 135px)
                    const tier = index % 3;
                    radius = tier === 0 ? 230 : tier === 1 ? 180 : 135;
                  }

                  const angle = (360 / total) * index;
                  const skillStyle = {
                    ['--angle' as string]: `${angle}deg`,
                    ['--radius' as string]: `${radius}px`,
                  } as CSSProperties;

                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`network-node ${selectedSkill === skill ? 'is-selected' : ''}`}
                      style={skillStyle}
                      onClick={() => setSelectedSkill(skill)}
                      title={`Inspect evidence for ${skill}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* RIGHT PANE: Capability Blueprint (Locked Fixed-Height Slots) */}
              <div className="skills-blueprint-pane">
                <div className="blueprint-hero-header">
                  <div className="blueprint-eyebrow">EVIDENCE RESOLUTION SPEC</div>
                  <h3 className="blueprint-skill-title">{selectedSkill}</h3>
                </div>

                <div className="blueprint-slots-container">
                  {/* 01 Primary Direct Evidence Slot (Fixed Height) */}
                  <div className="blueprint-slot slot-evidence highlight-card">
                    {skillEvidenceResult.records.slice(0, 1).map((item) => (
                      <div key={`${item.section}-${item.title}`} className="slot-evidence-content">
                        <div className="slot-header">
                          <span className="slot-label">01 PRIMARY VERIFIED EVIDENCE</span>
                          <span className="stage-type-pill">
                            {item.project_type || item.section.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h4 className="slot-title">{item.title}</h4>
                        <p className="slot-desc">{item.description}</p>
                        <div className="slot-link-row">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="slot-action-link"
                            >
                              Open Source Evidence <ExternalLink size={13} />
                            </a>
                          ) : (
                            <span className="slot-action-link-disabled">Grounded Portfolio Work</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {skillEvidenceResult.records.length === 0 && (
                      <div className="slot-evidence-content">
                        <div className="slot-header">
                          <span className="slot-label">01 PRIMARY VERIFIED EVIDENCE</span>
                          <span className="stage-type-pill">CORE COMPETENCY</span>
                        </div>
                        <h4 className="slot-title">{selectedSkill} Engineering</h4>
                        <p className="slot-desc">
                          Applied across end-to-end production pipelines, architectural components, and high-performance workflows.
                        </p>
                        <div className="slot-link-row">
                          <a href="#constellation" className="slot-action-link">
                            Explore Technical Universe <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 02 Associated Tech Stack Slot (Generous Height for Multiple Lines) */}
                  <div className="blueprint-slot slot-tech">
                    <div className="slot-header">
                      <span className="slot-label">02 ASSOCIATED TECH STACK</span>
                    </div>
                    <div className="blueprint-tech-chips">
                      {(skillEvidenceResult.technologies.length > 0
                        ? skillEvidenceResult.technologies.slice(0, 10)
                        : [selectedSkill, 'Python', 'AI Systems', 'Production']
                      ).map((t) => (
                        <span key={t} className="blueprint-tech-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 03 Deep Dive Universe CTA (Fixed Height) */}
                  <div className="blueprint-slot slot-footer">
                    <div className="slot-footer-text">
                      <span className="slot-label">03 TECHNICAL UNIVERSE</span>
                      <p className="slot-footer-desc">
                        Explore full code implementations, models, and Kaggle experiments:
                      </p>
                    </div>
                    <a href="#constellation" className="stage-universe-btn">
                      Project Constellation ↓
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECT CONSTELLATION (Comprehensive Technical Universe)
        ========================================================================= */}
        <section className="kaggle section-panel" id="constellation">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">TECHNICAL UNIVERSE & EXPERIMENTS</span>
              <h2>PROJECT CONSTELLATION</h2>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div className="constellation-controls">
            <div className="filter-row" aria-label="Constellation category filters">
              {constellationFilterOptions.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={selectedConstellationFilter === filter.id ? 'filter-pill is-active' : 'filter-pill'}
                  onClick={() => setSelectedConstellationFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects by name, technology, or topic (e.g. Optuna, QLoRA, FastAPI, RAG, CNN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Constellation Interactive Node Map */}
          <div
            className="constellation-wrap"
            onMouseEnter={() => {
              setIsConstellationHovered(true);
              setAutoPoppedIndex(null);
            }}
            onMouseLeave={() => {
              setIsConstellationHovered(false);
              setHoveredPointIndex(null);
            }}
          >
            <div
              ref={constellationRef}
              className="constellation"
              aria-label="Project constellation interactive map"
            >
              {filteredProjects.slice(0, 48).map((entry, index) => {
                const colorClass =
                  entry.project_type === 'END-TO-END AI SYSTEM'
                    ? 'system'
                    : entry.section === 'github_projects'
                    ? 'github'
                    : entry.section === 'kaggle_datasets'
                    ? 'dataset'
                    : entry.section === 'kaggle_models'
                    ? 'model'
                    : entry.section === 'projects'
                    ? 'academic'
                    : 'notebook';

                const {
                  x,
                  y,
                  hPos,
                  vPos,
                  mVertical,
                  mHAlign,
                  mMaxWidthPx,
                  mMaxHeightPx,
                  arrowPct,
                } = getConstellationCoordinates(
                  index,
                  constellationBounds.width,
                  constellationBounds.height
                );
                const isPopped = hoveredPointIndex === index || (hoveredPointIndex === null && autoPoppedIndex === index);

                return (
                  <button
                    key={`${entry.section}-${entry.title}`}
                    type="button"
                    className={`constellation-point ${colorClass} ${isPopped ? 'is-active is-auto-popped' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={`${entry.title} • ${entry.project_type || entry.category}`}
                    onMouseEnter={() => setHoveredPointIndex(index)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedConstellationEntry(entry);
                    }}
                  >
                    <span
                      className={`point-label ${hPos} ${vPos} ${mVertical} ${mHAlign}`}
                      style={
                        {
                          ['--m-max-width-px' as any]: `${mMaxWidthPx}px`,
                          ['--m-max-height-px' as any]: `${mMaxHeightPx}px`,
                          ['--arrow-pct' as any]: `${arrowPct}%`,
                        } as CSSProperties
                      }
                    >
                      <strong>{entry.title}</strong>
                      <small>{entry.project_type || entry.category}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregate Stats with Smooth Count-Up Animation */}
          <div className="stats-row">
            <CountUpStat value={stats.aiSystems} suffix="+" label="End-to-End AI Systems" />
            <CountUpStat value={stats.llmGenAi} suffix="+" label="LLM & GenAI Projects" />
            <CountUpStat value={stats.mlOptuna} suffix="+" label="ML & Optimization" />
            <CountUpStat value={stats.academic} suffix="" label="Academic Projects" />
            <CountUpStat value={stats.datasets} suffix="+" label="Open Datasets" />
          </div>
        </section>

        {/* DETAIL MODAL */}
        {selectedConstellationEntry && (
          <div className="kaggle-modal" role="dialog" aria-modal="true" aria-label="Project details modal">
            <div className="kaggle-modal-inner">
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedConstellationEntry(null)}
              >
                ✕ Close
              </button>
              <div className="modal-header">
                <span className="modal-badge">{selectedConstellationEntry.project_type || 'PROJECT'}</span>
                <span className="modal-platform">{selectedConstellationEntry.platform}</span>
              </div>
              <h3>{selectedConstellationEntry.title}</h3>
              <p className="muted">
                Category: {selectedConstellationEntry.category} · Platform: {selectedConstellationEntry.platform}
              </p>
              <p className="modal-desc">{selectedConstellationEntry.description || 'No description available.'}</p>

              {selectedConstellationEntry.technology && (
                <div className="modal-tech-section">
                  <strong>Technology Stack:</strong>
                  <div className="modal-tech-tags">
                    {parseTechnologyList(selectedConstellationEntry.technology).map((t) => (
                      <span key={t} className="modal-tech-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedConstellationEntry.url && (
                <div className="modal-actions">
                  <a
                    href={selectedConstellationEntry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="modal-primary-btn"
                  >
                    Open on {selectedConstellationEntry.platform} <ExternalLink size={15} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            HOW I THINK & METHODOLOGY (Horizontal Moving Row)
        ========================================================================= */}
        <section className="thinking section-panel">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">ENGINEERING METHODOLOGY</span>
              <h2>HOW I THINK &amp; BUILD</h2>
            </div>
          </div>

          <div className="marquee-container thinking-marquee-container" aria-label="Methodology rotating track">
            <div className="marquee-track thinking-marquee-track">
              {[
                { step: 'PROBLEM FRAMING', desc: 'Isolate user requirements, system constraints & latency targets' },
                { step: 'DATA ARCHITECTURE', desc: 'Structure schemas, embeddings, chunking & persistent storage' },
                { step: 'EXPERIMENTATION', desc: 'Benchmark model variants, prompts, quantization & optimization' },
                { step: 'SYSTEM INTEGRATION', desc: 'Expose FastAPI endpoints, agent tool calling & stateful sessions' },
                { step: 'EVALUATION & CI', desc: 'Execute automated test suites, OOF validation & groundedness checks' },
                { step: 'PRODUCTION SYSTEM', desc: 'Containerize via Docker and deploy robust, reproducible services' },
              ].concat([
                { step: 'PROBLEM FRAMING', desc: 'Isolate user requirements, system constraints & latency targets' },
                { step: 'DATA ARCHITECTURE', desc: 'Structure schemas, embeddings, chunking & persistent storage' },
                { step: 'EXPERIMENTATION', desc: 'Benchmark model variants, prompts, quantization & optimization' },
                { step: 'SYSTEM INTEGRATION', desc: 'Expose FastAPI endpoints, agent tool calling & stateful sessions' },
                { step: 'EVALUATION & CI', desc: 'Execute automated test suites, OOF validation & groundedness checks' },
                { step: 'PRODUCTION SYSTEM', desc: 'Containerize via Docker and deploy robust, reproducible services' },
              ]).map((item, index) => (
                <div key={`${item.step}-${index}`} className="thinking-step thinking-marquee-step">
                  <div className="step-index">0{(index % 6) + 1}</div>
                  <div className="step-label">{item.step}</div>
                  <p className="step-subdesc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="thinking-caption">
            AI engineering bridges the gap between research notebooks and reliable, scalable production systems. Every project is anchored in rigorous validation, grounded retrieval, and clean software architecture.
          </div>
        </section>

        {/* =========================================================================
            JOURNEY
        ========================================================================= */}
        <section className="journey section-panel" id="journey">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="eyebrow">EVOLUTION</span>
              <h2>TECHNICAL JOURNEY</h2>
            </div>
          </div>

          <div className="journey-flow">
            {[
              { title: 'COMPUTER SCIENCE FOUNDATION', detail: 'B.E. Computer Science & Engineering (SNS College of Technology) - algorithms, system architecture & Python OOP.' },
              { title: 'DATA ANALYTICS & APPLIED STATISTICS', detail: 'Quantitative analysis, Power BI, SQL, statistical modeling, and workflow automation reducing legacy processing time by 40%.' },
              { title: 'COMPETITIVE MACHINE LEARNING', detail: 'Stratified K-Fold validation, multi-expert stacking classifiers, Optuna hyperparameter optimization & SHAP interpretability on Kaggle.' },
              { title: 'GENERATIVE AI & LLM ADAPTATION', detail: 'PEFT/QLoRA fine-tuning, dense vector embeddings, prompt engineering, and grounded retrieval architectures.' },
              { title: 'PRODUCTION AI ENGINEERING', detail: 'Autonomous multi-agent orchestration, FastAPI microservices, pgvector semantic search, Dockerized deployments & robust testing.' },
            ].map((stage, idx) => (
              <div key={stage.title} className="journey-step">
                <span className="journey-num">0{idx + 1}</span>
                <div className="journey-info">
                  <h3>{stage.title}</h3>
                  <p>{stage.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            CERTIFICATIONS & CREDENTIALS (2 Rows • 2 Directions • Colorful Cards)
        ========================================================================= */}
        {certificationRows.length > 0 && (
          <section className="certifications section-panel">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="eyebrow">VERIFIED CREDENTIALS</span>
                <h2>CERTIFICATIONS</h2>
              </div>
            </div>

            <div className="cert-multi-row-container">
              {/* Row 1: Leftward moving track */}
              <div className="marquee-container cert-marquee-container" aria-label="Certifications rotating track row 1">
                <div className="marquee-track cert-marquee-track-left">
                  {[...certRow1, ...certRow1].map((cert, idx) => {
                    const theme = getCertTheme(cert.title, cert.platform);
                    return (
                      <a
                        key={`r1-${cert.title}-${idx}`}
                        className={`badge-item ${theme.colorClass}`}
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`${cert.title} • ${cert.platform}`}
                      >
                        <div className="badge-top-row">
                          <span className="badge-core">{theme.code}</span>
                          <span className="badge-meta">{cert.platform}</span>
                        </div>

                        <div className="badge-content">
                          <span className="badge-name">{cert.title}</span>
                          <span className="badge-category">{cert.category || 'Professional Certification'}</span>
                        </div>

                        <div className="badge-bottom-row">
                          <span className="badge-verify-text">Verify Credential</span>
                          <ExternalLink size={13} className="badge-link-icon" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Rightward moving track */}
              <div className="marquee-container cert-marquee-container" aria-label="Certifications rotating track row 2">
                <div className="marquee-track cert-marquee-track-right">
                  {[...certRow2, ...certRow2].map((cert, idx) => {
                    const theme = getCertTheme(cert.title, cert.platform);
                    return (
                      <a
                        key={`r2-${cert.title}-${idx}`}
                        className={`badge-item ${theme.colorClass}`}
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`${cert.title} • ${cert.platform}`}
                      >
                        <div className="badge-top-row">
                          <span className="badge-core">{theme.code}</span>
                          <span className="badge-meta">{cert.platform}</span>
                        </div>

                        <div className="badge-content">
                          <span className="badge-name">{cert.title}</span>
                          <span className="badge-category">{cert.category || 'Professional Certification'}</span>
                        </div>

                        <div className="badge-bottom-row">
                          <span className="badge-verify-text">Verify Credential</span>
                          <ExternalLink size={13} className="badge-link-icon" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            CONTACT / FOOTER
        ========================================================================= */}
        <section className="contact section-panel" id="contact">
          <div className="contact-core">
            <div className="contact-beno">BELBIN BENO</div>
            <h2>LET&apos;S BUILD INTELLIGENT SYSTEMS.</h2>
            <p>Generative AI · LLMs · RAG · AI Agents · Machine Learning · AI Engineering</p>
            <div className="contact-actions">
              {externalLinks
                .filter((item) => ['GitHub', 'LinkedIn', 'Email'].includes(item.title))
                .map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target={item.url.startsWith('http') ? '_blank' : undefined}
                    rel={item.url.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {item.title}
                  </a>
                ))}
              <a
                href={resumeHref}
                download="BELBIN RESUME - AIML.pdf"
                className="contact-resume-link"
                title="Direct PDF Download"
              >
                Download Resume (PDF)
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <span className="footer-accent-dot" aria-hidden="true" />
          <span className="footer-copyright-text">
            © 2026 BELBIN BENO R M. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
