import React, { useEffect, useRef, useCallback } from 'react';
import type { SkillGroup } from '../data';

export interface SkillGalaxyProps {
  skillGroups: SkillGroup[];
  allSkills: { name: string; category: string; icon_dark?: string; icon_light?: string }[];
  skillIcons: Record<string, string>;
  activeCategory: string;
  selectedSkill: string;
  categoryFocusRequest?: number;
  onSelectSkill: (skillName: string, categoryName: string) => void;
  onCategoryChange: (categoryName: string) => void;
  theme?: string;
}

// Category color palettes
interface CategoryTheme {
  primary: string;
  secondary: string;
  glow: string;
  hubBgDark: string;
  hubBgLight: string;
  tagDark: string;
  tagLight: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'generative ai & llms': {
    primary: '#38bdf8',
    secondary: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.45)',
    hubBgDark: '#082f49',
    hubBgLight: '#e0f2fe',
    tagDark: '#bae6fd',
    tagLight: '#0369a1',
  },
  'machine learning': {
    primary: '#c084fc',
    secondary: '#9333ea',
    glow: 'rgba(192, 132, 252, 0.45)',
    hubBgDark: '#3b0764',
    hubBgLight: '#f3e8ff',
    tagDark: '#e9d5ff',
    tagLight: '#7e22ce',
  },
  'data engineering & automation': {
    primary: '#60a5fa',
    secondary: '#2563eb',
    glow: 'rgba(96, 165, 250, 0.45)',
    hubBgDark: '#172554',
    hubBgLight: '#dbeafe',
    tagDark: '#bfdbfe',
    tagLight: '#1d4ed8',
  },
  'databases & vector search': {
    primary: '#34d399',
    secondary: '#059669',
    glow: 'rgba(52, 211, 153, 0.45)',
    hubBgDark: '#022c22',
    hubBgLight: '#d1fae5',
    tagDark: '#a7f3d0',
    tagLight: '#047857',
  },
  'data analysis & visualization': {
    primary: '#fbbf24',
    secondary: '#d97706',
    glow: 'rgba(251, 191, 36, 0.45)',
    hubBgDark: '#451a03',
    hubBgLight: '#fef3c7',
    tagDark: '#fde68a',
    tagLight: '#b45309',
  },
  'devops & deployment': {
    primary: '#818cf8',
    secondary: '#4f46e5',
    glow: 'rgba(129, 140, 248, 0.45)',
    hubBgDark: '#1e1b4b',
    hubBgLight: '#e0e7ff',
    tagDark: '#c7d2fe',
    tagLight: '#4338ca',
  },
  'backend & apis': {
    primary: '#2dd4bf',
    secondary: '#0d9488',
    glow: 'rgba(45, 212, 191, 0.45)',
    hubBgDark: '#042f2e',
    hubBgLight: '#ccfbf1',
    tagDark: '#99f6e4',
    tagLight: '#0f766e',
  },
  'languages': {
    primary: '#f43f5e',
    secondary: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.45)',
    hubBgDark: '#4c0519',
    hubBgLight: '#ffe4e6',
    tagDark: '#fecdd3',
    tagLight: '#be123c',
  },
};

const DEFAULT_THEME: CategoryTheme = {
  primary: '#5ad7ff',
  secondary: '#0284c7',
  glow: 'rgba(90, 215, 255, 0.4)',
  hubBgDark: '#0b192c',
  hubBgLight: '#e0f2fe',
  tagDark: '#bae6fd',
  tagLight: '#0369a1',
};

function getCatTheme(name: string): CategoryTheme {
  const key = name.toLowerCase().trim();
  return CATEGORY_THEMES[key] || DEFAULT_THEME;
}

interface SkillNode {
  name: string;
  category: string;
  orbitRadius: number;
  orbitSpeed: number;
  baseAngle: number;
  currentAngle: number;
  x: number;
  y: number;
  radius: number;
  iconDark?: string;
  iconLight?: string;
}

interface CategorySystem {
  id: string;
  name: string;
  theme: CategoryTheme;
  orbitRadius: number;
  orbitSpeed: number;
  baseAngle: number;
  currentAngle: number;
  x: number;
  y: number;
  hubRadius: number;
  maxSkillRadius: number;
  skills: SkillNode[];
}

type GalaxyMode = 'loop1' | 'loop2' | 'loop3';
type GalaxyPhase = 'overview' | 'travel' | 'explore' | 'zoomout';

const randomSkillIndex = (count: number, excludedIndex = -1) => {
  if (count <= 0) return -1;
  if (count === 1) return 0;
  if (excludedIndex < 0) return Math.floor(Math.random() * count);
  const randomIndex = Math.floor(Math.random() * (count - 1));
  return randomIndex >= excludedIndex ? randomIndex + 1 : randomIndex;
};

function getResponsiveOrbitBounds(systems: CategorySystem[], width: number, height: number) {
  const longestCategoryLabel = Math.max(0, ...systems.map((system) => system.name.length * 5.2 + 20));
  const widestSkillLabel = Math.max(0, ...systems.flatMap((system) => system.skills.map((skill) => skill.name.length * 4.6 + 12)));
  const labelWidth = Math.min(Math.max(48, widestSkillLabel), Math.max(48, Math.min(width, height) * 0.24));
  const categoryScale = Math.min(
    1,
    Math.max(24, width / 2 - longestCategoryLabel / 2 - 14) / Math.max(1, width / 2),
    Math.max(24, height / 2 - 48) / Math.max(1, height / 2)
  );
  const skillScale = Math.min(
    1,
    Math.max(24, width / 2 - labelWidth / 2 - 14) / Math.max(1, width / 2),
    Math.max(24, height / 2 - 48) / Math.max(1, height / 2)
  );
  const categoryXRadius = Math.max(24, width / 2 * categoryScale);
  const categoryYRadius = Math.max(24, height / 2 * categoryScale);
  const xRadius = Math.max(24, width / 2 * skillScale);
  const yRadius = Math.max(24, height / 2 * skillScale);
  return {
    categoryXRadius,
    categoryYRadius,
    xRadius,
    yRadius,
    averageRadius: (xRadius + yRadius) / 2,
    labelWidth,
  };
}

function assignResponsiveSkillOrbits(
  system: CategorySystem,
  bounds: ReturnType<typeof getResponsiveOrbitBounds>
) {
  const skills = system.skills;
  if (skills.length === 0) {
    system.maxSkillRadius = 0;
    return;
  }

  const labelWidths = skills.map((skill) => Math.min(bounds.labelWidth, Math.max(36, skill.name.length * 4.6 + 12)));
  const minRadius = Math.min(bounds.averageRadius * 0.3, 48);
  const maxRadius = Math.max(minRadius, bounds.averageRadius * 0.9);
  const maxLines = Math.max(1, Math.ceil(Math.max(...skills.map((skill) => skill.name.length * 4.6)) / bounds.labelWidth));
  const ringGap = Math.max(20, Math.min(34, maxLines * 8 + 7));
  const occupiedRadii: number[] = [];
  let skillIndex = 0;
  let ringIndex = 0;

  while (skillIndex < skills.length) {
    const ringRadius = Math.min(maxRadius, minRadius + ringIndex * ringGap);
    occupiedRadii.push(ringRadius);
    const circumference = Math.PI * 2 * ringRadius
      * Math.sqrt((bounds.xRadius ** 2 + bounds.yRadius ** 2) / 2)
      / bounds.averageRadius;
    const ringCapacity = Math.max(1, Math.floor(circumference / (Math.max(...labelWidths) + 14)));
    const skillsOnRing = Math.min(ringCapacity, skills.length - skillIndex);

    for (let ringPosition = 0; ringPosition < skillsOnRing; ringPosition += 1) {
      const skill = skills[skillIndex];
      const angle = (Math.PI * 2 * ringPosition) / skillsOnRing + (ringIndex % 2 ? Math.PI / skillsOnRing : 0);
      skill.orbitRadius = ringRadius;
      skill.baseAngle = angle;
      skill.currentAngle = angle;
      skillIndex += 1;
    }

    if (ringRadius >= maxRadius && skillIndex < skills.length) {
      const skillsOnRing = skills.length - skillIndex;
      for (let ringPosition = 0; ringPosition < skillsOnRing; ringPosition += 1) {
        const skill = skills[skillIndex];
        const angle = (Math.PI * 2 * ringPosition) / skillsOnRing + Math.PI / skillsOnRing;
        skill.orbitRadius = maxRadius;
        skill.baseAngle = angle;
        skill.currentAngle = angle;
        skillIndex += 1;
      }
      break;
    }

    ringIndex += 1;
  }

  const finalRadius = occupiedRadii[occupiedRadii.length - 1] || minRadius;
  skills.forEach((skill) => {
    if (occupiedRadii.length === 1) {
      skill.orbitRadius = minRadius + (maxRadius - minRadius) * 0.58;
      return;
    }
    const progress = (skill.orbitRadius - minRadius) / Math.max(1, finalRadius - minRadius);
    skill.orbitRadius = minRadius + progress * (maxRadius - minRadius);
  });

  system.maxSkillRadius = maxRadius;
}

function wrapSkillLabel(ctx: CanvasRenderingContext2D, label: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';

  label.split(/\s+/).forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      return;
    }
    if (line) lines.push(line);
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      return;
    }
    let fragment = '';
    for (const character of word) {
      const next = `${fragment}${character}`;
      if (ctx.measureText(next).width > maxWidth && fragment) {
        lines.push(fragment);
        fragment = character;
      } else {
        fragment = next;
      }
    }
    line = fragment;
  });

  if (line) lines.push(line);
  return lines;
}

export const SkillGalaxy: React.FC<SkillGalaxyProps> = ({
  skillGroups,
  allSkills,
  activeCategory,
  selectedSkill,
  categoryFocusRequest = 0,
  onSelectSkill,
  onCategoryChange,
  theme = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const orbitLayoutSizeRef = useRef({ width: 0, height: 0 });
  const renderRequestRef = useRef<() => void>(() => {});

  // Logo images preloading cache
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Skills lookup map for icons
  const skillMetaMap = useRef<Map<string, { icon_dark?: string; icon_light?: string }>>(new Map());
  useEffect(() => {
    const map = new Map<string, { icon_dark?: string; icon_light?: string }>();
    allSkills.forEach((s) => {
      map.set(s.name.toLowerCase(), { icon_dark: s.icon_dark, icon_light: s.icon_light });
    });
    skillMetaMap.current = map;
  }, [allSkills]);

  // Systems data
  const systemsRef = useRef<CategorySystem[]>([]);
  const lastExternalCategoryRef = useRef(activeCategory.toLowerCase());
  const lastCategoryFocusRequestRef = useRef(categoryFocusRequest);
  const programmaticCategoryChangeRef = useRef<string | null>(null);
  const notifyCategoryChange = useCallback((categoryName: string) => {
    programmaticCategoryChangeRef.current = categoryName.toLowerCase();
    onCategoryChange(categoryName);
  }, [onCategoryChange]);

  // Animation state machine
  const animStateRef = useRef<{
    mode: GalaxyMode;
    phase: GalaxyPhase;
    phaseTimer: number;
    dwellTimer: number;
    activeCategoryIndex: number;
    activeSkillIndex: number;
    camera: { x: number; y: number; zoom: number };
    targetCamera: { x: number; y: number; zoom: number };
    galaxyAngle: number;
    focusProgress: number; // 0 = full galaxy overview, 1 = category focused
    targetFocusProgress: number;
    userInteracting: boolean;
  }>({
    mode: 'loop1',
    phase: 'overview',
    phaseTimer: 0,
    dwellTimer: 0,
    activeCategoryIndex: 0,
    activeSkillIndex: 0,
    camera: { x: 0, y: 0, zoom: 0.62 },
    targetCamera: { x: 0, y: 0, zoom: 0.62 },
    galaxyAngle: 0,
    focusProgress: 0,
    targetFocusProgress: 0,
    userInteracting: false,
  });

  // Reconstruct Category Systems geometry dynamically
  useEffect(() => {
    const totalGroups = skillGroups.length;
    if (totalGroups === 0) return;

    // Distribute categories dynamically around the responsive galaxy ellipse.
    const systems: CategorySystem[] = skillGroups.map((group, groupIdx) => {
      const orbitRadius = groupIdx % 2 === 0 ? 0.82 : 1;
      const orbitSpeed = (groupIdx % 2 === 0 ? 0.00024 : -0.00022);
      const baseAngle = (Math.PI * 2 / totalGroups) * groupIdx;
      const themeColors = getCatTheme(group.name);

      const skills: SkillNode[] = group.skills.map((skillName) => {
        const meta = skillMetaMap.current.get(skillName.toLowerCase());
        return {
          name: skillName,
          category: group.name,
          orbitRadius: 0,
          orbitSpeed: 0.00042,
          baseAngle: 0,
          currentAngle: 0,
          x: 0,
          y: 0,
          radius: 10,
          iconDark: meta?.icon_dark,
          iconLight: meta?.icon_light,
        };
      });

      return {
        id: group.id,
        name: group.name,
        theme: themeColors,
        orbitRadius,
        orbitSpeed,
        baseAngle,
        currentAngle: baseAngle,
        x: 0,
        y: 0,
        hubRadius: 19,
        maxSkillRadius: 0,
        skills,
      };
    });

    systemsRef.current = systems;
    const canvas = canvasRef.current;
    if (canvas) {
      const bounds = getResponsiveOrbitBounds(systems, canvas.clientWidth, canvas.clientHeight);
      systems.forEach((system) => assignResponsiveSkillOrbits(system, bounds));
    }

    const foundIdx = systems.findIndex((s) => s.name.toLowerCase() === activeCategory.toLowerCase());
    if (foundIdx !== -1) {
      animStateRef.current.activeCategoryIndex = foundIdx;
    }
  }, [allSkills, skillGroups]);

  // Synchronize category change from external header dropdown
  useEffect(() => {
    const idx = systemsRef.current.findIndex(
      (s) => s.name.toLowerCase() === activeCategory.toLowerCase()
    );
    const categoryKey = activeCategory.toLowerCase();
    const categoryChanged = categoryKey !== lastExternalCategoryRef.current;
    const manualFocusRequested = categoryFocusRequest !== lastCategoryFocusRequestRef.current;
    lastExternalCategoryRef.current = categoryKey;
    lastCategoryFocusRequestRef.current = categoryFocusRequest;

    if (manualFocusRequested) {
      programmaticCategoryChangeRef.current = null;
    } else if (categoryChanged && programmaticCategoryChangeRef.current === categoryKey) {
      programmaticCategoryChangeRef.current = null;
      return;
    } else if (categoryChanged) {
      programmaticCategoryChangeRef.current = null;
    }

    if (idx !== -1 && (categoryChanged || manualFocusRequested)) {
      const state = animStateRef.current;
      state.mode = 'loop2';
      state.activeCategoryIndex = idx;
      const selectedIndex = systemsRef.current[idx].skills.findIndex(
        (skill) => skill.name.toLowerCase() === selectedSkill.toLowerCase()
      );
      state.activeSkillIndex = Math.max(0, selectedIndex);
      state.phase = 'travel';
      state.phaseTimer = 0;
      state.dwellTimer = 0;
      state.targetFocusProgress = 1;
    }
  }, [activeCategory, categoryFocusRequest, selectedSkill]);

  // Pointer drag & click tracking
  const pointerStateRef = useRef<{
    isDown: boolean;
    startX: number;
    startY: number;
    isInsideActiveArea: boolean;
    moved: boolean;
    pointerId: number | null;
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    isInsideActiveArea: false,
    moved: false,
    pointerId: null,
  });

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    let lastRenderTime = 0;
    let isVisible = false;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (now: number) => {
      animationFrameId = null;
      if (!isVisible) return;
      if (lastRenderTime && now - lastRenderTime < 1000 / 30) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      lastRenderTime = now;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const isLight = theme === 'light';
      const state = animStateRef.current;
      const systems = systemsRef.current;

      const bounds = getResponsiveOrbitBounds(systems, width, height);
      if (width !== orbitLayoutSizeRef.current.width || height !== orbitLayoutSizeRef.current.height) {
        systems.forEach((system) => assignResponsiveSkillOrbits(system, bounds));
        orbitLayoutSizeRef.current = { width, height };
      }
      const overviewZoom = 1;
      const focusedZoom = 1.08;

      // ==========================================
      // 1. UPDATE ORBITS & POSITIONS
      // ==========================================
      const rotSpeed = prefersReducedMotion ? 0 : 0.045;
      state.galaxyAngle += rotSpeed * dt;

      systems.forEach((sys, sysIdx) => {
        if (!prefersReducedMotion) {
          sys.currentAngle += sys.orbitSpeed * dt * 60;
        }
        const totalAngle = sys.currentAngle + state.galaxyAngle;
        sys.x = Math.cos(totalAngle) * bounds.categoryXRadius * sys.orbitRadius;
        sys.y = Math.sin(totalAngle) * bounds.categoryYRadius * sys.orbitRadius;

        // Expanded orbital layout in Category View
        const isCurrentCategory = sysIdx === state.activeCategoryIndex;
        const expansionFactor = isCurrentCategory
          ? 0.52 + state.focusProgress * 0.48
          : 0.52;

        sys.skills.forEach((skill) => {
          if (!prefersReducedMotion) {
            skill.currentAngle += skill.orbitSpeed * dt * 60;
          }
          const effRadius = skill.orbitRadius * expansionFactor;
          skill.x = sys.x + Math.cos(skill.currentAngle) * effRadius * bounds.xRadius / bounds.averageRadius;
          skill.y = sys.y + Math.sin(skill.currentAngle) * effRadius * bounds.yRadius / bounds.averageRadius;
        });
      });

      // ==========================================
      // 2. CONTINUOUS ANIMATION LOOP
      // ==========================================
      if (systems.length > 0) {
        state.phaseTimer += dt;

        if (state.phase === 'overview') {
          state.targetCamera = { x: 0, y: 0, zoom: overviewZoom };
          state.targetFocusProgress = 0;

          if (state.mode === 'loop3') {
            if (state.phaseTimer > 1.6 && !pointerStateRef.current.isDown) {
              state.activeCategoryIndex = (state.activeCategoryIndex + 1) % systems.length;
              state.phaseTimer = 0;
            }
          } else if (state.phaseTimer > 1.4 && !pointerStateRef.current.isDown) {
            state.phase = 'travel';
            state.phaseTimer = 0;
            state.targetFocusProgress = 1;
          }
        } else if (state.phase === 'travel') {
          const targetSys = systems[state.activeCategoryIndex] || systems[0];
          state.targetCamera = {
            x: targetSys.x,
            y: targetSys.y,
            zoom: focusedZoom,
          };
          state.targetFocusProgress = 1;

          if (state.phaseTimer > 1.3) {
            state.phase = 'explore';
            state.phaseTimer = 0;
            state.dwellTimer = 0;
            if (targetSys.name !== activeCategory) {
              notifyCategoryChange(targetSys.name);
            }
            if (state.mode === 'loop1' && targetSys.skills.length > 0) {
              state.activeSkillIndex = randomSkillIndex(targetSys.skills.length);
              onSelectSkill(targetSys.skills[state.activeSkillIndex].name, targetSys.name);
            }
          }
        } else if (state.phase === 'explore') {
          const targetSys = systems[state.activeCategoryIndex] || systems[0];
          state.targetCamera = {
            x: targetSys.x,
            y: targetSys.y,
            zoom: focusedZoom,
          };
          state.targetFocusProgress = 1;

          if (state.mode === 'loop1') {
            state.dwellTimer += dt;
            if (state.dwellTimer >= 3.4) {
              state.phase = 'zoomout';
              state.phaseTimer = 0;
              state.targetFocusProgress = 0;
            }
          } else if (state.mode === 'loop2' && !state.userInteracting && !pointerStateRef.current.isDown) {
            state.dwellTimer += dt;
            const skillDwellDuration = Math.max(1.5, Math.min(2.5, 0.5 + targetSys.skills.length * 0.12));
            if (state.dwellTimer >= skillDwellDuration) {
              const skillIndex = randomSkillIndex(targetSys.skills.length, state.activeSkillIndex);
              state.activeSkillIndex = skillIndex;
              if (skillIndex >= 0) onSelectSkill(targetSys.skills[skillIndex].name, targetSys.name);
              state.dwellTimer = 0;
            }
          }
        } else if (state.phase === 'zoomout') {
          state.targetCamera = { x: 0, y: 0, zoom: overviewZoom };
          state.targetFocusProgress = 0;

          if (state.phaseTimer > 1.25) {
            if (state.mode === 'loop2') {
              state.phase = 'explore';
              state.targetCamera = {
                x: systems[state.activeCategoryIndex]?.x || 0,
                y: systems[state.activeCategoryIndex]?.y || 0,
                zoom: focusedZoom,
              };
              state.targetFocusProgress = 1;
            } else {
              state.activeCategoryIndex = (state.activeCategoryIndex + 1) % systems.length;
              state.phase = state.mode === 'loop3' ? 'overview' : 'travel';
            }
            state.phaseTimer = 0;
            state.dwellTimer = 0;
          }
        }
      }

      // Smooth camera interpolation
      const lerpFactor = prefersReducedMotion ? 1 : 0.058;
      state.camera.x += (state.targetCamera.x - state.camera.x) * lerpFactor;
      state.camera.y += (state.targetCamera.y - state.camera.y) * lerpFactor;
      state.camera.zoom += (state.targetCamera.zoom - state.camera.zoom) * lerpFactor;
      state.focusProgress += (state.targetFocusProgress - state.focusProgress) * lerpFactor;

      // ==========================================
      // 3. BACKGROUND RENDERING
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 20,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      if (isLight) {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f1f5f9');
        bgGrad.addColorStop(1, '#e2e8f0');
      } else {
        bgGrad.addColorStop(0, '#0a1428');
        bgGrad.addColorStop(0.5, '#060c1a');
        bgGrad.addColorStop(1, '#03060f');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula dust in dark mode
      if (!isLight) {
        const nebulaGrad = ctx.createRadialGradient(
          width * 0.45, height * 0.45, 0,
          width * 0.45, height * 0.45, width * 0.48
        );
        nebulaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
        nebulaGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.03)');
        nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // ==========================================
      // 4. APPLY CAMERA MATRIX
      // ==========================================
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(state.camera.zoom, state.camera.zoom);
      ctx.translate(-state.camera.x, -state.camera.y);
      const categoryFocusAlpha = Math.max(0.08, 1 - state.focusProgress * 0.94);
      const systemAlphaFor = (isCurrentCategory: boolean) => {
        if (isCurrentCategory) return 1;
        if (state.mode === 'loop3') return 0.1;
        return categoryFocusAlpha;
      };

      // ==========================================
      // 5. DRAW GALAXY ORBIT BANDS
      // ==========================================
      ctx.lineWidth = 1;
      [0.82, 1].forEach((orbitScale) => {
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          bounds.categoryXRadius * orbitScale,
          bounds.categoryYRadius * orbitScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(135, 162, 255, 0.14)';
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Category Sub-orbits & Connectors with smooth alpha fading
      systems.forEach((sys, sysIdx) => {
        const isCurrentCategory = sysIdx === state.activeCategoryIndex;
        const sysAlpha = systemAlphaFor(isCurrentCategory);
        const expansionFactor = isCurrentCategory ? 0.52 + state.focusProgress * 0.48 : 0.52;

        ctx.save();
        ctx.globalAlpha = sysAlpha;

        // Connector line from CORE SKILL to Category Hub
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sys.x, sys.y);
        ctx.strokeStyle = isCurrentCategory
          ? (isLight ? 'rgba(2, 132, 199, 0.35)' : sys.theme.glow)
          : (isLight ? 'rgba(203, 213, 225, 0.4)' : 'rgba(135, 162, 255, 0.07)');
        ctx.lineWidth = isCurrentCategory ? 1.4 : 1;
        ctx.stroke();

        // Sub-orbit rings around Category Hub (expanded dynamically)
        const skillRadii = Array.from(new Set(sys.skills.map((s) => s.orbitRadius)));
        skillRadii.forEach((baseR) => {
          const r = baseR * expansionFactor;
          ctx.beginPath();
          ctx.ellipse(
            sys.x,
            sys.y,
            r * bounds.xRadius / bounds.averageRadius,
            r * bounds.yRadius / bounds.averageRadius,
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = isCurrentCategory
            ? (isLight ? 'rgba(2, 132, 199, 0.28)' : 'rgba(90, 215, 255, 0.24)')
            : (isLight ? 'rgba(203, 213, 225, 0.25)' : 'rgba(135, 162, 255, 0.08)');
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        ctx.restore();
      });

      // ==========================================
      // 6. DRAW CENTRAL CORE SKILL HUB
      // ==========================================
      const coreAlpha = state.mode === 'loop3'
        ? 0.28
        : 1 - state.focusProgress * 0.78;
      ctx.save();
      ctx.globalAlpha = coreAlpha;
      const pulse = Math.sin(now * 0.003) * 2.5;
      const coreR = 36 + pulse;

      // Glowing aura
      const coreGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, coreR * 2);
      coreGlow.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.4)');
      coreGlow.addColorStop(0.6, isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(56, 189, 248, 0.1)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, coreR + 5, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.55)' : 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Core disc
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#ffffff' : '#08172c';
      ctx.fill();
      ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Central Hub Label: "CORE SKILL"
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE SKILL', 0, -4);

      ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
      ctx.font = '7.5px "Space Grotesk", sans-serif';
      ctx.fillText('CAPABILITIES', 0, 7);
      ctx.restore();

      // ==========================================
      // 7. DRAW CATEGORY HUBS & SKILLS
      // Stacking order:
      // - Draw all category hubs and background elements
      // - Draw all unselected skills
      // - Draw THE ACTIVE/SELECTED SKILL LAST so it is ALWAYS on top!
      // ==========================================
      let activeSelectedSkillData: {
        skill: SkillNode;
        sys: CategorySystem;
        isCurrentCategory: boolean;
      } | null = null;

      systems.forEach((sys, sysIdx) => {
        const isCurrentCategory = sysIdx === state.activeCategoryIndex;
        const sysAlpha = systemAlphaFor(isCurrentCategory);

        ctx.save();
        ctx.globalAlpha = sysAlpha;

        // --- Category Hub ---
        const hubR = sys.hubRadius;

        if (isCurrentCategory) {
          const hubGlow = ctx.createRadialGradient(sys.x, sys.y, hubR * 0.4, sys.x, sys.y, hubR * 2.2);
          hubGlow.addColorStop(0, sys.theme.glow);
          hubGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = hubGlow;
          ctx.beginPath();
          ctx.arc(sys.x, sys.y, hubR * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hub Disc
        ctx.beginPath();
        ctx.arc(sys.x, sys.y, hubR, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? sys.theme.hubBgLight : sys.theme.hubBgDark;
        ctx.fill();
        ctx.lineWidth = isCurrentCategory ? 2.4 : 1.2;
        ctx.strokeStyle = sys.theme.primary;
        ctx.stroke();

        // Hub Initials
        ctx.fillStyle = isLight ? sys.theme.secondary : sys.theme.primary;
        ctx.font = 'bold 9.5px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = sys.name
          .split(/[\s&]+/)
          .map((w) => w[0])
          .slice(0, 3)
          .join('');
        ctx.fillText(initials, sys.x, sys.y - 1);

        // Category Hub Label Pill
        // When in Category Focus: Centered clearly ABOVE the hub with prominent badge
        // When in Overview: Centered below the hub
        const hubLabel = sys.name.toUpperCase();
        const inCategoryFocus = isCurrentCategory && state.focusProgress > 0.3 && state.mode !== 'loop3';

        ctx.font = inCategoryFocus ? 'bold 9px "Space Grotesk", sans-serif' : 'bold 8px "Space Grotesk", sans-serif';
        const labelWidth = ctx.measureText(hubLabel).width + (inCategoryFocus ? 16 : 10);
        const pillY = inCategoryFocus
          ? sys.y - hubR - 22
          : sys.y + hubR + 8;

        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(8, 14, 28, 0.94)';
        ctx.beginPath();
        ctx.roundRect(sys.x - labelWidth / 2, pillY - (inCategoryFocus ? 8 : 6), labelWidth, inCategoryFocus ? 16 : 12, inCategoryFocus ? 8 : 6);
        ctx.fill();
        ctx.strokeStyle = isCurrentCategory ? sys.theme.primary : (isLight ? '#cbd5e1' : 'rgba(135, 162, 255, 0.2)');
        ctx.lineWidth = inCategoryFocus ? 1.4 : 1;
        ctx.stroke();

        ctx.fillStyle = isLight ? '#0f172a' : (isCurrentCategory ? '#ffffff' : '#cbd5e1');
        ctx.fillText(hubLabel, sys.x, pillY);

        // --- Individual Skills orbiting this Hub ---
        sys.skills.forEach((skill) => {
          const isLoop1ActiveSkill = state.mode === 'loop1'
            && state.phase === 'explore'
            && isCurrentCategory
            && sys.skills[state.activeSkillIndex]?.name.toLowerCase() === skill.name.toLowerCase();
          const isLoop2SelectedSkill = state.mode === 'loop2'
            && selectedSkill.toLowerCase() === skill.name.toLowerCase();
          const isSkillSelected = isLoop1ActiveSkill || isLoop2SelectedSkill;

          // If this skill is currently selected/highlighted, defer drawing to top pass!
          if (isSkillSelected) {
            activeSelectedSkillData = { skill, sys, isCurrentCategory };
            return;
          }

          // Unselected skill node
          const nodeR = 11;

          // Node body circle
          ctx.beginPath();
          ctx.arc(skill.x, skill.y, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#ffffff' : '#0b162c';
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = sys.theme.primary;
          ctx.stroke();

          // Render CMS Skill Logo
          const iconUrl = isLight
            ? (skill.iconLight || skill.iconDark)
            : (skill.iconDark || skill.iconLight);

          if (iconUrl) {
            let img = imageCacheRef.current.get(iconUrl);
            if (!img) {
              img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = iconUrl;
              imageCacheRef.current.set(iconUrl, img);
            }
            if (img.complete && img.naturalWidth > 0) {
              const iconSize = 12;
              ctx.drawImage(img, skill.x - iconSize / 2, skill.y - iconSize / 2, iconSize, iconSize);
            } else {
              ctx.beginPath();
              ctx.arc(skill.x, skill.y, 2, 0, Math.PI * 2);
              ctx.fillStyle = sys.theme.primary;
              ctx.fill();
            }
          } else {
            ctx.beginPath();
            ctx.arc(skill.x, skill.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = sys.theme.primary;
            ctx.fill();
          }

          // Dynamic Label Visibility for unselected skills:
          // In Galaxy Overview: Hide ALL skill labels.
          // In Focused Category: Show skill labels for active category ONLY with smooth fade-in.
          if (isCurrentCategory && state.focusProgress > 0.05 && state.mode !== 'loop3') {
            ctx.save();
            ctx.globalAlpha = state.focusProgress * sysAlpha;

            ctx.font = '7.8px "Space Grotesk", sans-serif';
            const lines = wrapSkillLabel(ctx, skill.name, bounds.labelWidth);
            const lineWidths = lines.map((line) => ctx.measureText(line).width);
            const pillH = lines.length * 9 + 4;
            const pillW = Math.max(...lineWidths) + 10;
            const directionLength = Math.hypot(skill.x - sys.x, skill.y - sys.y) || 1;
            const directionX = (skill.x - sys.x) / directionLength;
            const directionY = (skill.y - sys.y) / directionLength;
            const labelOffset = nodeR + Math.abs(directionX) * pillW / 2
              + Math.abs(directionY) * pillH / 2 + 5;
            const labelX = skill.x + directionX * labelOffset;
            const labelY = skill.y + directionY * labelOffset;
            const visibleWorldLeft = state.camera.x - width / (2 * state.camera.zoom);
            const visibleWorldRight = state.camera.x + width / (2 * state.camera.zoom);
            const visibleWorldTop = state.camera.y - height / (2 * state.camera.zoom);
            const visibleWorldBottom = state.camera.y + height / (2 * state.camera.zoom);
            const pillOffsetX = Math.max(
              visibleWorldLeft + pillW / 2 + 5,
              Math.min(visibleWorldRight - pillW / 2 - 5, labelX)
            );
            const pillOffsetY = Math.max(
              visibleWorldTop + pillH / 2 + 5,
              Math.min(visibleWorldBottom - pillH / 2 - 5, labelY)
            );

            ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(8, 14, 28, 0.92)';
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = isLight ? '#cbd5e1' : 'rgba(135, 162, 255, 0.22)';
            ctx.beginPath();
            ctx.roundRect(pillOffsetX - pillW / 2, pillOffsetY - pillH / 2, pillW, pillH, 5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? '#0f172a' : '#e2e8f0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            lines.forEach((line, lineIndex) => {
              ctx.fillText(line, pillOffsetX, pillOffsetY + (lineIndex - (lines.length - 1) / 2) * 9);
            });

            ctx.restore();
          }
        });

        ctx.restore();
      });

      // ==========================================
      // 8. DRAW ACTIVE/SELECTED SKILL ON TOP OF EVERYTHING (Z-INDEX PRIORITY)
      // ==========================================
      const active = activeSelectedSkillData as { skill: SkillNode; sys: CategorySystem; isCurrentCategory: boolean } | null;
      if (active) {
        const { skill, sys, isCurrentCategory } = active;
        ctx.save();
        ctx.globalAlpha = 1.0; // Always full brightness

        const nodeR = 14;

        // Outer pulsing beacon rings
        const beaconR = nodeR + 10 + Math.sin(now * 0.006) * 3;
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, beaconR, 0, Math.PI * 2);
        ctx.strokeStyle = sys.theme.primary;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Glowing radial aura
        const selGlow = ctx.createRadialGradient(skill.x, skill.y, 2, skill.x, skill.y, 22);
        selGlow.addColorStop(0, sys.theme.glow);
        selGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = selGlow;
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Node body disc
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#ffffff' : sys.theme.hubBgDark;
        ctx.fill();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = sys.theme.primary;
        ctx.stroke();

        // CMS Skill Logo
        const iconUrl = isLight
          ? (skill.iconLight || skill.iconDark)
          : (skill.iconDark || skill.iconLight);

        if (iconUrl) {
          let img = imageCacheRef.current.get(iconUrl);
          if (!img) {
            img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = iconUrl;
            imageCacheRef.current.set(iconUrl, img);
          }
          if (img.complete && img.naturalWidth > 0) {
            const iconSize = 17;
            ctx.drawImage(img, skill.x - iconSize / 2, skill.y - iconSize / 2, iconSize, iconSize);
          } else {
            ctx.beginPath();
            ctx.arc(skill.x, skill.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = sys.theme.primary;
            ctx.fill();
          }
        } else {
          ctx.beginPath();
          ctx.arc(skill.x, skill.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = sys.theme.primary;
          ctx.fill();
        }

        // Active Skill Label Pill - Guaranteed on top of all other nodes & labels
        if (isCurrentCategory && state.focusProgress > 0.05 && state.mode !== 'loop3') {
          ctx.font = 'bold 8.5px "Space Grotesk", sans-serif';
          const lines = wrapSkillLabel(ctx, skill.name, bounds.labelWidth);
          const lineWidths = lines.map((line) => ctx.measureText(line).width);
          const pillH = lines.length * 10 + 4;
          const pillW = Math.max(...lineWidths) + 12;
          const directionLength = Math.hypot(skill.x - sys.x, skill.y - sys.y) || 1;
          const directionX = (skill.x - sys.x) / directionLength;
          const directionY = (skill.y - sys.y) / directionLength;
          const labelOffset = nodeR + Math.abs(directionX) * pillW / 2
            + Math.abs(directionY) * pillH / 2 + 6;
          const labelX = skill.x + directionX * labelOffset;
          const labelY = skill.y + directionY * labelOffset;
          const visibleWorldLeft = state.camera.x - width / (2 * state.camera.zoom);
          const visibleWorldRight = state.camera.x + width / (2 * state.camera.zoom);
          const visibleWorldTop = state.camera.y - height / (2 * state.camera.zoom);
          const visibleWorldBottom = state.camera.y + height / (2 * state.camera.zoom);
          const pillOffsetX = Math.max(
            visibleWorldLeft + pillW / 2 + 5,
            Math.min(visibleWorldRight - pillW / 2 - 5, labelX)
          );
          const pillOffsetY = Math.max(
            visibleWorldTop + pillH / 2 + 5,
            Math.min(visibleWorldBottom - pillH / 2 - 5, labelY)
          );

          ctx.fillStyle = isLight ? '#0284c7' : '#082f49';
          ctx.beginPath();
          ctx.roundRect(pillOffsetX - pillW / 2, pillOffsetY - pillH / 2, pillW, pillH, 5);
          ctx.fill();

          ctx.lineWidth = 1.6;
          ctx.strokeStyle = sys.theme.primary;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          lines.forEach((line, lineIndex) => {
            ctx.fillText(line, pillOffsetX, pillOffsetY + (lineIndex - (lines.length - 1) / 2) * 10);
          });
        }

        ctx.restore();
      }

      ctx.restore(); // restore camera transform
      ctx.restore(); // restore dpr

      if (isVisible && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const scheduleRender = () => {
      if (isVisible && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    renderRequestRef.current = scheduleRender;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.75;
      if (isVisible) {
        lastTime = performance.now();
        lastRenderTime = 0;
        scheduleRender();
      } else if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: [0, 0.75] });
    if (containerRef.current) observer.observe(containerRef.current);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      if (isVisible) {
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTime = performance.now();
        lastRenderTime = 0;
        scheduleRender();
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      renderRequestRef.current = () => {};
    };
  }, [theme, selectedSkill, activeCategory, notifyCategoryChange, onSelectSkill]);

  const getCanvasCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const state = animStateRef.current;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    const worldX = (dx / state.camera.zoom) + state.camera.x;
    const worldY = (dy / state.camera.zoom) + state.camera.y;

    return { x: worldX, y: worldY };
  }, []);

  const enterLoop1 = (advanceCategory = false) => {
    const state = animStateRef.current;
    const systems = systemsRef.current;
    state.mode = 'loop1';
    if (advanceCategory && systems.length > 0) {
      state.activeCategoryIndex = (state.activeCategoryIndex + 1) % systems.length;
    }
    state.phase = 'overview';
    state.phaseTimer = 0;
    state.dwellTimer = 0;
    state.userInteracting = false;
    state.targetCamera = { x: 0, y: 0, zoom: 1 };
    state.targetFocusProgress = 0;
    renderRequestRef.current();
  };

  const enterLoop2 = (categoryIndex: number, skillIndex?: number, animateTravel = true) => {
    const systems = systemsRef.current;
    const system = systems[categoryIndex];
    if (!system) return;
    const state = animStateRef.current;
    state.mode = 'loop2';
    state.activeCategoryIndex = categoryIndex;
    if (system.name.toLowerCase() !== activeCategory.toLowerCase()) {
      notifyCategoryChange(system.name);
    }
    if (skillIndex !== undefined && skillIndex >= 0) {
      state.activeSkillIndex = skillIndex;
      onSelectSkill(system.skills[skillIndex].name, system.name);
    } else if (system.skills.length > 0) {
      const selectedIndex = system.skills.findIndex(
        (skill) => skill.name.toLowerCase() === selectedSkill.toLowerCase()
      );
      state.activeSkillIndex = selectedIndex >= 0 ? selectedIndex : 0;
      if (selectedIndex < 0) onSelectSkill(system.skills[0].name, system.name);
    } else {
      state.activeSkillIndex = -1;
    }
    state.phase = animateTravel ? 'travel' : 'explore';
    state.phaseTimer = 0;
    state.dwellTimer = 0;
    state.userInteracting = false;
    state.targetFocusProgress = 1;
    renderRequestRef.current();
  };

  const skillAtPosition = (system: CategorySystem, x: number, y: number) =>
    system.skills.findIndex((skill) => Math.hypot(x - skill.x, y - skill.y) <= skill.radius + 6);

  const categoryAtPosition = (system: CategorySystem, x: number, y: number) => {
    const labelWidth = system.name.length * 5.4 + 18;
    return Math.hypot(x - system.x, y - system.y) <= system.hubRadius + 12
      || (Math.abs(x - system.x) <= labelWidth / 2
        && Math.abs(y - system.y) <= system.hubRadius + 25);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const state = animStateRef.current;
    pointerStateRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      isInsideActiveArea: state.mode === 'loop2',
      moved: false,
      pointerId: e.pointerId,
    };

    state.userInteracting = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pState = pointerStateRef.current;
    const { x: worldX, y: worldY } = getCanvasCoords(e);
    const systems = systemsRef.current;
    const state = animStateRef.current;
    const activeSys = systems[state.activeCategoryIndex];
    const rect = e.currentTarget.getBoundingClientRect();
    const insideCanvas = e.clientX >= rect.left && e.clientX <= rect.right
      && e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (pState.isDown) {
      const dist = Math.hypot(e.clientX - pState.startX, e.clientY - pState.startY);
      if (dist > 6) {
        pState.moved = true;
        state.userInteracting = true;
        state.dwellTimer = 0;

        if (!insideCanvas) {
          enterLoop1(true);
          pState.isDown = false;
        } else if (state.mode !== 'loop2') {
          enterLoop2(state.activeCategoryIndex);
          pState.isInsideActiveArea = true;
        } else if (pState.isInsideActiveArea && activeSys) {
          if (state.phase === 'explore') {
            const skillIndex = skillAtPosition(activeSys, worldX, worldY);
            if (skillIndex >= 0 && skillIndex !== state.activeSkillIndex) {
              state.activeSkillIndex = skillIndex;
              state.dwellTimer = 0;
              onSelectSkill(activeSys.skills[skillIndex].name, activeSys.name);
              renderRequestRef.current();
            }
          }
        } else {
          enterLoop1(true);
          pState.isDown = false;
        }
      }
    } else if (state.mode === 'loop2' && state.phase === 'explore' && activeSys) {
      const skillIndex = skillAtPosition(activeSys, worldX, worldY);
      if (skillIndex >= 0 && skillIndex !== state.activeSkillIndex) {
        state.dwellTimer = 0;
        state.activeSkillIndex = skillIndex;
        onSelectSkill(activeSys.skills[skillIndex].name, activeSys.name);
        renderRequestRef.current();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointerState = pointerStateRef.current;
    const state = animStateRef.current;
    const wasMoved = pointerState.moved;
    pointerState.isDown = false;
    pointerState.pointerId = null;
    state.userInteracting = false;

    if (wasMoved) {
      if (state.mode === 'loop2') state.dwellTimer = 0;
      return;
    }

    const { x: worldX, y: worldY } = getCanvasCoords(e);
    const systems = systemsRef.current;

    for (let systemIndex = 0; systemIndex < systems.length; systemIndex += 1) {
      const system = systems[systemIndex];
      const skillIndex = skillAtPosition(system, worldX, worldY);
      if (skillIndex >= 0) {
        enterLoop2(systemIndex, skillIndex);
        return;
      }
    }

    for (let systemIndex = 0; systemIndex < systems.length; systemIndex += 1) {
      if (categoryAtPosition(systems[systemIndex], worldX, worldY)) {
        enterLoop2(systemIndex, 0);
        return;
      }
    }

    enterLoop1();
    state.mode = 'loop3';
    state.phase = 'overview';
    state.phaseTimer = 0;
    state.dwellTimer = 0;
    state.targetCamera = { x: 0, y: 0, zoom: 1 };
    state.targetFocusProgress = 0;
    renderRequestRef.current();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointerState = pointerStateRef.current;
    if (pointerState.pointerId === e.pointerId) {
      pointerState.isDown = false;
      pointerState.pointerId = null;
      pointerState.moved = true;
      animStateRef.current.userInteracting = false;
    }
  };

  const handlePointerLeave = () => {
    const pointerState = pointerStateRef.current;
    if (pointerState.isDown) return;
    const state = animStateRef.current;
    if (state.mode === 'loop2' || state.mode === 'loop3') {
      enterLoop1(true);
    } else {
      enterLoop1();
    }
  };

  return (
    <div
      ref={containerRef}
      className="skill-galaxy-viewport"
      onPointerLeave={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: pointerStateRef.current.isDown ? 'grabbing' : 'default',
        }}
      />
    </div>
  );
};
