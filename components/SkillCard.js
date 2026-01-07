import Link from "next/link";
import Tag from "./Tag";
import {
  formatRelativeDate,
  getSkillDisplayName,
  getSkillIdentifier,
  splitTagline
} from "../lib/utils";

export default function SkillCard({ skill, style }) {
  const tagList = skill.tags || [];
  const taglineLines = splitTagline(skill.tagline);
  return (
    <Link
      href={`/skill/${getSkillIdentifier(skill)}`}
      className="skill-card fade-up"
      style={style}
    >
      <h3 className="skill-title">{getSkillDisplayName(skill)}</h3>
      <p className="skill-tagline">
        {taglineLines.length
          ? taglineLines.map((line, index) => (
              <span key={`${line}-${index}`} className="skill-tagline-line">
                {line}
              </span>
            ))
          : "暂无一句话描述"}
      </p>
      <div className="tag-list">
        {tagList.length
          ? tagList
              .slice(0, 5)
              .map((tag, index) => <Tag key={`${tag}-${index}`} label={tag} />)
          : <Tag label="未标注标签" />}
      </div>
      <div className="meta">
        <span className="meta-category">分类: {skill.category || "其他"}</span>
        <span className="meta-updated">更新: {formatRelativeDate(skill.updated_at)}</span>
      </div>
    </Link>
  );
}
