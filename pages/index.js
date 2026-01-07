import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import CategoryCard from "../components/CategoryCard";
import { useSkills } from "../lib/useSkills";
import { CATEGORIES, DEFAULT_CATEGORY } from "../lib/constants";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { skills, loading, error } = useSkills();

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((category) => {
      counts[category.label] = 0;
    });
    skills.forEach((skill) => {
      const category = skill.category || DEFAULT_CATEGORY;
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [skills]);

  return (
    <div>
      <Header />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-inner fade-up">
              <h1 className="hero-title">搜索 Agent Skills</h1>
              <p className="hero-sub">
                按名称、描述或标签快速定位你需要的 skill。
              </p>
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={() => {
                  const nextQuery = query.trim();
                  if (nextQuery) {
                    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
                  } else {
                    router.push("/search");
                  }
                }}
              />
              <div className="meta" style={{ marginTop: "20px" }}>
                {loading ? "正在加载 skills..." : `${skills.length} 个可用 skills`}
                {error ? ` · ${error}` : ""}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">分类</h2>
            <div className="category-grid">
              {CATEGORIES.map((category, index) => (
                <CategoryCard
                  key={category.key}
                  label={category.label}
                  hint={category.hint}
                  count={categoryCounts[category.label] ?? 0}
                  style={{ "--delay": `${index * 40}ms` }}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
