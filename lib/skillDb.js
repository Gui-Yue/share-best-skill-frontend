import { parseArrayValue, pickCategory } from "./utils";

let cachedSkills = null;
let loadingPromise = null;
const DEFAULT_DB_URL = "/skill.db";

function selectTableName(db) {
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  const names = result[0]?.values?.map((row) => row[0]) || [];
  if (names.includes("skills")) {
    return "skills";
  }
  if (names.includes("skill")) {
    return "skill";
  }
  return names[0] || null;
}

function rowsFromResult(result) {
  if (!result || result.length === 0) {
    return [];
  }
  const { columns, values } = result[0];
  return values.map((row) => {
    const entry = {};
    columns.forEach((column, index) => {
      entry[column] = row[index];
    });
    return entry;
  });
}

function normalizeSkill(row, index) {
  const tags = parseArrayValue(row.tags);
  const categories = parseArrayValue(row.categories);
  const skillName = row.skill_name || row.skillName || row.name || "";
  const identifier = row.id !== undefined && row.id !== null
    ? String(row.id)
    : skillName
      ? encodeURIComponent(skillName)
      : String(index + 1);

  return {
    id: row.id ?? identifier,
    identifier,
    skill_name: skillName,
    fromRepo: row.fromRepo || row.from_repo || "",
    skillPath: row.skillPath || row.skill_path || "",
    repostars: row.repostars || row.repoStars || row.stars || 0,
    tagline: row.tagline || "",
    tags,
    categories,
    category: categories[0] || pickCategory(row.categories),
    description: row.description || "",
    description_en: row.description_en || row.descriptionEn || "",
    use_case: row.use_case || row.useCase || "",
    download_url: row.download_url || row.downloadUrl || "",
    skill_md_content: row.skill_md_content || row.skillMdContent || "",
    skill_md_content_translation:
      row.skill_md_content_translation || row.skillMdContentTranslation || "",
    file_tree: row.file_tree || row.fileTree || "",
    how_to_install: row.how_to_install || row.howToInstall || "",
    created_at: row.created_at || row.createdAt || "",
    updated_at: row.updated_at || row.updatedAt || ""
  };
}

export async function loadSkills() {
  if (cachedSkills) {
    return cachedSkills;
  }
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const { default: initSqlJs } = await import("sql.js");
      const SQL = await initSqlJs({
        locateFile: (file) => `/${file}`
      });
      const dbUrl = process.env.NEXT_PUBLIC_SKILL_DB_URL || DEFAULT_DB_URL;
      const response = await fetch(dbUrl);
      if (!response.ok) {
        throw new Error(
          "skill.db not found. Set NEXT_PUBLIC_SKILL_DB_URL or place it in public/skill.db"
        );
      }
      const buffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));
      const table = selectTableName(db);
      if (!table) {
        return [];
      }
      const rows = rowsFromResult(db.exec(`SELECT * FROM "${table}"`));
      cachedSkills = rows.map(normalizeSkill);
      return cachedSkills;
    })().catch((error) => {
      loadingPromise = null;
      throw error;
    });
  }
  return loadingPromise;
}
