// /components/common/writeproject/CategorySelect.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import CategoryToggleButton from '@/components/common/button/CategoryToggleButton'; // Assuming correct path

const CATEGORY_SELECT_KEY = 'projectSelectedCategoryIds'; // Key used in PublishButton

interface CategoryMap { id: string; name: string; }
interface SupabaseCategory { category_id: string; category_name: string; }
interface CategorySelectProps { projectId: string; }

export default function CategorySelect({ projectId }: CategorySelectProps) {
    // 1. Load Selected IDs from Local Storage
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(CATEGORY_SELECT_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        }
        return new Set();
    });

    // 2. Persist selected IDs to Local Storage whenever state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CATEGORY_SELECT_KEY, JSON.stringify(Array.from(selectedCategoryIds)));
        }
    }, [selectedCategoryIds]);
    
    // State for fetching all available categories
    const [categories, setCategories] = useState<CategoryMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllCategories = useCallback(async () => {
        // ... (Supabase fetch logic remains the same) ...
        setLoading(true); setError(null);
        try {
          const { data, error: dbError } = await supabase.from('categories').select('category_id, category_name').order('category_name', { ascending: true }); 
          if (dbError) throw dbError;
          const mappedCategories: CategoryMap[] = (data || []).map((item: SupabaseCategory) => ({ id: item.category_id, name: item.category_name, }));
          setCategories(mappedCategories);
          if (mappedCategories.length === 0) setError("No categories available in database.");
        } catch (err: any) { setError(`Failed to load categories: ${err.message}`); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAllCategories(); }, [fetchAllCategories]);

    // 3. Handler to add/remove IDs from the local Set state (Lazy Save Action)
    const handleToggle = useCallback((categoryId: string) => {
        setSelectedCategoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId); // Remove ID
            } else {
                newSet.add(categoryId); // Add ID
            }
            return newSet;
        });
    }, []);

    return (
        <div className="flex flex-col gap-1.5">
            <h4 className="flex items-center gap-1">
                Category<span className="text-main-primary">*</span>
                <span className="detail text-supporting-support ml-2">(Select one or more)</span>
            </h4>
            <div className="flex flex-wrap gap-2">
                {loading ? ( <div className="detail text-center py-2">Loading categories...</div> ) : error ? (
                    <span className="detail text-supporting-error">{error}</span>
                ) : (
                    categories.map((category) => (
                        <CategoryToggleButton 
                            key={category.id} 
                            categoryId={category.id} 
                            categoryName={category.name} 
                            initialActive={selectedCategoryIds.has(category.id)} // Pass active status
                            onToggle={handleToggle} // Pass local state handler
                        />
                    ))
                )}
            </div>
        </div>
    );
}