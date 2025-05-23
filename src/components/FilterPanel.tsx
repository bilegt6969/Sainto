'use client'
import React from 'react';
import { Sliders, X } from 'lucide-react';

interface ApiFacetOption {
  status?: string;
  count: number;
  display_name: string;
  value: string;
  data?: Record<string, unknown>; // Changed any to unknown
}

interface ApiFacet {
  display_name: string;
  name: string;
  type: string;
  options: ApiFacetOption[];
  hidden: boolean;
  data: Record<string, unknown>; // Changed any to unknown
}

type SelectedFilters = Record<string, string[]>;

interface FilterPanelProps {
  filters: ApiFacet[];
  selectedFilters: SelectedFilters;
  onFilterChange: (facetName: string, optionValue: string) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  selectedFilters,
  onFilterChange, // Now used
  onClearFilters,
  isLoading,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  return (
    <>
      {/* Mobile Filter Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium mb-4 border border-neutral-700"
      >
        <Sliders size={16} />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 bg-blue-600 text-white text-xs h-5 w-5 flex items-center justify-center">
            {Object.values(selectedFilters).flat().length}
          </span>
        )}
      </button>

      {/* Desktop Filter Panel */}
      <aside className="hidden md:block w-64 lg:w-72 p-5 bg-black border border-neutral-800 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders size={18} />
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              disabled={isLoading}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:text-neutral-600 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>

        {isLoading && filters.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 w-32 bg-neutral-800 mb-2"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-neutral-800"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filters.length === 0 && (
          <div className="text-sm text-neutral-500 p-2 bg-neutral-900">
            No filters available
          </div>
        )}

        <div className="space-y-6">
          {filters.map((facet) => (
            facet.options?.length > 0 && (
              <div key={facet.name} className="filter-group">
                <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center justify-between">
                  <span>{facet.display_name.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-normal text-neutral-500">
                    {selectedFilters[facet.name]?.length > 0 && `(${selectedFilters[facet.name]?.length} selected)`}
                  </span>
                </h3>
                <ul className="space-y-2">
                  {facet.options.map((option) => {
                    const isSelected = selectedFilters[facet.name]?.includes(option.value);
                    return (
                      <li key={`${facet.name}-${option.value}`}>
                        <label
                          className={`flex items-center group ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !isLoading && onFilterChange(facet.name, option.value)}
                        >
                          <div className={`relative h-4 w-4 border flex items-center justify-center mr-3 
                            ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-neutral-900 border-neutral-600 group-hover:border-blue-500'}`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center text-white">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className={`text-sm flex-1 ${isSelected ? 'text-blue-400 font-medium' : 'text-neutral-300 group-hover:text-white'}`}>
                            {option.display_name}
                          </span>
                          <span className="text-xs text-neutral-500 ml-2">{option.count}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          ))}
        </div>
      </aside>

      {/* Mobile Filter Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto md:hidden">
          <div className="flex min-h-full">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />

            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-black border-l border-neutral-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders size={18} />
                  Filters
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {filters.map((facet) => (
                  facet.options?.length > 0 && (
                    <div key={facet.name} className="filter-group">
                      <h3 className="text-sm font-semibold text-neutral-300 mb-3">
                        {facet.display_name.replace(/_/g, ' ')}
                      </h3>
                      <ul className="space-y-3">
                        {facet.options.map((option) => {
                          const isSelected = selectedFilters[facet.name]?.includes(option.value);
                          return (
                            <li key={`${facet.name}-${option.value}`}>
                              <label
                                className={`flex items-center ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={() => !isLoading && onFilterChange(facet.name, option.value)}
                              >
                                <div className={`relative h-5 w-5 border flex items-center justify-center mr-3 
                                  ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-neutral-900 border-neutral-600 hover:border-blue-500'}`}
                                >
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <span className={`text-sm flex-1 ${isSelected ? 'text-blue-400 font-medium' : 'text-neutral-300'}`}>
                                  {option.display_name}
                                </span>
                                <span className="text-xs text-neutral-500 ml-2">{option.count}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )
                ))}
              </div>

              <div className="sticky bottom-0 border-t border-neutral-800 bg-black p-4 flex gap-3">
                <button
                  onClick={() => {
                    onClearFilters();
                    setMobileOpen(false);
                  }}
                  className="flex-1 py-3 border border-neutral-700 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
                  disabled={!hasActiveFilters || isLoading}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-group {
          padding-bottom: 1rem;
          border-bottom: 1px solid #1f1f1f; /* Softer border for dark mode */
        }
        .filter-group:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
      `}</style>
    </>
  );
};

export default FilterPanel;