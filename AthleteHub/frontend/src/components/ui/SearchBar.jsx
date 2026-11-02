import { Search } from 'lucide-react';

export default function SearchBar({ search, setSearch, onSearch, placeholder = 'Search...' }) {
  return (
    <form onSubmit={onSearch} className="flex gap-4 w-full md:w-auto flex-1 max-w-md">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-10"
        />
      </div>
      <button type="submit" className="btn btn-primary whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
