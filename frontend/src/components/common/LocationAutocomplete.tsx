import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface LocationAutocompleteProps {
  onSelect: (lat: number, lon: number, displayName: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({ onSelect, placeholder = "Search city or area...", className = "" }: LocationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&addressdetails=1`);
        const data = await res.json();
        setResults(data.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <Search size={16} className="text-slate-400" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          className="w-full border border-slate-200 bg-white py-2 pl-10 pr-4 rounded-lg focus:border-primary outline-none text-sm"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-auto">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => {
                  setQuery(r.display_name);
                  setShowDropdown(false);
                  onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                }}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b border-slate-50 last:border-0"
              >
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 line-clamp-2">{r.display_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
