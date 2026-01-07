import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Tag from "../../components/Tag";
import FileTree from "../../components/FileTree";
import MarkdownView from "../../components/MarkdownView";
import { useSkills } from "../../lib/useSkills";
import {
  formatNumber,
  formatRelativeDate,
  getSkillDisplayName,
  getSkillIdentifier
} from "../../lib/utils";

function Section({ title, children }) {
  return (
    <div className="section-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function getSafeFileName(value) {
  return sanitizeName(String(value || "skill")) || "skill";
}

function sanitizeName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "skill";
}

export default function SkillDetail() {
  const router = useRouter();
  const routeId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const { skills, loading, error } = useSkills();
  const [docView, setDocView] = useState("split");
  const [downloadState, setDownloadState] = useState({
    loading: false,
    error: ""
  });

  const skill = useMemo(() => {
    if (!routeId) {
      return null;
    }
    const decoded = decodeURIComponent(routeId);
    return (
      skills.find((item) => getSkillIdentifier(item) === routeId) ||
      skills.find((item) => item.skill_name === decoded) ||
      null
    );
  }, [routeId, skills]);

  const handleDownload = async () => {
    if (!skill?.download_url || downloadState.loading) {
      return;
    }
    setDownloadState({ loading: true, error: "" });
    try {
      const params = new URLSearchParams();
      params.set("url", skill.download_url);
      if (skill.fromRepo) {
        params.set("repo", skill.fromRepo);
      }
      if (skill.skillPath) {
        params.set("skillPath", skill.skillPath);
      }
      if (skill.skill_name) {
        params.set("name", skill.skill_name);
      }
      const response = await fetch(`/api/repack?${params.toString()}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "打包失败");
      }
      const blob = await response.blob();
      const filename = `${getSafeFileName(skill.skill_name)}.zip`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDownloadState({ loading: false, error: "" });
    } catch (err) {
      setDownloadState({
        loading: false,
        error: err?.message || "下载失败"
      });
    }
  };

  return (
    <div>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="container">
            <button
              className="page-button"
              onClick={() => router.back()}
              type="button"
            >
              ← 返回
            </button>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading && <div className="loading">正在加载 skill...</div>}
            {error && <div className="loading">{error}</div>}
            {!loading && !skill && (
              <div className="loading">没有找到对应的 skill</div>
            )}
            {skill && (
              <div className="detail-header">
                <div className="detail-title">
                  <h1>{getSkillDisplayName(skill)}</h1>
                  <div className="badge">⭐ {formatNumber(skill.repostars)}</div>
                </div>
                <p className="detail-sub">
                  {skill.tagline || "暂无一句话描述"}
                </p>
                <div className="tag-list">
                  {(skill.tags || []).length
                    ? skill.tags.map((tag, index) => (
                        <Tag key={`${tag}-${index}`} label={tag} />
                      ))
                    : ""}
                </div>
                <div className="meta">
                  <span>分类: {skill.category || "其他"}</span>
                  <span>最近更新: {formatRelativeDate(skill.updated_at)}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {skill && (
          <section className="section">
            <div className="container detail-grid">
              <Section title="描述">
                <p>中文: {skill.description_zh || skill.description || "暂无中文描述"}</p>
                <p>English: {skill.description_en || "暂无英文描述"}</p>
              </Section>
              <Section title="使用场景">
                <p style={{ whiteSpace: "pre-line" }}>
                  {skill.use_case || "暂无使用场景"}
                </p>
              </Section>
              <Section title="安装与加载">
                {skill.how_to_install ? (
                  <pre className="code-block">{skill.how_to_install}</pre>
                ) : (
                  <pre className="code-block">
{`Claude Code:
1. git clone <repo-url> /tmp/temp-repo
2. cp -r /tmp/temp-repo/<skill-path> ~/.claude/skills/
   或 cp -r /tmp/temp-repo/<skill-path> .claude/skills/

Codex (OpenAI Agent CLI):
skill-installer https://github.com/<owner>/<repo>/<skill-path>`}
                  </pre>
                )}
              </Section>
              <Section title="链接">
                <div className="link-list">
                  {skill.fromRepo && (
                    <a
                      className="link-button"
                      href={skill.fromRepo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub 仓库
                    </a>
                  )}
                  {skill.download_url && (
                    <>
                      <button
                        className="link-button"
                        type="button"
                        onClick={handleDownload}
                        disabled={downloadState.loading}
                      >
                        {downloadState.loading ? "正在打包..." : "下载 Skill"}
                      </button>
                      <a
                        className="link-button"
                        href={skill.download_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        原始下载
                      </a>
                    </>
                  )}
                </div>
                {downloadState.error ? (
                  <p style={{ marginTop: "12px", color: "#a14b1f" }}>
                    {downloadState.error}
                  </p>
                ) : null}
                {skill.skillPath ? (
                  <p style={{ marginTop: "12px" }}>路径: {skill.skillPath}</p>
                ) : null}
              </Section>
            </div>
          </section>
        )}

        {skill && (
          <section className="section">
            <div className="container">
              <div className="section-card">
                <h3>Skill 文档</h3>
                <div className="tabs">
                  <button
                    className={`tab ${docView === "origin" ? "active" : ""}`}
                    onClick={() => setDocView("origin")}
                    type="button"
                  >
                    原文
                  </button>
                  <button
                    className={`tab ${docView === "translation" ? "active" : ""}`}
                    onClick={() => setDocView("translation")}
                    type="button"
                  >
                    中文翻译
                  </button>
                  <button
                    className={`tab ${docView === "split" ? "active" : ""}`}
                    onClick={() => setDocView("split")}
                    type="button"
                  >
                    双栏对照
                  </button>
                </div>
                {docView === "split" ? (
                  <div className="doc-columns">
                    <div className="doc-pane">
                      <MarkdownView content={skill.skill_md_content} />
                    </div>
                    <div className="doc-pane">
                      <MarkdownView
                        content={skill.skill_md_content_translation}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="doc-pane">
                    {docView === "origin" ? (
                      <MarkdownView content={skill.skill_md_content} />
                    ) : (
                      <MarkdownView
                        content={skill.skill_md_content_translation}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {skill && (
          <section className="section">
            <div className="container">
              <div className="section-card">
                <h3>文件结构</h3>
                <FileTree fileTree={skill.file_tree} />
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
