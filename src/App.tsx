import { useMemo, useState, useEffect, useRef, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Cpu,
  ExternalLink,
  GitBranch,
  Search,
  Sparkles,
  Workflow,
  FileText,
  Menu,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  LayoutGrid,
  Compass,
} from 'lucide-react';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { SkillGalaxy } from './components/SkillGalaxy';
import {
  Sidebar,
  type ThemeMode,
  type ProjectCategoryOption,
} from './components/Sidebar';
import {
  certificationRows,
  externalLinks,
  featuredSystemsForPersona,
  getHeroBySlug,
  getSkillEvidence,
  heroes,
  kaggleDatasets,
  matchesProjectCategory,
  parseTechnologyList,
  personaProjects,
  projectRows,
  skillGroups,
  skillIcons,
  skills,
  type PortfolioRow,
  type SkillGroup,
} from './data';

function personaAccentId(slug: string) {
  const cleaned = slug.replace(/^\/+|\/+$/g, '');
  return cleaned || 'software-engineer';
}

const stageSpecs = [
  { id: 'data', label: '01 DATA', color: 'cyan', desc: 'Ingestion & Validation' },
  { id: 'ml', label: '02 MACHINE LEARNING', color: 'orange', desc: 'Optimization & Ensembles' },
  { id: 'genai', label: '03 GENERATIVE AI', color: 'violet', desc: 'LLMs, RAG & Agents' },
  { id: 'aieng', label: '04 AI ENGINEERING', color: 'blue', desc: 'FastAPI & Vector DBs' },
  { id: 'projects', label: '05 SYSTEMS', color: 'lime', desc: 'End-to-End Production' },
];

function HeroNeuralCanvas({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const isLight = theme === 'light';
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

    const colors = isLight
      ? ['#0284c7', '#6366f1', '#2563eb', '#d97706', '#059669']
      : ['#38bdf8', '#818cf8', '#60a5fa', '#f59e0b', '#34d399'];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: isLight ? Math.random() * 0.4 + 0.5 : Math.random() * 0.5 + 0.35,
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
            ctx.strokeStyle = isLight
              ? `rgba(79, 70, 229, ${opacity * 1.3})`
              : `rgba(135, 162, 255, ${opacity})`;
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

        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 160) {
          const mAlpha = (1 - mdist / 160) * 0.35;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = isLight
            ? `rgba(2, 132, 199, ${mAlpha * 1.4})`
            : `rgba(90, 215, 255, ${mAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.alpha;
        if (!isLight) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 8;
        }
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
  }, [theme]);

  return <canvas ref={canvasRef} className="hero-neural-canvas" aria-hidden="true" />;
}

const getProjectStructure = (project: PortfolioRow) => ({
  problem: project.problem || project.description || 'No problem statement available.',
  data: project.arch_desc || project.solution || project.description || 'No data architecture description available.',
  approach: project.solution || project.features || project.technology || 'No engineering approach available.',
  technology: project.technology || 'No technology stack available.',
  result: project.result_impact || project.statusNote || project.features || project.description || 'No result or impact statement available.',
});

type ProjectLink = {
  label: string;
  url: string;
  kind: 'github' | 'kaggle' | 'skillLync' | 'docs' | 'live' | 'project';
  requiresConfirmation?: boolean;
};

const getProjectLinks = (project: PortfolioRow): ProjectLink[] => {
  const links: ProjectLink[] = [];
  const add = (label: ProjectLink['label'], url: string | undefined, kind: ProjectLink['kind'], requiresConfirmation = false) => {
    if (!url?.trim()) return;
    links.push({ label, url: url.trim(), kind, ...(requiresConfirmation ? { requiresConfirmation: true } : {}) });
  };

  add('GitHub', project.github_url, 'github');
  add('Kaggle', project.kaggle_url, 'kaggle');
  add('Skill-Lync', project.skillLync_url, 'skillLync');
  add('Docs', project.docs_url, 'docs');
  add('Live Demo', project.live_url, 'live', true);

  if (!links.length && project.url) {
    const platform = (project.platform || '').toLowerCase();
    const kind: ProjectLink['kind'] = platform.includes('kaggle')
      ? 'kaggle'
      : platform.includes('skill')
        ? 'skillLync'
        : platform.includes('docs')
          ? 'docs'
          : 'project';
    add(project.platform || 'Project', project.url, kind);
  }

  return links;
};

function ProjectsAsSystemsShowcase({
  systems,
  onOpenProject,
  onOpenLiveDemo,
}: {
  systems: PortfolioRow[];
  onOpenProject: (project: PortfolioRow) => void;
  onOpenLiveDemo: (project: PortfolioRow) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  const currentSystem = systems[currentIndex] || systems[0];

  useEffect(() => {
    setCurrentIndex(0);
    setElapsedTime(0);
    setActiveNodeIndex(0);
  }, [systems]);

  const nodeCount = useMemo(() => {
    if (!currentSystem?.arch_nodes) return 4;
    try {
      const parsed = typeof currentSystem.arch_nodes === 'string' ? JSON.parse(currentSystem.arch_nodes) : currentSystem.arch_nodes;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.length : 4;
    } catch {
      return 4;
    }
  }, [currentSystem]);

  const TIME_PER_NODE = 2200;
  const totalDuration = Math.max(nodeCount * TIME_PER_NODE, 6600);

  useEffect(() => {
    if (isPaused || systems.length <= 1) return;

    const interval = 50;

    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + interval;
        if (next >= totalDuration) {
          setCurrentIndex((curr) => (curr + 1) % systems.length);
          setActiveNodeIndex(0);
          return 0;
        }

        const stepIdx = Math.min(
          Math.floor((next / totalDuration) * nodeCount),
          nodeCount - 1
        );
        setActiveNodeIndex(stepIdx);

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, systems.length, totalDuration, nodeCount]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setElapsedTime(0);
    setActiveNodeIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? systems.length - 1 : prev - 1));
    setElapsedTime(0);
    setActiveNodeIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % systems.length);
    setElapsedTime(0);
    setActiveNodeIndex(0);
  };

  if (!currentSystem) {
    return null;
  }

  const progress = Math.min(100, (elapsedTime / totalDuration) * 100);

  return (
    <div
      className="systems-showcase-container"
      aria-label="Projects As Systems Architecture Showcase"
    >
      <div className="systems-showcase-stage">
        <div className="systems-stage-ambient" aria-hidden="true">
          <div className="ambient-glow" />
          <div className="ambient-grid-lines" />
        </div>

        <button
          type="button"
          className="systems-nav-arrow arrow-prev"
          onClick={handlePrev}
          aria-label="Previous featured system"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          className="systems-nav-arrow arrow-next"
          onClick={handleNext}
          aria-label="Next featured system"
        >
          <ChevronRight size={24} />
        </button>

        <div className="systems-showcase-content" key={currentSystem.id || currentSystem.title}>
          <div className="systems-kicker-bar">
            <div className="systems-kicker-left">
              <span className="systems-kicker-badge">
                FEATURED SYSTEM 0{currentIndex + 1}&nbsp;/&nbsp;0{systems.length}
              </span>
              <span className="systems-type-badge">
                {currentSystem.project_type || 'END-TO-END AI SYSTEM'}
              </span>
              {currentSystem.isLive && (
                <span className="live-status-badge">
                  <span aria-hidden="true">●</span> LIVE
                </span>
              )}
            </div>

            <div className="systems-kicker-right">
              {currentSystem.github_url && (
                <a
                  href={currentSystem.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="systems-header-link systems-github-link"
                >
                  <GitBranch size={13} />
                  <span>GitHub</span>
                </a>
              )}
              {currentSystem.live_url && (
                <button
                  type="button"
                  onClick={() => onOpenLiveDemo(currentSystem)}
                  className="systems-header-link systems-live-link"
                  aria-label={`Open live demo for ${currentSystem.title}`}
                >
                  <ExternalLink size={13} />
                  <span>Live Demo</span>
                </button>
              )}
            </div>
          </div>

          <div className="systems-split-body">
            <div
              className="systems-architecture-box"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="systems-cockpit-header">
                <div className="cockpit-status-dot" />
                <span className="cockpit-header-title">LIVE SYSTEM ARCHITECTURE</span>
                <span className="cockpit-node-count">
                  {nodeCount} NODES
                </span>
              </div>
              <div className="systems-architecture-viewport">
                <ArchitectureFlow
                  project={currentSystem}
                  variant="systems"
                  interactive={true}
                  activeNodeIndex={activeNodeIndex}
                  showRoadmap={false}
                  showDescription={false}
                />
              </div>
            </div>

            <div className="systems-info-panel">
              <div className="systems-header-group">
                <h3 className="systems-title" title={currentSystem.title}>{currentSystem.title}</h3>
                {currentSystem.tagline && (
                  <p className="systems-tagline">{currentSystem.tagline}</p>
                )}
              </div>

              <div className="systems-description-card">
                <span className="systems-desc-kicker">SYSTEM OVERVIEW &amp; MISSION</span>
                <p className="systems-desc-text">
                  {currentSystem.description || currentSystem.problem || currentSystem.solution || 'Production-grade enterprise AI system architecture with automated pipeline processing.'}
                </p>
              </div>

              <div className="systems-tech-chips-wrapper">
                <div className="systems-tech-chips">
                  {parseTechnologyList(currentSystem.technology).slice(0, 8).map((tech) => (
                    <span key={tech} className="systems-tech-chip">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="systems-action-group">
                <button
                  type="button"
                  className="systems-primary-cta"
                  onClick={() => onOpenProject(currentSystem)}
                >
                  <span>VIEW SYSTEM DETAILS ↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="systems-thumbnail-strip" role="tablist" aria-label="System slide selector">
        {systems.map((system, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={system.id || system.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`systems-thumb-card ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              {isActive && (
                <div
                  className="systems-thumb-progress"
                  style={{ width: `${progress}%` }}
                />
              )}
              <div className="systems-thumb-inner">
                <span className="systems-thumb-num">0{idx + 1}</span>
                <div className="systems-thumb-text">
                  <span className="systems-thumb-title">{system.title}</span>
                  <span className="systems-thumb-platform">{system.project_type || system.platform}</span>
                </div>
                {system.isLive && (
                  <span className="systems-thumb-live-dot" title="Live System" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
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
    return { code: 'DL', colorClass: 'badge-color-violet' };
  }
  if (t.includes('machine learning') || t.includes('ml')) {
    return { code: 'ML', colorClass: 'badge-color-orange' };
  }
  if (t.includes('python')) {
    return { code: 'PY', colorClass: 'badge-color-lime' };
  }
  if (t.includes('sql')) {
    return { code: 'SQL', colorClass: 'badge-color-sky' };
  }
  if (t.includes('power bi') || t.includes('tableau') || t.includes('excel') || t.includes('dashboard')) {
    return { code: 'BI', colorClass: 'badge-color-rose' };
  }
  if (t.includes('data science') || t.includes('data analysis') || t.includes('statistics')) {
    return { code: 'DS', colorClass: 'badge-color-cyan' };
  }
  if (t.includes('design thinking') || t.includes('decision') || p.includes('credly')) {
    return { code: 'DT', colorClass: 'badge-color-gold' };
  }
  return {
    code: title.slice(0, 2).toUpperCase(),
    colorClass: 'badge-color-cyan',
  };
};

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
  const seed = 7;
  const hx = getHalton(index + seed, 2);
  const hy = getHalton(index + seed, 3);

  const x = Number((6 + hx * 88).toFixed(1));
  const y = Number((10 + hy * 80).toFixed(1));

  const hPos = x > 50 ? 'pos-left' : 'pos-right';

  let vPos = 'v-center';
  if (y < 22) {
    vPos = 'v-top';
  } else if (y > 78) {
    vPos = 'v-bottom';
  }

  const cWidth = cardWidth > 0 ? cardWidth : 340;
  const cHeight = cardHeight > 0 ? cardHeight : 360;

  const innerMargin = 8;
  const nodeSize = 16;
  const gap = 10;

  const pointY = (y / 100) * cHeight;
  const spaceAbove = Math.max(0, pointY - innerMargin);
  const spaceBelow = Math.max(0, (cHeight - innerMargin) - (pointY + nodeSize));

  const usableAbove = Math.max(0, spaceAbove - gap);
  const usableBelow = Math.max(0, spaceBelow - gap);
  const isAbove = usableAbove >= usableBelow;
  const mVertical = isAbove ? 'm-above' : 'm-below';
  const maxPopupHeight = Math.max(40, isAbove ? usableAbove : usableBelow);
  const maxPopupWidth = Math.max(180, cWidth - 2 * innerMargin);

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

const THEME_KEY = 'belbin-portfolio-theme';
const SIDEBAR_KEY = 'belbin-portfolio-sidebar-open';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const location = useLocation();
  const hero = useMemo(() => getHeroBySlug(location.pathname), [location.pathname]);
  const personaRole = hero.role;
  const credibilityTags = useMemo(
    () =>
      hero.skills
        .split('|')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [hero.skills],
  );

  useEffect(() => {
    const title = hero.meta_tittle || document.title;
    const description = hero.meta_description.trim();
    document.title = title;

    const setMetaContent = (attribute: 'name' | 'property', key: string, content: string) => {
      let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.append(meta);
      }
      meta.content = content;
    };

    if (description) {
      setMetaContent('name', 'description', description);
      setMetaContent('property', 'og:description', description);
      setMetaContent('name', 'twitter:description', description);
    }
    setMetaContent('property', 'og:title', title);
    setMetaContent('name', 'twitter:title', title);
  }, [hero]);

  // Sidebar State Model: Starts minimized by default on every page load.
  // Manual expand/collapse toggle is preserved; no automatic scroll or route expansion.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Navigate to Hero when role/persona route changes
  useEffect(() => {
    const heroEl = document.getElementById('top');
    if (heroEl) {
      requestAnimationFrame(() => {
        heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Dark is the only available theme; other theme modes are announced from the selector.
  const [themeMode, setThemeMode] = useState<'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const activeTheme = themeMode;

  const handleSelectTheme = (mode: ThemeMode) => {
    if (mode !== 'dark') return;
    setThemeMode(mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Mobile Drawer state (for viewport <= 1024px)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Section tracking (PROJECTS AS SYSTEMS, SKILLS AS A NETWORK, PROJECT CONSTELLATION, CERTIFICATIONS, CONTACT)
  const [activeSection, setActiveSection] = useState<string>('work');
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    isProgrammaticScrollRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Release programmatic scroll lock after smooth scrolling completes
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 850);
  };

  useEffect(() => {
    const sectionIds = ['work', 'skills', 'constellation', 'certifications', 'contact'];
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (isProgrammaticScrollRef.current) return;

        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;

        // If user is near or at the bottom of the page, activate contact immediately
        if (scrollPosition + windowHeight >= docHeight - 80) {
          setActiveSection('contact');
          return;
        }

        // Viewport reading focus line at 35% from the top
        const focusPoint = windowHeight * 0.35;

        // Check if any section contains the focus point
        for (let i = 0; i < sectionIds.length; i++) {
          const id = sectionIds[i];
          const el = document.getElementById(id);
          if (!el) continue;

          const rect = el.getBoundingClientRect();
          if (rect.top <= focusPoint && rect.bottom > focusPoint) {
            setActiveSection(id);
            return;
          }
        }

        // If focus point falls between sections, find the most recently crossed section
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const id = sectionIds[i];
          const el = document.getElementById(id);
          if (!el) continue;

          const rect = el.getBoundingClientRect();
          if (rect.top <= focusPoint) {
            setActiveSection(id);
            return;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
          v.play();
        }
      }
    } catch (e) {}

    return () => {
      if (v && !v.paused) try { v.pause(); } catch (e) {}
    };
  }, []);

  const featuredSystems = useMemo(() => featuredSystemsForPersona(personaRole), [personaRole]);

  // Skills As A Network State
  // Helper to look up CMS category for any skill name
  const getCategoryForSkill = (skillName: string): string => {
    const found = skills.find((s) => s.name === skillName);
    if (found && found.category) return found.category;
    const group = skillGroups.find((g) => g.skills.includes(skillName));
    return group ? group.name : skillGroups[0]?.name || '';
  };

  // Explicit filter chosen by user from category dropdown (or sidebar)
  // null = no category filter -> display all skills together in the network
  const [explicitSkillCategory, setExplicitSkillCategory] = useState<string | null>(null);

  const [selectedSkill, setSelectedSkill] = useState<string>(skills[0]?.name || skillGroups[0]?.skills[0] || '');
  const [skillGalaxyFocusRequest, setSkillGalaxyFocusRequest] = useState(0);

  // Active skill category: shared single source of truth for heading label and dropdown value
  const activeSkillCategory = useMemo(() => {
    if (explicitSkillCategory) {
      return explicitSkillCategory;
    }
    return getCategoryForSkill(selectedSkill);
  }, [explicitSkillCategory, selectedSkill]);

  const activeSkillGroup = useMemo(
    () => skillGroups.find((g) => g.name.toLowerCase() === activeSkillCategory.toLowerCase()) || skillGroups[0],
    [activeSkillCategory]
  );

  // When explicit filter is active, only show skills from that group.
  // By default, display all skills together in the network without applying a category filter.
  const displayedSkills = useMemo(() => {
    if (explicitSkillCategory) {
      const group = skillGroups.find((g) => g.name.toLowerCase() === explicitSkillCategory.toLowerCase());
      return group ? group.skills : [];
    }
    return skills.map((s) => s.name);
  }, [explicitSkillCategory]);

  const displayedSkillCount = useMemo(() => {
    if (activeSkillCategory) {
      const group = skillGroups.find((g) => g.name.toLowerCase() === activeSkillCategory.toLowerCase());
      if (group) return group.skills.length;
      return skills.filter((s) => s.category.toLowerCase() === activeSkillCategory.toLowerCase()).length;
    }
    return skills.length;
  }, [activeSkillCategory]);

  const handleExplicitSkillCategoryChange = (categoryName: string) => {
    setExplicitSkillCategory(categoryName);
    const group = skillGroups.find((g) => g.name.toLowerCase() === categoryName.toLowerCase());
    if (group && (!selectedSkill || !group.skills.includes(selectedSkill))) {
      setSelectedSkill(group.skills[0] || '');
    }
  };

  // Persistent Evidence State: keeps currently displayed skill evidence visible until new evidence is ready
  const [displayedEvidenceSkill, setDisplayedEvidenceSkill] = useState<string>(selectedSkill || 'Generative AI');
  const [displayedEvidence, setDisplayedEvidence] = useState(() => getSkillEvidence(selectedSkill || 'Generative AI'));

  useEffect(() => {
    if (!selectedSkill) return;
    const newEvidence = getSkillEvidence(selectedSkill);
    if (newEvidence && (newEvidence.records.length > 0 || newEvidence.technologies.length > 0)) {
      setDisplayedEvidence(newEvidence);
      setDisplayedEvidenceSkill(selectedSkill);
    } else {
      setDisplayedEvidenceSkill(selectedSkill);
      setDisplayedEvidence(newEvidence);
    }
  }, [selectedSkill]);

  // Project Constellation State
  // Default: empty string = no category filter = show all project plots
  const [selectedConstellationFilter, setSelectedConstellationFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConstellationEntry, setSelectedConstellationEntry] = useState<PortfolioRow | null>(null);
  const [projectDetailTab, setProjectDetailTab] = useState<'overview' | 'architecture'>('overview');
  const [pendingLiveDemoUrl, setPendingLiveDemoUrl] = useState<string | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingPlotRef = useRef<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [autoPoppedIndex, setAutoPoppedIndex] = useState<number | null>(0);
  const [constellationViewMode, setConstellationViewMode] = useState<'cards' | 'map'>('map');

  // All CMS Projects for PROJECT CONSTELLATION (no persona/role filtering, no 6-project limit)
  const allConstellationProjects = useMemo(() => {
    const seen = new Set<string>();
    return projectRows.filter((item) => {
      const key = (item.url || `${item.section}-${item.title}`).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  // Dynamic project categories derived directly from CMS project data (No hardcoded ALL PROJECTS pill)
  const projectCategories = useMemo<ProjectCategoryOption[]>(() => {
    const countsMap = new Map<string, number>();

    allConstellationProjects.forEach((p) => {
      const cat = (p.category || '').trim();
      if (cat) {
        countsMap.set(cat, (countsMap.get(cat) || 0) + 1);
      }
    });

    const categories: ProjectCategoryOption[] = [];

    countsMap.forEach((count, cat) => {
      categories.push({
        id: cat,
        label: cat,
        count,
      });
    });

    return categories;
  }, [allConstellationProjects]);

  const filteredProjects = useMemo(() => {
    return allConstellationProjects.filter((item) => {
      const text = `${item.title} ${item.description} ${item.technology} ${item.category} ${item.project_type || ''}`.toLowerCase();

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!text.includes(q)) return false;
      }

      return matchesProjectCategory(item, selectedConstellationFilter);
    });
  }, [allConstellationProjects, selectedConstellationFilter, searchQuery]);

  // Synchronize category highlight from open popup project or active category filter
  const activePopupProject = useMemo(() => {
    const visible = filteredProjects.slice(0, 48);
    if (hoveredPointIndex !== null && visible[hoveredPointIndex]) {
      return visible[hoveredPointIndex];
    }
    if (autoPoppedIndex !== null && visible[autoPoppedIndex]) {
      return visible[autoPoppedIndex];
    }
    return null;
  }, [filteredProjects, hoveredPointIndex, autoPoppedIndex]);

  const activeCategoryHighlight = useMemo(() => {
    if (selectedConstellationFilter) {
      return selectedConstellationFilter;
    }
    if (selectedConstellationEntry?.category) {
      return selectedConstellationEntry.category.trim();
    }
    if (activePopupProject?.category) {
      return activePopupProject.category.trim();
    }
    return '';
  }, [selectedConstellationFilter, selectedConstellationEntry, activePopupProject]);

  // Category displayed beside PROJECT CONSTELLATION and selected in dropdown
  const displayedConstellationCategory = useMemo(() => {
    if (selectedConstellationFilter) {
      return selectedConstellationFilter;
    }
    if (selectedConstellationEntry?.category) {
      return selectedConstellationEntry.category.trim();
    }
    if (activePopupProject?.category) {
      return activePopupProject.category.trim();
    }
    return projectCategories[0]?.id || '';
  }, [selectedConstellationFilter, selectedConstellationEntry, activePopupProject, projectCategories]);

  // Dynamic project count:
  // - Category automatically updated by selected or random plot: display total projects in that category
  // - User explicitly selects a category: display number of projects in that category
  // - All projects displayed with no active category: display total number of projects in PROJECT CONSTELLATION
  const displayedConstellationCount = useMemo(() => {
    if (displayedConstellationCategory) {
      const found = projectCategories.find(
        (c) => c.id.toLowerCase() === displayedConstellationCategory.toLowerCase()
      );
      if (found) return found.count;
      return allConstellationProjects.filter((p) =>
        matchesProjectCategory(p, displayedConstellationCategory)
      ).length;
    }
    return allConstellationProjects.length;
  }, [displayedConstellationCategory, projectCategories, allConstellationProjects]);

  const handleExplicitConstellationCategoryChange = (categoryId: string) => {
    setSelectedConstellationFilter(categoryId);
    setHoveredPointIndex(null);
    setAutoPoppedIndex(0);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedConstellationFilter === categoryId) {
      setSelectedConstellationFilter('');
    } else {
      setSelectedConstellationFilter(categoryId);
    }
    setHoveredPointIndex(null);
    setAutoPoppedIndex(0);
    scrollToSection('constellation');
  };

  useEffect(() => {
    if (hoveredPointIndex !== null) {
      setAutoPoppedIndex(null);
      return;
    }
    const maxPoints = Math.min(filteredProjects.length, 48);
    if (maxPoints === 0) {
      setAutoPoppedIndex(null);
      return;
    }

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
  }, [hoveredPointIndex, filteredProjects.length]);

  const constellationRef = useRef<HTMLDivElement | null>(null);
  const [constellationBounds, setConstellationBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (constellationViewMode !== 'map') return;
    const el = constellationRef.current;
    if (!el) return;

    const updateBounds = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setConstellationBounds({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateBounds();
    const frameId = requestAnimationFrame(updateBounds);

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
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('orientationchange', updateBounds);
    };
  }, [constellationViewMode]);

  const stats = useMemo(() => {
    return {
      aiSystems: allConstellationProjects.filter((p) => p.category === 'AI AGENTS & LLM APPS' || p.project_type === 'END-TO-END AI SYSTEM').length,
      llmGenAi: allConstellationProjects.filter((p) => (p.category || '').includes('LLM') || (p.category || '').includes('AI AGENTS') || /qlora|llm|rag|generative/i.test(`${p.title} ${p.technology}`)).length,
      mlOptuna: allConstellationProjects.filter((p) => (p.category || '').includes('ML') || /optuna|xgboost|lightgbm/i.test(`${p.title} ${p.technology}`)).length,
      datasets: kaggleDatasets.length,
      academic: allConstellationProjects.filter((p) => p.category === 'COURSEWORK & FOUNDATIONS').length,
    };
  }, [allConstellationProjects]);

  const githubLink = externalLinks.find((item) => item.title === 'GitHub')?.url ?? 'https://github.com/BELBINBENORM';
  const kaggleLink = externalLinks.find((item) => item.title === 'Kaggle')?.url ?? 'https://www.kaggle.com/belbino';
  const resumeHref = '/resume/BELBIN RESUME - AIML.pdf';

  const openProjectDetail = (project: PortfolioRow) => {
    setSelectedConstellationEntry(project);
    setProjectDetailTab('overview');
  };

  const handleOpenEvidence = (item: PortfolioRow) => {
    const itemUrl = (item.url || item.github_url || '').trim().toLowerCase();
    const itemTitle = (item.title || '').trim().toLowerCase();

    const matching = projectRows.find((p) => {
      const pUrl = (p.url || p.github_url || '').trim().toLowerCase();
      const pTitle = (p.title || '').trim().toLowerCase();
      if (itemUrl && pUrl && (itemUrl === pUrl || itemUrl.includes(pUrl) || pUrl.includes(itemUrl))) return true;
      if (itemTitle && pTitle && itemTitle === pTitle) return true;
      return false;
    });

    if (matching) {
      openProjectDetail(matching);
    } else if (item.url) {
      window.open(item.url, '_blank', 'noreferrer');
    }
  };

  const openLiveDemoConfirmation = (project: PortfolioRow, url?: string) => {
    const liveDemoUrl = url || project.live_url;
    if (liveDemoUrl) setPendingLiveDemoUrl(liveDemoUrl);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedConstellationEntry(null);
        setPendingLiveDemoUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`portfolio-app-root ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      data-theme={activeTheme}
      data-persona={personaAccentId(hero.slug)}
    >
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

      {/* Main Layout Wrap: Fixed Sidebar + Responsive Main Content */}
      <div className="portfolio-layout-frame">
        {/* Fixed Collapsible/Expandable Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          activeSection={activeSection}
          onNavigateSection={scrollToSection}
          featuredSystemsCount={featuredSystems.length}
          activeSkillGroupId={activeSkillGroup.id}
          onSelectSkillGroup={(groupId) => {
            const group = skillGroups.find((g) => g.id === groupId);
            if (group) {
              if (explicitSkillCategory && explicitSkillCategory.toLowerCase() === group.name.toLowerCase()) {
                setExplicitSkillCategory(null);
              } else {
                handleExplicitSkillCategoryChange(group.name);
              }
            }
          }}
          skillGroups={skillGroups}
          skillsCount={skills.length}
          selectedProjectCategory={selectedConstellationFilter}
          activeCategoryHighlight={activeCategoryHighlight}
          onSelectProjectCategory={handleCategorySelect}
          projectCategories={projectCategories}
          totalConstellationProjects={allConstellationProjects.length}
          certificationsCount={certificationRows.length}
          theme={themeMode}
          onSelectTheme={handleSelectTheme}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Mobile menu button (visible only on <= 1024px) */}
        <button
          type="button"
          className="mobile-sidebar-trigger mobile-only"
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open sidebar navigation"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>

        {/* Main Content Area */}
        <div className="portfolio-main-area">
          <div className="page-shell">
            <main className="page-content">
              {/* =========================================================================
                  HERO SECTION (AI Engineer Identity & Neural Canvas)
              ========================================================================= */}
              <section className="hero section-panel" id="top">
                <HeroNeuralCanvas theme={activeTheme} />

                <div className="hero-content">
                  <div className="hero-kicker-badge">
                    <Sparkles size={14} className="kicker-icon" />
                    <span>{hero.kicker}</span>
                  </div>

                  <h1 className="hero-headline">
                    {hero.headline}
                    <span className="hero-subheadline">
                      {hero.subheadline}
                    </span>
                  </h1>

                  <p className="hero-supporting-text">
                    {hero.description}
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
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => scrollToSection('constellation')}
                    >
                      <Workflow size={16} />
                      <span>VIEW PROJECTS</span>
                    </button>
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
                  DATA UNIVERSE (Pipeline Stages)
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
                  PROJECTS AS SYSTEMS (Netflix Hero Banner Carousel)
              ========================================================================= */}
              <section className="projects section-panel" id="work">
                <div className="section-header projects-section-header">
                  <div className="section-title-wrap projects-title-wrap">
                    <span className="eyebrow">LIVE ENGINEERING SYSTEMS</span>
                    <h2>PROJECTS AS SYSTEMS</h2>
                  </div>
                </div>

                <ProjectsAsSystemsShowcase
                  key={hero.slug}
                  systems={featuredSystems}
                  onOpenProject={openProjectDetail}
                  onOpenLiveDemo={(project) => openLiveDemoConfirmation(project)}
                />
              </section>

              {/* =========================================================================
                  SKILLS AS A NETWORK
              ========================================================================= */}
              <section className="skill-network section-panel" id="skills">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="eyebrow">SKILL → PROJECTS → TECHNOLOGIES</span>
                    <div className="section-title-row">
                      <h2>SKILLS AS A NETWORK</h2>
                      <div className="section-heading-controls">
                        <div className="heading-select-wrap">
                          <select
                            className="heading-category-select"
                            value={activeSkillCategory}
                            onChange={(e) => {
                              handleExplicitSkillCategoryChange(e.target.value);
                              setSkillGalaxyFocusRequest((request) => request + 1);
                            }}
                            aria-label="Skill Category"
                          >
                            {skillGroups.map((group) => (
                              <option key={group.id} value={group.name}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="heading-select-icon" aria-hidden="true" />
                        </div>
                        <span className="heading-count-badge">{displayedSkillCount} SKILLS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Single Unified Fixed-Size Master Card */}
                <div className="skills-unified-card">
                  <div className="unified-card-body">
                    {/* LEFT PANE: Interactive Cinematic Skill Galaxy */}
                    <SkillGalaxy
                      skillGroups={skillGroups}
                      allSkills={skills}
                      skillIcons={skillIcons}
                      activeCategory={activeSkillCategory}
                      selectedSkill={selectedSkill}
                      categoryFocusRequest={skillGalaxyFocusRequest}
                      onSelectSkill={(skillName, catName) => {
                        if (catName && catName.toLowerCase() !== activeSkillCategory.toLowerCase()) {
                          handleExplicitSkillCategoryChange(catName);
                        }
                        setSelectedSkill(skillName);
                      }}
                      onCategoryChange={(catName) => {
                        handleExplicitSkillCategoryChange(catName);
                      }}
                      theme={activeTheme}
                    />

                    {/* RIGHT PANE: Primary Verified Evidence */}
                    <div className="skills-blueprint-pane">
                      <div className="blueprint-hero-header">
                        <div className="blueprint-eyebrow">EVIDENCE RESOLUTION SPEC</div>
                        <h3 className="blueprint-skill-title">{displayedEvidenceSkill}</h3>
                      </div>

                      <div className="blueprint-slots-container">
                        <div className="blueprint-slot slot-evidence highlight-card">
                          {displayedEvidence.records.slice(0, 1).map((item) => (
                            <div key={`${item.section}-${item.title}`} className="slot-evidence-content">
                              <div className="slot-header">
                                <span className="slot-label">01 PRIMARY VERIFIED EVIDENCE</span>
                                <span className="stage-type-pill">
                                  {item.project_type || item.section.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <h4 className="slot-title">{item.title}</h4>
                              <p className="slot-desc">{item.description}</p>
                            </div>
                          ))}
                          {displayedEvidence.records.length === 0 && (
                            <div className="slot-evidence-content evidence-empty-state">
                              <div className="slot-header">
                                <span className="slot-label">01 PRIMARY VERIFIED EVIDENCE</span>
                              </div>
                              <p className="slot-desc">No verified project evidence is currently available for this skill.</p>
                            </div>
                          )}
                        </div>
                        <div className="slot-link-row">
                          {displayedEvidence.records.slice(0, 1).map((item) => item.url ? (
                            <button
                              key={`${item.section}-${item.title}-action`}
                              type="button"
                              className="slot-action-link"
                              onClick={() => handleOpenEvidence(item)}
                              title="Open Project Details"
                            >
                              Open Source Evidence <ExternalLink size={13} />
                            </button>
                          ) : (
                            <span key={`${item.section}-${item.title}-action`} className="slot-action-link-disabled">
                              Grounded Portfolio Work
                            </span>
                          ))}
                          <button
                            type="button"
                            className="slot-action-link"
                            onClick={() => scrollToSection('constellation')}
                          >
                            More Projects <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================================================================
                  2. PROJECT CONSTELLATION (Full Card Visibility & Map View)
              ========================================================================= */}
              <section className="kaggle section-panel" id="constellation">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="eyebrow">TECHNICAL UNIVERSE &amp; EXPERIMENTS</span>
                    <div className="section-title-row">
                      <h2>PROJECT CONSTELLATION</h2>
                      <div className="section-heading-controls">
                        <div className="heading-select-wrap">
                          <select
                            className="heading-category-select"
                            value={displayedConstellationCategory}
                            onChange={(e) => handleExplicitConstellationCategoryChange(e.target.value)}
                            aria-label="Project Category"
                          >
                            {projectCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="heading-select-icon" aria-hidden="true" />
                        </div>
                        {selectedConstellationFilter && (
                          <button
                            type="button"
                            className="heading-filter-clear-btn"
                            onClick={() => setSelectedConstellationFilter('')}
                            title="Clear project category filter (show all projects)"
                            aria-label="Clear project category filter"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <span className="heading-count-badge">
                          {displayedConstellationCount} {displayedConstellationCount === 1 ? 'PROJECT' : 'PROJECTS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Mode Toggle: Cards View vs Interactive Map */}
                  <div className="constellation-view-toggle">
                    <button
                      type="button"
                      className={`constellation-toggle-btn ${constellationViewMode === 'cards' ? 'is-active' : ''}`}
                      onClick={() => setConstellationViewMode('cards')}
                      aria-label="Cards View"
                    >
                      <LayoutGrid size={14} />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      className={`constellation-toggle-btn ${constellationViewMode === 'map' ? 'is-active' : ''}`}
                      onClick={() => setConstellationViewMode('map')}
                      aria-label="Interactive Map View"
                    >
                      <Compass size={14} />
                      <span>Interactive Map</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar - Card View Only */}
                {constellationViewMode === 'cards' && (
                  <div className="constellation-controls">
                    <div className="search-bar">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search projects by name, technology, or topic (e.g. Optuna, QLoRA, FastAPI, RAG)..."
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
                )}

                {/* View A: Project Cards Grid (Full Visibility, No Clipping) */}
                {constellationViewMode === 'cards' && (
                  <div className="constellation-grid" aria-label="Project cards list">
                    {filteredProjects.map((entry) => {
                      const techs = parseTechnologyList(entry.technology || '');
                      return (
                        <article key={`${entry.section}-${entry.title}`} className="constellation-card">
                          <div className="card-top">
                            <span className="card-type-badge">{entry.project_type || entry.category}</span>
                            <span className="card-platform-badge">{entry.platform}</span>
                          </div>

                          <h3 className="card-title">{entry.title}</h3>
                          <p className="card-desc">
                            {entry.tagline || entry.description || 'Production engineering system with clean modular architecture.'}
                          </p>

                          {techs.length > 0 && (
                            <div className="card-techs">
                              {techs.slice(0, 6).map((tech) => (
                                <span key={tech} className="tech-chip">
                                  {tech}
                                </span>
                              ))}
                              {techs.length > 6 && (
                                <span className="tech-chip-more">+{techs.length - 6}</span>
                              )}
                            </div>
                          )}

                          <div className="card-footer">
                            <div className="card-links-left">
                              {entry.github_url && (
                                <a
                                  href={entry.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="card-link"
                                  title="GitHub Repository"
                                >
                                  <GitBranch size={13} />
                                  <span>GitHub</span>
                                </a>
                              )}
                              {entry.live_url && (
                                <button
                                  type="button"
                                  className="card-link is-live-link"
                                  onClick={() => openLiveDemoConfirmation(entry)}
                                  title="Open Deployed Live Demo"
                                >
                                  <ExternalLink size={13} />
                                  <span>Live Demo</span>
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              className="card-detail-btn"
                              onClick={() => openProjectDetail(entry)}
                            >
                              View Project
                            </button>
                          </div>
                        </article>
                      );
                    })}

                    {filteredProjects.length === 0 && (
                      <div className="constellation-empty-state">
                        <p>No projects match your current search and filter criteria.</p>
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedConstellationFilter('');
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* View B: Constellation Interactive Node Map */}
                {constellationViewMode === 'map' && (
                  <div className="constellation-wrap">
                    <div
                      ref={constellationRef}
                      className="constellation"
                      aria-label="Project constellation interactive map"
                    >
                      {filteredProjects.slice(0, 48).map((entry, index) => {
                        const colorClass =
                          entry.category === 'AI AGENTS & LLM APPS' || entry.project_type === 'END-TO-END AI SYSTEM'
                            ? 'system'
                            : entry.url_type === 'git' || entry.url_type === 'github'
                            ? 'github'
                            : entry.category === 'PUBLISHED DATASETS'
                            ? 'dataset'
                            : String(entry.url || entry.kaggle_url || '').includes('/models/')
                            ? 'model'
                            : entry.category === 'COURSEWORK & FOUNDATIONS'
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
                            onPointerDown={(e) => {
                              pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
                              isDraggingPlotRef.current = false;
                            }}
                            onPointerMove={(e) => {
                              if (pointerDownPosRef.current) {
                                const dist = Math.hypot(
                                  e.clientX - pointerDownPosRef.current.x,
                                  e.clientY - pointerDownPosRef.current.y
                                );
                                if (dist > 6) {
                                  isDraggingPlotRef.current = true;
                                }
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (isDraggingPlotRef.current) {
                                return;
                              }
                              openProjectDetail(entry);
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
                )}

                {/* Aggregate Stats */}
                <div className="stats-row">
                  <CountUpStat value={stats.aiSystems} suffix="+" label="End-to-End AI Systems" />
                  <CountUpStat value={stats.llmGenAi} suffix="+" label="LLM & GenAI Projects" />
                  <CountUpStat value={stats.mlOptuna} suffix="+" label="ML & Optimization" />
                  <CountUpStat value={stats.academic} suffix="" label="Academic Projects" />
                  <CountUpStat value={stats.datasets} suffix="+" label="Open Datasets" />
                </div>
              </section>

              {/* =========================================================================
                  HOW I THINK & METHODOLOGY
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
                  CERTIFICATIONS & CREDENTIALS
              ========================================================================= */}
              {certificationRows.length > 0 && (
                <section className="certifications section-panel" id="certifications">
                  <div className="section-header">
                    <div className="section-title-wrap">
                      <span className="eyebrow">VERIFIED CREDENTIALS</span>
                      <h2>CERTIFICATIONS</h2>
                    </div>
                  </div>

                  <div className="cert-multi-row-container">
                    <div className="marquee-container cert-marquee-container" aria-label="Certifications track row 1">
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

                    <div className="marquee-container cert-marquee-container" aria-label="Certifications track row 2">
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
        </div>
      </div>

      {/* DETAIL MODAL (Preserved with 01-04 sections & ArchitectureFlow) */}
      {selectedConstellationEntry && (
        <div className="kaggle-modal" role="dialog" aria-modal="true" aria-label="Project details modal">
          <div className="kaggle-modal-inner">
            <button type="button" className="modal-close" onClick={() => setSelectedConstellationEntry(null)}>
              ✕ Close
            </button>
            <div className="modal-header">
              <span className="modal-badge">{selectedConstellationEntry.project_type || 'PROJECT'}</span>
              <span className="modal-platform">{selectedConstellationEntry.platform}</span>
              {selectedConstellationEntry.isLive && (
                <span className="live-status-badge"><span aria-hidden="true">●</span> LIVE</span>
              )}
            </div>
            <h3>{selectedConstellationEntry.title}</h3>
            <p className="muted">
              Category: {selectedConstellationEntry.category} · Platform: {selectedConstellationEntry.platform}
            </p>

            <div className="project-detail-tabs" role="tablist" aria-label="Project detail views">
              <button
                type="button"
                className={projectDetailTab === 'overview' ? 'is-active' : ''}
                onClick={() => setProjectDetailTab('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={projectDetailTab === 'architecture' ? 'is-active' : ''}
                onClick={() => setProjectDetailTab('architecture')}
              >
                Architecture
              </button>
              {getProjectLinks(selectedConstellationEntry).map((link) =>
                link.requiresConfirmation ? (
                  <button
                    key={`${link.kind}-${link.url}`}
                    type="button"
                    onClick={() => openLiveDemoConfirmation(selectedConstellationEntry, link.url)}
                  >
                    {link.label} <ExternalLink size={13} />
                  </button>
                ) : (
                  <a key={`${link.kind}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                    {link.label} <ExternalLink size={13} />
                  </a>
                ),
              )}
            </div>

            {projectDetailTab === 'overview' && (() => {
              const structure = getProjectStructure(selectedConstellationEntry);
              const sections = [
                { label: '01 PROBLEM', value: structure.problem },
                { label: '02 DATA ARCHITECTURE', value: structure.data },
                { label: '03 ENGINEERING APPROACH', value: structure.approach },
                { label: '04 RESULT & IMPACT', value: structure.result },
              ];

              return (
                <div className="project-detail-overview">
                  <p className="modal-desc">{selectedConstellationEntry.description || 'No description available.'}</p>
                  <div className="project-detail-structure-grid">
                    {sections.map((section) => (
                      <section key={section.label} className="project-detail-structure-card">
                        <span className="detail-kicker">{section.label}</span>
                        <p>{section.value}</p>
                      </section>
                    ))}
                  </div>
                  {selectedConstellationEntry.technology && (
                    <div className="modal-tech-section">
                      <strong>Technology Stack:</strong>
                      <div className="modal-tech-tags">
                        {parseTechnologyList(selectedConstellationEntry.technology).map((t) => (
                          <span key={t} className="modal-tech-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="project-status-line">
                    <span className="blueprint-status-dot" />
                    <span>{selectedConstellationEntry.statusNote || (selectedConstellationEntry.isLive ? 'LIVE PROJECT' : 'PORTFOLIO PROJECT')}</span>
                  </div>
                </div>
              );
            })()}

            {projectDetailTab === 'architecture' && (
              <div className="project-architecture-modal-view">
                <ArchitectureFlow
                  project={selectedConstellationEntry}
                  variant="project"
                  interactive={true}
                  showRoadmap={true}
                  showDescription={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Demo Confirmation Dialog */}
      {pendingLiveDemoUrl && (
        <div className="kaggle-modal live-demo-confirmation" role="dialog" aria-modal="true" aria-label="Live project confirmation">
          <div className="kaggle-modal-inner confirmation-modal-inner">
            <div className="detail-kicker">LIVE PROJECT</div>
            <h3>Open deployed project?</h3>
            <p className="modal-desc">
              <strong>This project is hosted on a free-tier service.</strong><br />
              The first request may take approximately <strong>1 minute</strong> while the server starts. Please wait.
            </p>
            <div className="confirmation-actions">
              <button type="button" className="confirmation-cancel" onClick={() => setPendingLiveDemoUrl(null)}>BACK</button>
              <button
                type="button"
                className="modal-primary-btn"
                onClick={() => {
                  const destination = pendingLiveDemoUrl;
                  setPendingLiveDemoUrl(null);
                  if (destination) {
                    window.open(destination, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                OKAY, CONTINUE <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
