import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import SkillCard from "../components/SkillCard";
import { useSkills } from "../lib/useSkills";
import { normalizeText, parseDate } from "../lib/utils";
import { getCategoryDisplay } from "../lib/constants";
import { getStrings, useLanguage } from "../lib/i18n";

const PAGE_SIZE = 16;

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return value || "";
}

function matchesQuery(skill, query) {
  if (!query) {
    return true;
  }
  const q = normalizeText(query);
  const sources = [
    skill.skill_name,
    skill.tagline,
    skill.description_zh,
    skill.description,
    skill.description_en,
    skill.use_case,
    skill.use_case_en,
    skill.category,
    ...(skill.tags_en || []),
    ...(skill.tags || [])
  ];
  return sources.some((value) => normalizeText(value).includes(q));
}

function sortSkills(skills, sortKey) {
  const list = [...skills];
  if (sortKey === "stars") {
    return list.sort((a, b) => (Number(b.repostars) || 0) - (Number(a.repostars) || 0));
  }
  const dir = sortKey === "oldest" ? 1 : -1;
  return list.sort((a, b) => {
    const dateA = parseDate(a.updated_at) || new Date(0);
    const dateB = parseDate(b.updated_at) || new Date(0);
    return dir * (dateA.getTime() - dateB.getTime());
  });
}

export default function SearchPage() {
  const router = useRouter();
  const { skills, loading, error } = useSkills();
  const { language } = useLanguage();
  const strings = getStrings(language);
  const queryValue = getQueryValue(router.query.q);
  const categoryValue = getQueryValue(router.query.category);
  const pageValue = Number.parseInt(getQueryValue(router.query.page), 10) || 1;
  const [input, setInput] = useState(queryValue);
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    setInput(queryValue);
  }, [queryValue]);

  const filtered = useMemo(() => {
    return skills.filter((skill) => {
      if (categoryValue && skill.category !== categoryValue) {
        return false;
      }
      return matchesQuery(skill, queryValue);
    });
  }, [skills, categoryValue, queryValue]);

  const sorted = useMemo(() => sortSkills(filtered, sort), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(pageValue, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateQuery = (next) => {
    router.push(
      {
        pathname: "/search",
        query: {
          ...(next.q ? { q: next.q } : {}),
          ...(next.category ? { category: next.category } : {}),
          ...(next.page ? { page: next.page } : {})
        }
      },
      undefined,
      { shallow: true }
    );
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(set)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  return (
    <div>
      <Header>
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={() => updateQuery({ q: input.trim(), category: categoryValue, page: 1 })}
          className="compact"
          placeholder={strings.searchPlaceholder}
          buttonLabel={strings.searchButton}
        />
      </Header>
      <main>
        <section className="page-header">
          <div className="container">
            <div className="results-bar">
              <div>
                {categoryValue
                  ? `${getCategoryDisplay(categoryValue, language)} · `
                  : queryValue
                    ? `${strings.resultsForQuery(queryValue)} · `
                    : `${strings.resultsTitle} · `}
                {loading ? strings.loading : strings.resultsCount(sorted.length)}
                {error ? ` · ${error}` : ""}
              </div>
              <div className="sort-select">
                {strings.sortLabel}
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="latest">{strings.sortLatest}</option>
                  <option value="oldest">{strings.sortOldest}</option>
                  <option value="stars">{strings.sortStars}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading ? (
              <div className="loading">{strings.loadingSkills}</div>
            ) : (
              <div className="cards">
                {paged.length ? (
                  paged.map((skill, index) => (
                    <SkillCard
                      key={skill.identifier}
                      skill={skill}
                      style={{ "--delay": `${index * 40}ms` }}
                    />
                  ))
                ) : (
                  <div className="loading">{strings.noResults}</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="pagination">
              <button
                className="page-button"
                onClick={() => updateQuery({ q: queryValue, category: categoryValue, page: currentPage - 1 })}
                disabled={currentPage <= 1}
              >
                {strings.previousPage}
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={`page-button ${page === currentPage ? "active" : ""}`}
                  onClick={() => updateQuery({ q: queryValue, category: categoryValue, page })}
                >
                  {page}
                </button>
              ))}
              <button
                className="page-button"
                onClick={() => updateQuery({ q: queryValue, category: categoryValue, page: currentPage + 1 })}
                disabled={currentPage >= totalPages}
              >
                {strings.nextPage}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
