// components/FilterSidebar.tsx
'use client';

import React from 'react';

// --- Interfaces (Should match API response structure) ---
interface FacetOption {
    value: string;
    display_name?: string; // Use display_name if available
    count?: number;
    data?: Record<string, unknown>; // FIX: Changed 'any' to 'unknown' for better type safety
    // Add other fields if needed
}

interface Facet {
    name: string; // The key used for filtering (e.g., 'brand', 'category')
    display_name?: string; // User-friendly name for the section header
    options?: FacetOption[];
    type?: string; // e.g., 'multiple', 'range', 'single'
    // Add other fields if needed
}

interface FilterSidebarProps {
    // Use Record<string, string | null> for flexibility
    // Keys should match URL params: 'sort_by', 'sort_order', 'filters[brand]', etc.
    currentFilters: Record<string, string | null>;
    facets?: Facet[]; // Array of facets from the API response
    // Ensure handlers expect keys like 'filters[brand]'
    onFilterChange: (filterKey: string, value: string | null) => void;
    onSortChange: (sortBy: string, sortOrder: string) => void;
    onClearAllFilters: () => void; // Function to clear all active filters
    isLoading?: boolean; // Optional: Show loading state for facets
}
// --- End Interfaces ---

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    currentFilters,
    facets = [],
    onFilterChange,
    onSortChange,
    onClearAllFilters,
    isLoading = false,
}) => {

    // Handler for the sort dropdown selection
    const handleSortSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sortBy, sortOrder] = e.target.value.split('|');
        onSortChange(sortBy, sortOrder);
    };

    // Handles changes for checkbox/radio button filters
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        // 'name' will be like 'filters[brand]'
        // For checkboxes, unchecking sends null. For radios, changing selection effectively unchecks others.
        // We always send the *new* value, or null if a checkbox is unchecked.
        onFilterChange(name, checked ? value : (type === 'checkbox' ? null : value));
    };

    // Helper to get the current value for a specific filter key (e.g., 'filters[brand]')
    const getFilterValue = (filterKey: string): string | null => {
        return currentFilters[filterKey] || null;
    }

    // Check if any filters (excluding sort) are currently active
    const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) =>
        key.startsWith('filters[') && value !== null
    );

    // Get current sort values safely, providing defaults
    const currentSortBy = currentFilters['sort_by'] || 'relevance';
    const currentSortOrder = currentFilters['sort_order'] || 'descending';
    const currentSortValue = `${currentSortBy}|${currentSortOrder}`;

    return (
        <aside className="w-full md:w-64 lg:w-72 xl:w-80 flex-shrink-0 pr-4 md:pr-6 lg:pr-8">
            {/* Sticky container for the sidebar content */}
            <div className="sticky top-20 space-y-6 pb-10"> {/* Adjust top offset as needed */}

                {/* Clear Filters Button (only shown if filters are active) */}
                 {hasActiveFilters && (
                    <div className="border-b border-neutral-700 pb-4 mb-4">
                         <button
                            onClick={onClearAllFilters}
                            className="w-full text-center px-3 py-1.5 text-sm border border-neutral-600 rounded hover:bg-neutral-700 transition-colors duration-150 ease-in-out text-neutral-300"
                            aria-label="Clear all active filters"
                         >
                            Clear All Filters
                         </button>
                    </div>
                )}

                {/* Sorting Section */}
                <div>
                    <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-neutral-500">Sort By</h3>
                    <select
                        name="sort"
                        value={currentSortValue} // Combined sort value
                        onChange={handleSortSelection}
                        className="w-full p-2 border border-neutral-700 rounded bg-neutral-900 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                        // Custom dropdown arrow using SVG background
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        aria-label="Sort results by"
                    >
                        {/* Ensure option values match API expectations */}
                        <option value="relevance|descending">Relevance</option>
                        <option value="release_date|descending">Release Date (Newest)</option>
                        <option value="release_date|ascending">Release Date (Oldest)</option>
                        {/* Add price sorting options if your API supports it */}
                        {/* Example: <option value="price|ascending">Price (Low - High)</option> */}
                        {/* Example: <option value="price|descending">Price (High - Low)</option> */}
                    </select>
                </div>

                 {/* Divider */}
                 <div className="border-b border-neutral-800"></div>

                 {/* Loading State for Facets */}
                 {isLoading && (
                    <div className="space-y-4">
                        {/* Skeleton loader for facet sections */}
                        {[...Array(3)].map((_, i) => (
                             <div key={i}>
                                <div className="h-3 bg-neutral-700 rounded w-1/3 mb-3 animate-pulse"></div> {/* Title skeleton */}
                                 <div className="space-y-2">
                                    <div className="h-4 bg-neutral-700 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-neutral-700 rounded w-1/2 animate-pulse"></div>
                                    <div className="h-4 bg-neutral-700 rounded w-5/6 animate-pulse"></div>
                                 </div>
                            </div>
                        ))}
                    </div>
                 )}

                {/* Dynamic Facet Filters */}
                {!isLoading && facets?.map(facet => {
                    // Skip rendering if facet has no options
                    if (!facet.options || facet.options.length === 0) {
                        return null;
                    }
                    // Construct the filter key used in the URL and state (e.g., 'filters[brand]')
                    const filterKey = `filters[${facet.name}]`;

                    return (
                        <div key={facet.name}>
                            {/* Facet Section Header */}
                            <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-neutral-500">
                                {/* Use display_name if available, otherwise format the name */}
                                {facet.display_name || facet.name.replace(/_/g, ' ')}
                            </h3>
                            {/* Facet Options List */}
                            <div className="space-y-1">
                                {facet.options.map(option => (
                                    <label
                                        key={option.value}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        <input
                                            // Determine input type based on facet type (default to checkbox)
                                            type={facet.type === 'single' ? 'radio' : 'checkbox'}
                                            name={filterKey} // Group radios by the filter key
                                            value={option.value}
                                            // Check if this option's value matches the current filter value
                                            checked={getFilterValue(filterKey) === option.value}
                                            onChange={handleCheckboxChange}
                                            className="rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-neutral-900 focus:ring-1 h-4 w-4"
                                        />
                                        <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                                            {/* Use display_name for option if available */}
                                            {option.display_name || option.value}
                                            {/* Show count if available */}
                                            {option.count !== undefined && (
                                                <span className="text-xs text-neutral-500 ml-1">({option.count})</span>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                              {/* Divider after each facet section */}
                              <div className="border-b border-neutral-800 pt-4"></div>
                        </div>
                    );
                })}

                {/* Manual "Recently Released" Checkbox (Example - remove if handled by dynamic facets) */}
                {/* Only show if 'recently_released' is NOT in the dynamic facets and not loading */}
                {!isLoading && !facets.some(f => f.name === 'recently_released') && (
                    <div>
                        <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-neutral-500">Features</h3>
                        <div className="space-y-1">
                            <label className="flex items-center space-x-2 cursor-pointer group text-sm">
                                <input
                                    type="checkbox"
                                    name="filters[recently_released]" // Use standard filter key format
                                    value="true" // Use 'true' or '1' as the value
                                    checked={getFilterValue('filters[recently_released]') === 'true'}
                                    onChange={handleCheckboxChange}
                                    className="rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-neutral-900 focus:ring-1 h-4 w-4"
                                />
                                <span className="text-neutral-300 group-hover:text-white transition-colors">
                                    Recently Released
                                </span>
                            </label>
                        </div>
                         {/* Divider */}
                         <div className="border-b border-neutral-800 pt-4"></div>
                    </div>
                 )}

                {/* Price Range Placeholder (Implement actual UI later) */}
                 {!isLoading && ( // Only show when not loading facets
                     <div>
                        <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-neutral-500">Price</h3>
                        <p className="text-sm text-neutral-500"> (Price filter UI not implemented)</p>
                        {/* TODO: Implement price range slider or input fields here */}
                        {/* Example: <PriceRangeSlider onChange={handlePriceChange} /> */}
                    </div>
                 )}

            </div>
        </aside>
    );
};

export default FilterSidebar;
