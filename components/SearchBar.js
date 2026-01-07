export default function SearchBar({
  value,
  onChange,
  onSubmit,
  className = "",
  placeholder = "搜索 skill 名称、描述或标签...",
  buttonLabel = "搜索"
}) {
  return (
    <form
      className={`search-bar ${className}`.trim()}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
      />
      <button type="submit">{buttonLabel}</button>
    </form>
  );
}
