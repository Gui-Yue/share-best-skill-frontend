import Link from "next/link";

export default function CategoryCard({ label, hint, count, style }) {
  return (
    <Link
      href={`/search?category=${encodeURIComponent(label)}`}
      className="category-card fade-up"
      style={style}
    >
      <h3 className="category-title">{label}</h3>
      <p className="category-hint">{hint}</p>
      <div className="category-count">{count ?? 0} 个</div>
    </Link>
  );
}
