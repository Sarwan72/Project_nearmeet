import { useEffect, useRef, useState } from "react";
import { MapPin as MapPinIcon } from "lucide-react";
function LocationField({ formState, setFormState }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const apiKey = import.meta.env.VITE_GEOAPIFY_KEY; // required
    const handleChange = (e) => {
        const value = e.target.value;
        setFormState({ ...formState, location: value });
        // clear old debounce
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        // no query? close list
        if (!value || value.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }
        // debounce network call
        debounceRef.current = setTimeout(async () => {
            try {
                if (!apiKey) {
                    console.warn("Missing VITE_GEOAPIFY_KEY");
                    return;
                }
                // cancel previous request
                if (abortRef.current)
                    abortRef.current.abort();
                abortRef.current = new AbortController();
                setLoading(true);
                const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&type=city&limit=6&format=json&apiKey=${apiKey}`;
                const res = await fetch(url, { signal: abortRef.current.signal });
                const data = await res.json();
                const items = data?.results?.map((r) => {
                    // Build a nice "City, Region, Country" label
                    const city = r.city || r.name || r.address_line1;
                    const region = r.state || r.county || r.region || "";
                    const country = r.country || "";
                    return [city, region, country].filter(Boolean).join(", ");
                }) || [];
                setSuggestions(items);
                setOpen(items.length > 0);
            }
            catch (err) {
                if (err.name !== "AbortError")
                    console.error(err);
                setSuggestions([]);
                setOpen(false);
            }
            finally {
                setLoading(false);
            }
        }, 300);
    };
    // close list on outside click
    const wrapperRef = useRef(null);
    useEffect(() => {
        const onClick = (e) => {
            if (!wrapperRef.current?.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);
    return (<div className="form-control" ref={wrapperRef}>
      {/* <label className="label">
          <span className="label-text">Location</span>
        </label> */}

      <div className="relative">
        <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-5 text-base-content opacity-70 pointer-events-none"/>

        <input type="text" name="location" value={formState?.location || ""} onChange={handleChange} autoComplete="off" className="input input-bordered w-full  bg-white/10  pl-10" placeholder="City, Country" onFocus={() => suggestions.length && setOpen(true)}/>

        {/* Dropdown */}
        {open && (<ul className="absolute left-0 right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-md  shadow-md z-20 max-h-64 overflow-auto">
            {loading && (<li className="p-3 text-sm opacity-70">Searching…</li>)}
            {!loading && suggestions.length === 0 && (<li className="p-3 text-sm opacity-70">No results</li>)}
            {!loading &&
                suggestions.map((s, i) => (<li key={`${s}-${i}`} className="p-3 hover:bg-base-200 cursor-pointer" onClick={() => {
                        setFormState({ ...formState, location: s });
                        setOpen(false);
                    }}>
                  {s}
                </li>))}
          </ul>)}
      </div>
    </div>);
}
export default LocationField;
