export default function UserSearch({ value, onChange }) {
  return (
    <input
      className="input"
      type="search"
      placeholder="Search users…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search users"
    />
  );
}