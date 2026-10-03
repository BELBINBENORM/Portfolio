import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Workflow,
  Network,
  Sparkles,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  FileText,
  GitBranch,
  Cpu,
  Brain,
  Terminal,
  Code2,
  Database,
  Menu,
  X,
  Mail,
} from 'lucide-react';
import { heroes, type SkillGroup, externalLinks } from '../data';

export interface ProjectCategoryOption {
  id: string;
  label: string;
  count: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  
  // Projects as Systems
  featuredSystemsCount: number;

  // Skills as a Network
  activeSkillGroupId: string;
  onSelectSkillGroup: (groupId: string) => void;
  skillGroups: SkillGroup[];
  skillsCount: number;

  // Project Constellation
  selectedProjectCategory: string;
  activeCategoryHighlight?: string;
  onSelectProjectCategory: (category: string) => void;
  projectCategories: ProjectCategoryOption[];
  totalConstellationProjects: number;

  // Certifications
  certificationsCount: number;

  // Theme
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;

  // Mobile drawer support
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onNavigateSection,
  featuredSystemsCount,
  activeSkillGroupId,
  onSelectSkillGroup,
  skillGroups,
  skillsCount,
  selectedProjectCategory,
  activeCategoryHighlight = '',
  onSelectProjectCategory,
  projectCategories,
  totalConstellationProjects,
  certificationsCount,
  theme,
  onSelectTheme,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [themeNotice, setThemeNotice] = useState('');
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const roleNavigationFrameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (roleNavigationFrameRef.current !== null) {
      cancelAnimationFrame(roleNavigationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!themeNotice) return;
    const timeoutId = window.setTimeout(() => setThemeNotice(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [themeNotice]);

  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const activePersona = heroes.find(
    (h) => (h.slug.replace(/\/+$/, '') || '/') === currentPath,
  ) || heroes[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const githubLink = externalLinks.find((item) => item.title === 'GitHub')?.url ?? 'https://github.com/BELBINBENORM';
  const kaggleLink = externalLinks.find((item) => item.title === 'Kaggle')?.url ?? 'https://www.kaggle.com/belbino';
  const resumeHref = '/resume/BELBIN RESUME - AIML.pdf';

  const getRoleIcon = (slug: string) => {
    switch (slug) {
      case '/data-scientist':
        return <Brain size={15} />;
      case '/ai-ml-engineer':
        return <Cpu size={15} />;
      case '/ai-engineer':
        return <Terminal size={15} />;
      case '/python-developer':
        return <Code2 size={15} />;
      default:
        return <Database size={15} />;
    }
  };

  // Section active checks
  const isWorkActive = activeSection === 'work';
  const isSkillsActive = activeSection === 'skills';
  const isConstellationActive = activeSection === 'constellation';
  const isCertsActive = activeSection === 'certifications';
  const isContactActive = activeSection === 'contact';

  const handleNavClick = (sectionId: string) => {
    onNavigateSection(sectionId);
    onCloseMobile();
  };

  const handleCycleTheme = () => {
    const nextTheme: ThemeMode = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    onSelectTheme(nextTheme);
    setThemeNotice('');
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`portfolio-sidebar ${isCollapsed ? 'is-collapsed' : 'is-expanded'} ${isMobileOpen ? 'mobile-drawer-open' : ''}`}
        aria-label="Portfolio Navigation & Controls"
      >
        {/* =========================================================================
            COLLAPSED STATE: NARROW ICON BAR (Always visible on desktop, ~64px)
        ========================================================================= */}
        {isCollapsed && (
          <div className="sidebar-collapsed-content" aria-label="Compact navigation">
            <div className="collapsed-top">
              <button
                type="button"
                className="collapsed-icon-btn expand-toggle-btn"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={17} />
              </button>
              
              <button
                type="button"
                className="collapsed-role-icon"
                onClick={() => {
                  setIsRoleDropdownOpen(true);
                  onToggleCollapse();
                }}
                title={`Switch role: ${activePersona.role} (${activePersona.kicker})`}
                aria-label={activePersona.role}
                aria-haspopup="listbox"
                aria-expanded={false}
              >
                {getRoleIcon(activePersona.slug)}
              </button>
            </div>

            <nav className="collapsed-nav-icons" aria-label="Section Icons">
              {/* 1. PROJECTS AS SYSTEMS */}
              <button
                type="button"
                className={`collapsed-nav-btn ${isWorkActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick('work')}
                title="PROJECTS AS SYSTEMS (6 Featured Systems)"
                aria-label="PROJECTS AS SYSTEMS"
              >
                <Workflow size={17} />
                <span className="collapsed-dot" />
              </button>

              {/* 2. SKILLS AS A NETWORK */}
              <button
                type="button"
                className={`collapsed-nav-btn ${isSkillsActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick('skills')}
                title={`SKILLS AS A NETWORK (${skillsCount} Skills)`}
                aria-label={`SKILLS AS A NETWORK, ${skillsCount} skills`}
              >
                <Network size={17} />
                <span className="collapsed-dot" />
              </button>

              {/* 3. PROJECT CONSTELLATION */}
              <button
                type="button"
                className={`collapsed-nav-btn ${isConstellationActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick('constellation')}
                title={`PROJECT CONSTELLATION (${totalConstellationProjects} Projects)`}
                aria-label="PROJECT CONSTELLATION"
              >
                <Sparkles size={17} />
                <span className="collapsed-dot" />
              </button>

              {/* 4. CERTIFICATIONS */}
              <button
                type="button"
                className={`collapsed-nav-btn ${isCertsActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick('certifications')}
                title={`CERTIFICATIONS (${certificationsCount} Verified)`}
                aria-label="CERTIFICATIONS"
              >
                <Award size={17} />
                <span className="collapsed-dot" />
              </button>

              {/* 5. CONTACT */}
              <button
                type="button"
                className={`collapsed-nav-btn ${isContactActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick('contact')}
                title="CONTACT (Get In Touch)"
                aria-label="CONTACT"
              >
                <Mail size={17} />
                <span className="collapsed-dot" />
              </button>
            </nav>

            <div className="collapsed-footer">
              <button
                type="button"
                className="collapsed-icon-btn"
                onClick={handleCycleTheme}
                title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Sun size={15} /> : theme === 'dark' ? <Moon size={15} /> : <Laptop size={15} />}
              </button>

              <a
                href={resumeHref}
                download="BELBIN RESUME - AIML.pdf"
                className="collapsed-icon-btn resume-icon"
                title="Download Resume (PDF)"
                aria-label="Download Resume"
              >
                <FileText size={15} />
              </a>

              <a
                href={githubLink}
                target="_blank"
                rel="noreferrer"
                className="collapsed-icon-btn"
                title="GitHub"
                aria-label="GitHub"
              >
                <GitBranch size={15} />
              </a>
            </div>
          </div>
        )}

        {/* =========================================================================
            EXPANDED STATE: FULL LABELS & SECTION NAVIGATION
        ========================================================================= */}
        {!isCollapsed && (
          <div className="sidebar-expanded-content">
            {/* Header: Persona Role Selector & Collapse Toggle */}
            <div className="sidebar-top-lockup">
              <div className="sidebar-brand-block">
                <span className="sidebar-brand-name">BELBIN BENO R M</span>
                <span className="sidebar-role-tag">{activePersona.role}</span>
              </div>

              <div className="sidebar-header-btns">
                <button
                  type="button"
                  className="sidebar-toggle-btn"
                  onClick={() => {
                    if (isMobileOpen) {
                      onCloseMobile();
                    } else {
                      onToggleCollapse();
                    }
                  }}
                  aria-label={isMobileOpen ? 'Close navigation drawer' : 'Collapse sidebar'}
                  title={isMobileOpen ? 'Close navigation drawer' : 'Collapse sidebar'}
                >
                  {isMobileOpen ? <X size={17} /> : <PanelLeftClose size={16} />}
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="sidebar-body">
              {/* Persona Switcher Dropdown */}
              <div className="sidebar-role-picker" ref={roleDropdownRef}>
                <button
                  type="button"
                  className={`sidebar-role-btn ${isRoleDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                  aria-expanded={isRoleDropdownOpen}
                  aria-haspopup="listbox"
                  title="Switch Engineering Persona"
                >
                  <span className="role-btn-icon">{getRoleIcon(activePersona.slug)}</span>
                  <div className="role-btn-text">
                    <span className="role-btn-title">{activePersona.role}</span>
                    <span className="role-btn-kicker">{activePersona.kicker}</span>
                  </div>
                  <ChevronDown size={13} className={`role-chevron ${isRoleDropdownOpen ? 'is-rotated' : ''}`} />
                </button>

                {isRoleDropdownOpen && (
                  <div className="sidebar-role-menu" role="listbox">
                    {heroes.map((persona) => {
                      const isSelected = (persona.slug.replace(/\/+$/, '') || '/') === currentPath;
                      return (
                        <NavLink
                          key={persona.slug}
                          to={persona.slug}
                          end={persona.slug === '/'}
                          role="option"
                          aria-selected={isSelected}
                          className={`sidebar-role-menu-item ${isSelected ? 'is-active' : ''}`}
                          onClick={() => {
                            setIsRoleDropdownOpen(false);
                            onCloseMobile();
                            const heroEl = document.getElementById('top');
                            if (heroEl) {
                              if (roleNavigationFrameRef.current !== null) {
                                cancelAnimationFrame(roleNavigationFrameRef.current);
                              }
                              roleNavigationFrameRef.current = requestAnimationFrame(() => {
                                roleNavigationFrameRef.current = null;
                                heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              });
                            } else {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                        >
                          <span className="menu-item-icon">{getRoleIcon(persona.slug)}</span>
                          <div className="menu-item-text">
                            <span className="menu-item-role">{persona.role}</span>
                            <span className="menu-item-kicker">{persona.kicker}</span>
                          </div>
                          {isSelected && <Check size={13} className="menu-item-check" />}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* NAVIGATION SECTIONS IN EXACT REQUIRED ORDER */}
              <nav className="sidebar-nav-container" aria-label="Portfolio Sections Navigation">
                <span className="sidebar-group-title">NAVIGATION &amp; CONTROLS</span>

                <div className="sidebar-nested-nav">
                  {/* 1. PROJECTS AS SYSTEMS */}
                  <div className={`nav-section-item ${isWorkActive ? 'is-current-section' : ''}`}>
                    <button
                      type="button"
                      className={`nav-section-header-btn ${isWorkActive ? 'is-active' : ''}`}
                      onClick={() => handleNavClick('work')}
                    >
                      <Workflow size={15} className="nav-icon" />
                      <span className="nav-label">PROJECTS AS SYSTEMS</span>
                      <span className="nav-badge" title="Featured Systems">{featuredSystemsCount}</span>
                    </button>
                  </div>

                  {/* 2. SKILLS AS A NETWORK */}
                  <div className={`nav-section-item ${isSkillsActive ? 'is-current-section' : ''}`}>
                    <button
                      type="button"
                      className={`nav-section-header-btn ${isSkillsActive ? 'is-active' : ''}`}
                      onClick={() => handleNavClick('skills')}
                    >
                      <Network size={15} className="nav-icon" />
                      <span className="nav-label">SKILLS AS A NETWORK</span>
                      <span className="nav-badge" title="Total Skills">{skillsCount}</span>
                    </button>
                  </div>

                  {/* 3. PROJECT CONSTELLATION */}
                  <div className={`nav-section-item ${isConstellationActive ? 'is-current-section' : ''}`}>
                    <button
                      type="button"
                      className={`nav-section-header-btn ${isConstellationActive ? 'is-active' : ''}`}
                      onClick={() => handleNavClick('constellation')}
                    >
                      <Sparkles size={15} className="nav-icon" />
                      <span className="nav-label">PROJECT CONSTELLATION</span>
                      <span className="nav-badge" title="All Projects">{totalConstellationProjects}</span>
                    </button>
                  </div>

                  {/* 4. CERTIFICATIONS */}
                  <div className={`nav-section-item ${isCertsActive ? 'is-current-section' : ''}`}>
                    <button
                      type="button"
                      className={`nav-section-header-btn ${isCertsActive ? 'is-active' : ''}`}
                      onClick={() => handleNavClick('certifications')}
                    >
                      <Award size={15} className="nav-icon" />
                      <span className="nav-label">CERTIFICATIONS</span>
                      <span className="nav-badge" title="Verified Credentials">{certificationsCount}</span>
                    </button>
                  </div>

                  {/* 5. CONTACT */}
                  <div className={`nav-section-item ${isContactActive ? 'is-current-section' : ''}`}>
                    <button
                      type="button"
                      className={`nav-section-header-btn ${isContactActive ? 'is-active' : ''}`}
                      onClick={() => handleNavClick('contact')}
                    >
                      <Mail size={15} className="nav-icon" />
                      <span className="nav-label">CONTACT</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              {/* Theme Switcher */}
              <div className="sidebar-theme-row">
                <span className="sidebar-group-title">THEME</span>
                <div className="theme-toggle-box" role="group" aria-label="Theme mode selector">
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'system' ? 'is-active' : ''}`}
                    onClick={() => { onSelectTheme('system'); setThemeNotice(''); }}
                    title="System theme"
                    aria-label="Switch to System theme"
                  >
                    <Laptop size={13} />
                    <span>System</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'light' ? 'is-active' : ''}`}
                    onClick={() => { onSelectTheme('light'); setThemeNotice(''); }}
                    title="Light theme"
                    aria-label="Switch to Light theme"
                  >
                    <Sun size={13} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
                    onClick={() => { onSelectTheme('dark'); setThemeNotice(''); }}
                    title="Dark theme"
                    aria-label="Switch to Dark theme"
                  >
                    <Moon size={13} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Actions & Links */}
              <div className="sidebar-actions-strip">
                <a
                  href={resumeHref}
                  download="BELBIN RESUME - AIML.pdf"
                  className="sidebar-resume-btn"
                  title="Direct PDF Download"
                >
                  <FileText size={13} />
                  <span>Resume ↓</span>
                </a>
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-icon-btn"
                  title="GitHub Profile"
                  aria-label="GitHub Profile"
                >
                  <GitBranch size={14} />
                </a>
                <a
                  href={kaggleLink}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-icon-btn"
                  title="Kaggle Profile"
                  aria-label="Kaggle Profile"
                >
                  <Cpu size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </aside>
      {themeNotice && createPortal(
        <div className="theme-development-notice" role="status" aria-live="polite">
          {themeNotice}
        </div>,
        document.body,
      )}
    </>
  );
};
