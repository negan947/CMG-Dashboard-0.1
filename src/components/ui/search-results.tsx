import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useSearchStore, SearchResult } from '@/lib/stores/search-store';
import { 
  Search,
  X,
  LayoutDashboard,
  User,
  Users,
  FileText,
  Settings,
  BarChart, 
  LineChart,
  PieChart,
  Table,
  Box,
  ChevronRight,
  Building,
  Briefcase,
  Globe,
  HelpCircle
} from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

interface SearchResultsProps {
  onClose: () => void;
}

export function SearchResults({ onClose }: SearchResultsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const {
    query,
    results,
    isSearching,
    setQuery,
    search,
    clearResults
  } = useSearchStore();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Focus the search input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Auto-search when query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      search();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [query, search]);
  
  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);
  
  // Handle keyboard navigation
  useKeyboardShortcut('Escape', () => {
    onClose();
  });
  
  useKeyboardShortcut('ArrowDown', (e) => {
    e.preventDefault();
    if (results.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % results.length);
    }
  });
  
  useKeyboardShortcut('ArrowUp', (e) => {
    e.preventDefault();
    if (results.length > 0) {
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  });
  
  useKeyboardShortcut('Enter', () => {
    if (results.length > 0) {
      handleResultClick(results[selectedIndex]);
    }
  });
  
  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = document.getElementById(`search-result-${selectedIndex}`);
    if (selectedElement && resultsRef.current) {
      const container = resultsRef.current;
      const elementTop = selectedElement.offsetTop;
      const elementBottom = elementTop + selectedElement.clientHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      
      if (elementTop < containerTop) {
        container.scrollTop = elementTop;
      } else if (elementBottom > containerBottom) {
        container.scrollTop = elementBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);
  
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
  };
  
  const renderIcon = (result: SearchResult) => {
    const iconProps = { 
      size: 18, 
      className: cn(
        "flex-shrink-0 mr-2",
        isDark ? "text-blue-400" : "text-blue-600"
      )
    };
    
    switch (result.iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard {...iconProps} />;
      case 'User':
        return <User {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'FileText':
        return <FileText {...iconProps} />;
      case 'Settings':
        return <Settings {...iconProps} />;
      case 'BarChart':
        return <BarChart {...iconProps} />;
      case 'LineChart':
        return <LineChart {...iconProps} />;
      case 'PieChart':
        return <PieChart {...iconProps} />;
      case 'Table':
        return <Table {...iconProps} />;
      case 'Building':
        return <Building {...iconProps} />;
      case 'Briefcase':
        return <Briefcase {...iconProps} />;
      case 'Globe':
        return <Globe {...iconProps} />;
      case 'HelpCircle':
        return <HelpCircle {...iconProps} />;
      default:
        return <Box {...iconProps} />;
    }
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);
  
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24",
      "bg-black/60 backdrop-blur-sm"
    )}>
      <div className={cn(
        "w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-xl",
        isDark 
          ? "bg-zinc-900 border border-zinc-800" 
          : "bg-white border border-gray-200"
      )}>
        {/* Search header */}
        <div className={cn(
          "flex items-center px-4 py-3 border-b",
          isDark ? "border-zinc-800" : "border-gray-200"
        )}>
          <Search className={cn(
            "mr-2 h-5 w-5",
            isDark ? "text-zinc-400" : "text-gray-500"
          )} />
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for widgets, pages, clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none py-1 text-base",
              isDark ? "text-white placeholder:text-zinc-500" : "text-gray-900 placeholder:text-gray-400"
            )}
          />
          
          <button
            onClick={onClose}
            aria-label="Close search"
            className={cn(
              "p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Search results */}
        <div
          ref={resultsRef}
          className={cn(
            "overflow-y-auto",
            isDark ? "bg-zinc-900" : "bg-white",
            "max-h-[60vh]"
          )}
        >
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className={cn(
                "animate-pulse text-sm",
                isDark ? "text-zinc-400" : "text-gray-500"
              )}>
                Searching...
              </div>
            </div>
          ) : results.length === 0 && query.length > 1 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className={cn(
                "text-sm mb-1",
                isDark ? "text-zinc-400" : "text-gray-500"
              )}>
                No results found for "{query}"
              </div>
              <div className={cn(
                "text-xs",
                isDark ? "text-zinc-500" : "text-gray-400"
              )}>
                Try a different search term
              </div>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, categoryResults]) => (
              <div key={category}>
                <div className={cn(
                  "px-4 py-2 text-xs font-medium",
                  isDark ? "bg-zinc-800/70 text-zinc-400" : "bg-gray-50 text-gray-500"
                )}>
                  {category}
                </div>
                
                <div>
                  {categoryResults.map((result, index) => {
                    const resultIndex = results.findIndex(r => r.id === result.id);
                    const isSelected = resultIndex === selectedIndex;
                    
                    return (
                      <div
                        id={`search-result-${resultIndex}`}
                        key={result.id}
                        className={cn(
                          "px-4 py-2 flex items-center cursor-pointer transition-colors",
                          isSelected 
                            ? isDark 
                              ? "bg-blue-900/20 text-blue-100" 
                              : "bg-blue-50 text-blue-900"
                            : isDark 
                              ? "hover:bg-zinc-800/70 text-zinc-200" 
                              : "hover:bg-gray-50 text-gray-900"
                        )}
                        onClick={() => handleResultClick(result)}
                      >
                        {renderIcon(result)}
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium truncate",
                            isSelected 
                              ? isDark ? "text-blue-100" : "text-blue-900"
                              : isDark ? "text-zinc-200" : "text-gray-900"
                          )}>
                            {result.title}
                          </div>
                          
                          <div className={cn(
                            "text-xs truncate",
                            isSelected 
                              ? isDark ? "text-blue-300/70" : "text-blue-700/70"
                              : isDark ? "text-zinc-400" : "text-gray-500"
                          )}>
                            {result.description}
                          </div>
                        </div>
                        
                        <ChevronRight size={16} className={cn(
                          "ml-2 flex-shrink-0",
                          isSelected 
                            ? isDark ? "text-blue-400" : "text-blue-600"
                            : isDark ? "text-zinc-600" : "text-gray-400"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Search footer with keyboard shortcuts */}
        <div className={cn(
          "px-4 py-2 text-xs border-t flex justify-between items-center",
          isDark ? "border-zinc-800 text-zinc-500" : "border-gray-200 text-gray-500"
        )}>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className={cn(
                "inline-flex items-center justify-center h-5 w-5 rounded border mr-1 text-center",
                isDark ? "border-zinc-700 bg-zinc-800" : "border-gray-300 bg-gray-100"
              )}>↑</span>
              <span className={cn(
                "inline-flex items-center justify-center h-5 w-5 rounded border mr-1 text-center",
                isDark ? "border-zinc-700 bg-zinc-800" : "border-gray-300 bg-gray-100"
              )}>↓</span>
              to navigate
            </div>
            
            <div className="flex items-center">
              <span className={cn(
                "inline-flex items-center justify-center h-5 px-1 rounded border mr-1 text-center",
                isDark ? "border-zinc-700 bg-zinc-800" : "border-gray-300 bg-gray-100"
              )}>enter</span>
              to select
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={cn(
              "inline-flex items-center justify-center h-5 px-1 rounded border mr-1 text-center",
              isDark ? "border-zinc-700 bg-zinc-800" : "border-gray-300 bg-gray-100"
            )}>esc</span>
            to close
          </div>
        </div>
      </div>
    </div>
  );
} 