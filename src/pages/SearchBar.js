import React, { useEffect, useState } from "react";

export default function SearchBar({ value, onChange, placeholder }) {
  const [local, setLocal] = useState(value || "");

  // Debounce to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 400);
    return () => clearTimeout(t);
  }, [local, onChange]);

  useEffect(() => setLocal(value || ""), [value]);

  return (
    <input
      className="search-input"
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
    />
  );
}
