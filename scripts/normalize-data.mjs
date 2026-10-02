import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "src", "data", "portfolio.json");

const INPUT_CANDIDATES = [
  path.join(ROOT, "Portfolio CMS.xlsx"),
  path.join(ROOT, "Portfolio_CMS.xlsx"),
];

const INPUT = INPUT_CANDIDATES.find((file) => fs.existsSync(file));

function s(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "yes", "1", "y"].includes(value.trim().toLowerCase());
  }
  return false;
}

function splitList(value) {
  return s(value)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !x.toLowerCase().includes("not specified"));
}

function splitRoles(value) {
  return s(value)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function asJsonString(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value);
  } catch {
    return s(value);
  }
}

function nullablePriority(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : s(value);
}

function rows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: true,
  });
}

function cleanRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = typeof value === "string" ? value.trim() : value;
  }
  return result;
}

function shouldShow(row) {
  if (row.show === null || row.show === undefined || row.show === "") return true;
  return parseBoolean(row.show);
}

function base(
  section,
  title,
  category,
  description,
  technology,
  platform,
  url,
  year,
  importance,
  priority,
  animation,
  display,
  extra = {},
) {
  const cat = s(category);
  const tech = s(technology);

  return {
    section,
    title: s(title),
    category: cat,
    categories: cat
      .replace(/\+/g, "/")
      .replace(/,/g, "/")
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean),
    description: s(description),
    technology: tech,
    technologies: splitList(tech),
    platform: s(platform),
    url: s(url),
    year: s(year),
    importance: s(importance),
    portfolio_priority: s(priority),
    animation_scene: s(animation),
    display_on_homepage: parseBoolean(display),
    ...extra,
  };
}

function projectType(category, urlType, projectUrl) {
  const cat = s(category);
  const url = s(projectUrl).toLowerCase();
  const type = s(urlType).toLowerCase();

  if (url.includes("/models/")) return "TRAINED MODEL";
  if (cat === "PUBLISHED DATASETS") return "DATASET & CURATION";
  if (cat === "COURSEWORK & FOUNDATIONS") return "ACADEMIC RESEARCH";
  if (cat === "DATA ENGINEERING & PIPELINES") return "AUTOMATED DATA PIPELINE";
  if (cat === "AI AGENTS & LLM APPS") return "END-TO-END AI SYSTEM";
  if (cat === "ML ENGINEERING TOOLS") return "ML ENGINEERING TOOL";
  if (cat === "APPLIED ML & COMPETITIONS") return "NOTEBOOK";
  if (cat === "DATA ANALYSIS & INSIGHTS") return "NOTEBOOK";
  if (type === "git" || type === "github") return "END-TO-END AI SYSTEM";
  return "TECHNICAL WORK";
}

function platformFromUrlType(urlType, liveUrl) {
  const type = s(urlType).toLowerCase();
  if (type === "kaggle") return "Kaggle";
  if (type === "git" || type === "github") return "GitHub";
  if (type === "skilllync" || type === "skill-lync") return "Skill-Lync";
  if (s(liveUrl)) return "Live";
  return "Portfolio";
}

function projectUrls(urlType, projectUrl) {
  const type = s(urlType).toLowerCase();
  const url = s(projectUrl);
  const github_url = type === "git" || type === "github" ? url : "";
  const kaggle_url = type === "kaggle" ? url : "";
  const skillLync_url = type === "skilllync" || type === "skill-lync" ? url : "";
  return { github_url, kaggle_url, skillLync_url };
}

if (!INPUT) {
  console.error(
    `CMS file not found. Looked for:\n${INPUT_CANDIDATES.map((f) => `  - ${f}`).join("\n")}`,
  );
  process.exit(1);
}

const workbook = XLSX.readFile(INPUT);

function getSheet(name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    console.warn(`Warning: sheet "${name}" not found.`);
    return [];
  }
  return rows(sheet).map(cleanRow);
}

const heroRows = getSheet("00_Hero");
const skillSheet = getSheet("01_Skills");
const projects = getSheet("02_Projects");
const experience = getSheet("03_Experience");
const education = getSheet("04_Education");
const certifications = getSheet("05_Certifications");
const profileLinkRows = getSheet("06_Profile_Links");

const heroes = heroRows
  .filter((r) => s(r.role) || s(r.slug))
  .map((r) => ({
    id: r.id,
    role: s(r.role),
    slug: s(r.slug) || "/",
    meta_tittle: s(r.meta_tittle),
    meta_description: s(r.meta_description),
    kicker: s(r.kicker),
    headline: s(r.headline),
    subheadline: s(r.subheadline),
    description: s(r.description),
    skills: s(r.skills),
    cms_source: "00_Hero",
  }));

const skills = skillSheet
  .filter((r) => s(r.name) && shouldShow(r))
  .map((r) => ({
    id: r.id,
    name: s(r.name),
    category: s(r.category) || "Other",
    icon_dark: s(r.icon_dark),
    icon_light: s(r.icon_light),
    show: true,
    cms_source: "01_Skills",
  }));

const records = [];

for (const r of profileLinkRows) {
  if (!shouldShow(r) || !s(r.url) || !s(r.platform)) continue;

  const platform = s(r.platform);
  const url = s(r.url);

  records.push(
    base(
      "profile",
      `${platform} Profile`,
      "Profile Link",
      `${platform} profile/contact link.`,
      "",
      platform,
      url,
      "",
      "5",
      r.id ?? records.length + 1,
      "profile_hero",
      true,
      {
        icon_dark: s(r.icon_dark),
        icon_light: s(r.icon_light),
        cms_source: "06_Profile_Links",
        cms: cleanRow(r),
      },
    ),
  );

  records.push(
    base(
      "external_links",
      platform,
      "External Link",
      `${platform} profile/contact link.`,
      "",
      platform,
      url,
      "",
      "5",
      r.id ?? records.length + 1,
      "contact_link",
      true,
      {
        icon_dark: s(r.icon_dark),
        icon_light: s(r.icon_light),
        cms_source: "06_Profile_Links",
        cms: cleanRow(r),
      },
    ),
  );
}

for (const r of experience) {
  if (!shouldShow(r) || !s(r.role)) continue;

  records.push(
    base(
      "experience",
      r.role,
      "Professional Experience",
      r.description,
      r.skill || r.technologies,
      r.company,
      r.url,
      r.period,
      "5",
      records.length + 1,
      "experience_timeline",
      true,
      {
        role: s(r.role),
        company: s(r.company),
        period: s(r.period),
        current: parseBoolean(r.current),
        highlights: s(r.highlights),
        cms_source: "03_Experience",
        cms: cleanRow(r),
      },
    ),
  );
}

for (const r of education) {
  if (!shouldShow(r) || !s(r.degree)) continue;

  records.push(
    base(
      "education",
      r.degree,
      "Bachelor's / Post-Graduate Education",
      r.description,
      r.technologies,
      r.institution,
      r.url,
      r.period,
      "5",
      records.length + 1,
      "education_timeline",
      true,
      {
        degree: s(r.degree),
        institution: s(r.institution),
        period: s(r.period),
        featured: true,
        credentialUrl: s(r.credentialUrl),
        cms_source: "04_Education",
        cms: cleanRow(r),
      },
    ),
  );
}

for (const r of certifications) {
  if (!shouldShow(r) || !s(r.name)) continue;

  records.push(
    base(
      "certifications",
      r.name,
      r.type || "Certification",
      `${r.name} issued by ${r.issuer}.`,
      "",
      r.issuer,
      r.url,
      "",
      "4",
      records.length + 1,
      "certification_grid",
      true,
      {
        issuer: s(r.issuer),
        type: s(r.type),
        credentialId: s(r.credentialId),
        cms_source: "05_Certifications",
        cms: cleanRow(r),
      },
    ),
  );
}

for (const r of projects) {
  if (!shouldShow(r) || !s(r.name)) continue;

  const status = s(r.status);
  const active = status.toLowerCase() === "completed" || status.toLowerCase() === "in progress" || parseBoolean(r.active);
  const featuredOrder = nullablePriority(r.featured_order);
  const featured = featuredOrder !== "";
  const display_in = splitRoles(r.display_in);
  const urlType = s(r.url_type);
  const projectUrl = s(r.project_url);
  const liveUrl = s(r.Live_url || r.live_url);
  const urls = projectUrls(urlType, projectUrl);
  const statusNote =
    status.toLowerCase() === "in progress"
      ? s(r.statusNote) || "In Progress"
      : s(r.statusNote);

  records.push(
    base(
      "projects",
      r.name,
      r.category,
      r.description || r.short_description,
      r.skill || r.techStack,
      platformFromUrlType(urlType, liveUrl),
      projectUrl || liveUrl,
      "",
      featuredOrder,
      featuredOrder,
      featured ? "repo_card_flip" : "project_constellation",
      featured || active,
      {
        project_type: projectType(r.category, urlType, projectUrl),
        id: s(r.id) || s(r.slug),
        number: r.id,
        tagline: s(r.short_description || r.tagline),
        type: urlType,
        url_type: urlType,
        slug: s(r.slug),
        active,
        featured,
        isLive: Boolean(liveUrl),
        statusNote,
        display_in,
        problem: s(r.problem),
        solution: s(r.engineering_approach || r.solution),
        features: s(r.features),
        roadmap: s(r.roadmap),
        result_impact: s(r.result_impact),
        arch_desc: s(r.data_architecture || r.architecture_flow || r.arch_desc),
        arch_nodes: asJsonString(r.architecture_nodes || r.arch_nodes),
        arch_conn: asJsonString(r.architecture_connections || r.arch_conn),
        github_url: urls.github_url,
        live_url: liveUrl,
        docs_url: s(r.docs_url),
        kaggle_url: urls.kaggle_url,
        skillLync_url: urls.skillLync_url,
        cms_source: "02_Projects",
        cms: cleanRow(r),
      },
    ),
  );
}

const normalized = {
  sourceFile: path.basename(INPUT),
  generatedAt: new Date().toISOString(),
  contact_description: s(heroRows.find((row) => s(row.contact_description))?.contact_description),
  heroes,
  skills,
  totalRows: records.length,
  sections: [...new Set(records.map((record) => record.section))],
  records,
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(normalized, null, 2), "utf8");

const projectRecords = records.filter((r) => r.section === "projects");
const featuredCount = projectRecords.filter((r) => r.featured === true).length;
const withArch = projectRecords.filter((r) => s(r.arch_nodes).startsWith("[")).length;

console.log(`Generated ${records.length} records`);
console.log(`Heroes: ${heroes.length}`);
console.log(`Skills (show=true): ${skills.length}`);
console.log(`Projects: ${projectRecords.length}`);
console.log(`Featured projects: ${featuredCount}`);
console.log(`Projects with architecture nodes: ${withArch}`);
console.log(`${path.basename(INPUT)} -> ${path.relative(ROOT, OUTPUT)}`);
