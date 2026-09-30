import { useMemo, useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  Database,
  Server,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from 'lucide-react';
import type { PortfolioRow } from '../data';

export type ArchitectureFlowNode = {
  id: string;
  label: string;
  type?: string;
  description?: string;
  metadata?: string;
  category?: string;
  icon?: string;
};

export type ArchitectureFlowData = {
  nodes: ArchitectureFlowNode[];
  connections: [string, string][];
};

export interface ArchitectureFlowProps {
  project: PortfolioRow;
  variant?: 'systems' | 'project' | 'hero';
  className?: string;
  interactive?: boolean;
  showRoadmap?: boolean;
  showDescription?: boolean;
  activeNodeIndex?: number;
  onSelectNode?: (nodeId: string, index: number) => void;
}

export const parseRoadmapItems = (roadmapRaw?: string | string[]): string[] => {
  if (!roadmapRaw) return [];
  if (Array.isArray(roadmapRaw)) {
    return roadmapRaw
      .map((item) => (typeof item === 'string' ? item : (item as any)?.title || (item as any)?.name || JSON.stringify(item)))
      .filter(Boolean);
  }
  if (typeof roadmapRaw === 'string') {
    const trimmed = roadmapRaw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item : item?.title || item?.name || JSON.stringify(item)))
          .filter(Boolean);
      }
    } catch {
      // Split on newlines, semicolons, or bullets
      return trimmed
        .split(/\r?\n|;|•/)
        .map((s) => s.trim().replace(/^[-*•\d.]+\s*/, ''))
        .filter((s) => s.length > 2);
    }
  }
  return [];
};

export const parseArchitectureFlow = (project: PortfolioRow): ArchitectureFlowData => {
  try {
    let nodes: ArchitectureFlowNode[] = [];
    let connections: [string, string][] = [];

    if (project.arch_nodes) {
      const parsed = typeof project.arch_nodes === 'string' ? JSON.parse(project.arch_nodes) : project.arch_nodes;
      if (Array.isArray(parsed)) {
        nodes = parsed.map((item, idx) => {
          if (typeof item === 'string') {
            return { id: item.toLowerCase().replace(/\s+/g, '-'), label: item, type: 'service' };
          }
          return {
            id: item.id || `node-${idx}`,
            label: item.label || item.id || `Stage ${idx + 1}`,
            type: item.type || 'service',
            description: item.description,
            metadata: item.metadata,
            category: item.category,
            icon: item.icon,
          };
        });
      }
    }

    if (project.arch_conn) {
      const parsedConn = typeof project.arch_conn === 'string' ? JSON.parse(project.arch_conn) : project.arch_conn;
      if (Array.isArray(parsedConn)) {
        connections = parsedConn
          .map((c: any) => {
            if (Array.isArray(c) && c.length >= 2) return [String(c[0]), String(c[1])] as [string, string];
            if (c && typeof c === 'object' && c.from && c.to) return [String(c.from), String(c.to)] as [string, string];
            return null;
          })
          .filter((c): c is [string, string] => c !== null);
      }
    }

    if (nodes.length > 0) {
      const nodeIds = new Set(nodes.map((n) => n.id));
      const validConnections = connections.filter(([from, to]) => nodeIds.has(from) && nodeIds.has(to));

      if (validConnections.length === 0 && nodes.length > 1) {
        for (let i = 0; i < nodes.length - 1; i++) {
          validConnections.push([nodes[i].id, nodes[i + 1].id]);
        }
      }

      return { nodes, connections: validConnections };
    }
  } catch (err) {
    console.warn('Failed to parse architecture flow from CMS:', err);
  }

  const fallbackNodes: ArchitectureFlowNode[] = [
    { id: 'input', label: project.platform || 'System Input', type: 'input' },
    { id: 'processing', label: project.category || project.project_type || 'Processing Pipeline', type: 'pipeline' },
    { id: 'core', label: project.title || 'Core Intelligence', type: 'ai' },
    { id: 'output', label: 'Production Output', type: 'output' },
  ];

  return {
    nodes: fallbackNodes,
    connections: [
      ['input', 'processing'],
      ['processing', 'core'],
      ['core', 'output'],
    ],
  };
};

export const getNodeTypeConfig = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('input') || t.includes('client') || t.includes('user') || t.includes('source') || t.includes('expert')) {
    return {
      typeKey: 'input',
      badge: 'INPUT / CLIENT',
      color: '#5ad7ff',
      glowClass: 'node-theme-input',
      Icon: Terminal,
    };
  }
  if (t.includes('ai') || t.includes('model') || t.includes('agent') || t.includes('llm') || t.includes('gemini') || t.includes('estimator') || t.includes('quantized')) {
    return {
      typeKey: 'ai',
      badge: 'AI / AGENT / MODEL',
      color: '#b594ff',
      glowClass: 'node-theme-ai',
      Icon: BrainCircuit,
    };
  }
  if (t.includes('database') || t.includes('db') || t.includes('storage') || t.includes('vector') || t.includes('history') || t.includes('redis') || t.includes('postgres') || t.includes('disk')) {
    return {
      typeKey: 'database',
      badge: 'DATABASE / STORAGE',
      color: '#a3e635',
      glowClass: 'node-theme-database',
      Icon: Database,
    };
  }
  if (t.includes('pipeline') || t.includes('chunk') || t.includes('ingest') || t.includes('format') || t.includes('wave') || t.includes('etl') || t.includes('feature') || t.includes('train') || t.includes('sft')) {
    return {
      typeKey: 'pipeline',
      badge: 'PIPELINE / INGESTION',
      color: '#efd18d',
      glowClass: 'node-theme-pipeline',
      Icon: Workflow,
    };
  }
  if (t.includes('output') || t.includes('response') || t.includes('kaggle') || t.includes('prediction') || t.includes('answer') || t.includes('risk')) {
    return {
      typeKey: 'output',
      badge: 'OUTPUT / RESULT',
      color: '#ff7b92',
      glowClass: 'node-theme-output',
      Icon: Zap,
    };
  }
  return {
    typeKey: 'service',
    badge: 'SERVICE / API / MCP',
    color: '#5d7cff',
    glowClass: 'node-theme-service',
    Icon: Server,
  };
};

type PositionedNode = {
  node: ArchitectureFlowNode;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  indexInLayer: number;
  stepNumber: number;
};

export const calculateGraphLayout = (
  flow: ArchitectureFlowData,
  variant: 'systems' | 'project' | 'hero' = 'systems'
) => {
  const { nodes, connections } = flow;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  nodes.forEach((n) => {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  });

  connections.forEach(([from, to]) => {
    if (byId.has(from) && byId.has(to)) {
      outgoing.get(from)?.push(to);
      incoming.get(to)?.push(from);
    }
  });

  const layers = new Map<string, number>();
  const roots = nodes.filter((n) => (incoming.get(n.id)?.length || 0) === 0).map((n) => n.id);
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0].id);
  }

  const queue = [...roots];
  roots.forEach((id) => layers.set(id, 0));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currLayer = layers.get(curr) || 0;
    const nextNodes = outgoing.get(curr) || [];

    for (const next of nextNodes) {
      const nextCurrentLayer = layers.get(next);
      const proposedLayer = currLayer + 1;
      if (nextCurrentLayer === undefined || proposedLayer > nextCurrentLayer) {
        layers.set(next, proposedLayer);
        queue.push(next);
      }
    }
  }

  const maxAssignedLayer = Math.max(0, ...Array.from(layers.values()));
  nodes.forEach((node, idx) => {
    if (!layers.has(node.id)) {
      layers.set(node.id, maxAssignedLayer + 1 + Math.floor(idx / 2));
    }
  });

  const layerGroups = new Map<number, ArchitectureFlowNode[]>();
  nodes.forEach((node) => {
    const l = layers.get(node.id) || 0;
    const group = layerGroups.get(l) || [];
    group.push(node);
    layerGroups.set(l, group);
  });

  const sortedLayerIndices = Array.from(layerGroups.keys()).sort((a, b) => a - b);

  const isSystems = variant === 'systems';
  const isHero = variant === 'hero';

  const NODE_WIDTH = isHero ? 190 : isSystems ? 210 : 220;
  const NODE_HEIGHT = isHero ? 70 : isSystems ? 74 : 78;
  const H_GAP = isHero ? 42 : isSystems ? 54 : 56;
  const V_GAP = isHero ? 18 : isSystems ? 20 : 22;
  const PAD_X = 24;
  const PAD_Y = 20;

  const maxNodesInAnyLayer = Math.max(...Array.from(layerGroups.values()).map((g) => g.length), 1);
  const totalHeight = Math.max(
    maxNodesInAnyLayer * NODE_HEIGHT + (maxNodesInAnyLayer - 1) * V_GAP + PAD_Y * 2,
    isSystems ? 230 : 220
  );

  const positions = new Map<string, PositionedNode>();
  let globalStep = 1;

  sortedLayerIndices.forEach((layerIndex, colIdx) => {
    const group = layerGroups.get(layerIndex) || [];
    const colX = PAD_X + colIdx * (NODE_WIDTH + H_GAP);

    const groupHeight = group.length * NODE_HEIGHT + Math.max(0, group.length - 1) * V_GAP;
    const startY = Math.max(PAD_Y, (totalHeight - groupHeight) / 2);

    group.forEach((node, rowIdx) => {
      const nodeY = startY + rowIdx * (NODE_HEIGHT + V_GAP);
      positions.set(node.id, {
        node,
        x: colX,
        y: nodeY,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        layer: colIdx,
        indexInLayer: rowIdx,
        stepNumber: globalStep++,
      });
    });
  });

  const totalWidth = PAD_X * 2 + sortedLayerIndices.length * NODE_WIDTH + Math.max(0, sortedLayerIndices.length - 1) * H_GAP;

  return {
    positions,
    totalWidth,
    totalHeight,
    layerCount: sortedLayerIndices.length,
    incoming,
    outgoing,
  };
};

export function ArchitectureFlow({
  project,
  variant = 'systems',
  className = '',
  interactive = true,
  showRoadmap = variant === 'project',
  showDescription = variant === 'project',
  activeNodeIndex = 0,
  onSelectNode,
}: ArchitectureFlowProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  const flow = useMemo(() => parseArchitectureFlow(project), [project]);
  const layout = useMemo(() => calculateGraphLayout(flow, variant), [flow, variant]);
  const roadmapItems = useMemo(() => parseRoadmapItems(project.roadmap), [project.roadmap]);

  // Center active node smoothly in 2D (horizontal + vertical) when activeNodeIndex changes (systems variant)
  useEffect(() => {
    if (variant === 'project') {
      // In project detail modal: natural scrolling without forced transforms
      setTranslateX(0);
      setTranslateY(0);
      return;
    }

    if (!viewportRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    const viewportHeight = viewportRef.current.clientHeight || 270;
    if (viewportWidth <= 0) return;

    const targetNode = flow.nodes[activeNodeIndex] || flow.nodes[0];
    if (!targetNode) return;

    const pos = layout.positions.get(targetNode.id);
    if (!pos) return;

    // 1. Horizontal auto-panning
    if (layout.totalWidth <= viewportWidth) {
      setTranslateX((viewportWidth - layout.totalWidth) / 2);
    } else {
      const targetCenterX = pos.x + pos.width / 2;
      const idealTx = viewportWidth / 2 - targetCenterX;
      const minTx = viewportWidth - layout.totalWidth - 24;
      const maxTx = 24;
      setTranslateX(Math.min(maxTx, Math.max(minTx, idealTx)));
    }

    // 2. Vertical auto-panning (for tall or multi-row flow graphs)
    if (layout.totalHeight <= viewportHeight) {
      setTranslateY((viewportHeight - layout.totalHeight) / 2);
    } else {
      const targetCenterY = pos.y + pos.height / 2;
      const idealTy = viewportHeight / 2 - targetCenterY;
      const minTy = viewportHeight - layout.totalHeight - 16;
      const maxTy = 16;
      setTranslateY(Math.min(maxTy, Math.max(minTy, idealTy)));
    }
  }, [activeNodeIndex, flow, layout, variant]);

  // Handle window resize for dynamic centering
  useEffect(() => {
    if (variant === 'project') return;
    const handleResize = () => {
      if (!viewportRef.current) return;
      const viewportWidth = viewportRef.current.clientWidth;
      const viewportHeight = viewportRef.current.clientHeight || 270;
      if (layout.totalWidth <= viewportWidth) {
        setTranslateX((viewportWidth - layout.totalWidth) / 2);
      }
      if (layout.totalHeight <= viewportHeight) {
        setTranslateY((viewportHeight - layout.totalHeight) / 2);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout.totalWidth, layout.totalHeight, variant]);

  // Determine which node is currently active (hover overrides auto-cycle)
  const currentActiveNodeId = useMemo(() => {
    if (hoveredNodeId) return hoveredNodeId;
    if (variant === 'project') return null;
    return flow.nodes[activeNodeIndex]?.id || flow.nodes[0]?.id || null;
  }, [hoveredNodeId, activeNodeIndex, flow.nodes, variant]);

  // Compute active connection sets for glow & pulse
  const activeHighlight = useMemo(() => {
    if (!currentActiveNodeId) return null;
    const upstreamNodes = new Set<string>();
    const downstreamNodes = new Set<string>();
    const highlightedEdges = new Set<string>();

    (layout.incoming.get(currentActiveNodeId) || []).forEach((src) => {
      upstreamNodes.add(src);
      highlightedEdges.add(`${src}->${currentActiveNodeId}`);
    });

    (layout.outgoing.get(currentActiveNodeId) || []).forEach((dst) => {
      downstreamNodes.add(dst);
      highlightedEdges.add(`${currentActiveNodeId}->${dst}`);
    });

    return {
      activeId: currentActiveNodeId,
      upstreamNodes,
      downstreamNodes,
      highlightedEdges,
    };
  }, [currentActiveNodeId, layout]);

  return (
    <div className={`arch-flow-container variant-${variant} ${className}`}>
      {/* Optional Architecture Description Banner (Shown in Project View Modal) */}
      {showDescription && project.arch_desc && (
        <div className="arch-project-desc-box">
          <span className="arch-desc-kicker">SYSTEM ARCHITECTURE &amp; DATA FLOW</span>
          <p className="arch-desc-text">{project.arch_desc}</p>
        </div>
      )}

      {/* Main Interactive Diagram Canvas Area with 2D auto-panning in showcase or free scroll in modal */}
      <div className={`arch-diagram-viewport ${variant === 'project' ? 'is-project-scroll' : ''}`} ref={viewportRef}>
        <div
          className="arch-diagram-canvas"
          style={{
            width: layout.totalWidth,
            height: layout.totalHeight,
            transform: variant === 'project'
              ? 'none'
              : `translate3d(${translateX}px, ${translateY}px, 0px)`,
          }}
        >
          {/* Ambient Blueprint Grid Layer */}
          <div className="arch-canvas-grid-bg" aria-hidden="true" />

          {/* SVG Connection Lines Layer */}
          <svg
            className="arch-diagram-svg"
            width={layout.totalWidth}
            height={layout.totalHeight}
            viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arch-arrow-default"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,1 L6,4 L0,7 L2,4 Z" fill="rgba(135, 162, 255, 0.75)" />
              </marker>

              <marker
                id="arch-arrow-active"
                markerWidth="9"
                markerHeight="9"
                refX="7"
                refY="4.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,1 L7,4.5 L0,8 L2.5,4.5 Z" fill="#5ad7ff" />
              </marker>
            </defs>

            {/* Render Connections */}
            {flow.connections.map(([fromId, toId]) => {
              const source = layout.positions.get(fromId);
              const target = layout.positions.get(toId);
              if (!source || !target) return null;

              const edgeKey = `${fromId}->${toId}`;
              const isEdgeActive = activeHighlight?.highlightedEdges.has(edgeKey);
              const isDimmed = activeHighlight && !isEdgeActive;

              const x1 = source.x + source.width;
              const y1 = source.y + source.height / 2;
              const x2 = target.x;
              const y2 = target.y + target.height / 2;

              let d = '';
              if (x2 >= x1 + 10) {
                const dx = Math.max(32, (x2 - x1) * 0.45);
                d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
              } else {
                const loopH = 34;
                d = `M ${x1} ${y1} C ${x1 + 35} ${y1 + loopH}, ${x2 - 35} ${y2 + loopH}, ${x2} ${y2}`;
              }

              return (
                <g key={edgeKey} className={`arch-edge-group ${isEdgeActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}>
                  <path
                    d={d}
                    className="arch-edge-base"
                    markerEnd={isEdgeActive ? 'url(#arch-arrow-active)' : 'url(#arch-arrow-default)'}
                  />
                  <path
                    d={d}
                    className="arch-edge-flow"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Node Cards */}
          {flow.nodes.map((node, nodeIdx) => {
            const pos = layout.positions.get(node.id);
            if (!pos) return null;

            const config = getNodeTypeConfig(node.type);
            const { Icon } = config;

            const isCurrentActive = activeHighlight?.activeId === node.id;
            const isConnected =
              activeHighlight?.upstreamNodes.has(node.id) ||
              activeHighlight?.downstreamNodes.has(node.id);
            const isDimmed = activeHighlight && !isCurrentActive && !isConnected;

            return (
              <div
                key={node.id}
                className={`arch-node-card ${config.glowClass} ${isCurrentActive ? 'is-hovered is-active-step' : ''} ${
                  isConnected ? 'is-connected' : ''
                } ${isDimmed ? 'is-dimmed' : ''}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  minHeight: `${pos.height}px`,
                }}
                onMouseEnter={() => interactive && setHoveredNodeId(node.id)}
                onMouseLeave={() => interactive && setHoveredNodeId(null)}
                onClick={() => onSelectNode && onSelectNode(node.id, nodeIdx)}
                tabIndex={0}
                role="button"
                aria-label={`${node.label} (${config.badge})`}
              >
                <div className="arch-node-inner">
                  {/* Step & Type Badge */}
                  <div className="arch-node-top">
                    <span className="arch-node-step">0{pos.stepNumber}</span>
                    <span className="arch-node-type-pill" style={{ color: config.color }}>
                      <span className="arch-node-indicator" style={{ backgroundColor: config.color }} />
                      {config.badge}
                    </span>
                  </div>

                  {/* Node Title & Icon */}
                  <div className="arch-node-body">
                    <div className="arch-node-icon-wrap" style={{ color: config.color }}>
                      <Icon size={15} />
                    </div>
                    <div className="arch-node-info">
                      <strong className="arch-node-title" title={node.label}>
                        {node.label}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Roadmap Section (Shown in Project View Modal) */}
      {showRoadmap && roadmapItems.length > 0 && (
        <div className="arch-flow-roadmap">
          <div className="arch-roadmap-label">
            <Sparkles size={14} className="roadmap-icon" />
            <span>System Roadmap &amp; Planned Milestones</span>
          </div>
          <div className="arch-roadmap-list">
            {roadmapItems.map((item, idx) => (
              <div key={idx} className="arch-roadmap-item">
                <CheckCircle2 size={13} className="roadmap-check" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchitectureFlow;
