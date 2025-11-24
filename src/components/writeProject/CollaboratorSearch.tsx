// /components/writeProject/CollaboratorSelector.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Searchbar } from '@/components/ui/searchbar';
import { X, User, Plus } from 'lucide-react';

// --------------------------- Interfaces ---------------------------
interface UserProfile {
    user_id: string;
    username: string;
}

interface Collaborator {
    user_id: string;
    username: string;
}

interface CollaboratorSelectorProps {
    projectId: string;
    currentLang: string;
}

// ------------------------ Local Storage Key ------------------------
const COLLAB_STORAGE_KEY = 'projectCollaborators';

// ---------------------- Main Component -----------------------------
export default function CollaboratorSelector({ projectId, currentLang }: CollaboratorSelectorProps) {
    // -------------------- States --------------------
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(COLLAB_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Store current user ID to exclude from search results
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // -------------------- Effects --------------------
    // Fetch current user ID on mount
    useEffect(() => {
        async function fetchUserId() {
            const user = (await supabase.auth.getUser()).data.user;
            setCurrentUserId(user ? user.id : null);
        }
        fetchUserId();
    }, []);

    // Persist collaborators to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLLAB_STORAGE_KEY, JSON.stringify(collaborators));
        }
    }, [collaborators]);

    // -------------------- Memoized Data --------------------
    const collaboratorIds = useMemo(() => new Set(collaborators.map(c => c.user_id)), [collaborators]);

    // -------------------- Search Users --------------------
    const searchUsers = useCallback(async (query: string) => {
        if (query.length < 3 || !currentUserId) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setSearchError(null);

        try {
            // Query users matching the search term
            let queryBuilder = supabase
                .from('users')
                .select('user_id, username')
                .ilike('username', `%${query}%`)
                .limit(10);

            // Exclude current user
            queryBuilder = queryBuilder.neq('user_id', currentUserId);

            const { data, error } = await queryBuilder;
            if (error) throw error;

            const users: UserProfile[] = (data as any[] || []).map(item => ({
                user_id: item.user_id,
                username: item.username,
            }));

            setSearchResults(users);
        } catch (err: any) {
            console.error('Search error:', err);
            setSearchError('Failed to search users.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchUsers]);

    // -------------------- Handlers --------------------
    // Add collaborator
    const addCollaborator = useCallback(async (user: UserProfile) => {
        if (collaboratorIds.has(user.user_id)) return;

        const newCollab: Collaborator = { user_id: user.user_id, username: user.username };
        setCollaborators(prev => [...prev, newCollab]);

        try {
            const { error } = await supabase.from('project_collaborators').insert([
                { project_id: projectId, contributor_user_id: user.user_id }
            ]);
            if (error) console.error("Failed to save collab to DB:", error);
        } catch (e) {
            console.error(e);
        }

        setSearchTerm('');
        setSearchResults([]);
    }, [collaboratorIds, projectId]);

    // Remove collaborator
    const removeCollaborator = useCallback(async (userId: string) => {
        setCollaborators(prev => prev.filter(c => c.user_id !== userId));

        try {
            const { error } = await supabase.from('project_collaborators')
                .delete()
                .match({ project_id: projectId, contributor_user_id: userId });

            if (error) console.error("Failed to delete collab from DB:", error);
        } catch (e) {
            console.error(e);
        }
    }, [projectId]);

    // -------------------- Searchbar Width --------------------
    const searchbarRef = useRef<HTMLInputElement>(null);
    const [inputWidth, setInputWidth] = useState<number>();
    useLayoutEffect(() => {
        if (searchbarRef.current) setInputWidth(searchbarRef.current.clientWidth);
    }, [searchTerm]);

    // -------------------- JSX --------------------
    return (
        <div className="flex flex-col gap-1.5">
            <h4>Collaborators</h4>

            {/* Search Bar */}
            <div className="relative">
                <Searchbar
                    ref={searchbarRef}
                    placeholder="Add collaborators by username"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    componentsColor="white"
                    onSubmit={e => e.preventDefault()}
                    className={`
                        w-full 
                        [&_input]:!bg-main-white 
                        [&_input]:border [&_input]:border-main-neutral [&_input]:rounded-md [&_input]:shadow-sm
                        [&_input]:hover:ring-transparent
                        [&_input]:focus-visible:ring-main-neutral [&_input]:focus-visible:ring-[1.5px] [&_input]:focus-visible:border-main-neutral
                    `}
                    lang={currentLang}
                />

                {/* Search Results */}
                {searchTerm.length >= 3 && !loading && searchResults.length > 0 && (
                    <div
                        className="absolute z-10 mt-1 bg-white border border-main-neutral rounded-md shadow-lg max-h-48 overflow-y-auto"
                        style={inputWidth ? { width: inputWidth } : undefined}
                    >
                        {searchResults.map(user => (
                            <div
                                key={user.user_id}
                                className={`flex justify-between items-center pl-10 pr-4 py-2 cursor-pointer hover:bg-main-neutral ${collaboratorIds.has(user.user_id) ? 'bg-main-neutral opacity-70 cursor-default' : ''}`}
                                onClick={() => !collaboratorIds.has(user.user_id) && addCollaborator(user)}
                            >
                                <p className="text-base font-normal">{user.username}</p>
                                <Plus size={16} className={collaboratorIds.has(user.user_id) ? 'text-gray-500' : 'text-main-primary'} />
                            </div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {searchTerm.length >= 3 && !loading && searchResults.length === 0 && !searchError && (
                    <div 
                        className="absolute z-10 w-full mt-1 p-3 bg-white border border-main-neutral rounded-md shadow-lg small text-center text-supporting-support"
                        style={inputWidth ? { width: inputWidth } : undefined}
                    >
                        No users found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Added Collaborators */}
            <div className="flex flex-wrap gap-2 mt-2">
                {collaborators.map(collab => (
                    <div
                        key={collab.user_id}
                        className="flex items-center gap-2 p-2 large bg-main-neutral rounded-full shadow-sm"
                    >
                        <User size={16} className="text-supporting-support" />
                        <span className="small font-medium">{collab.username}</span>
                        <button
                            onClick={() => removeCollaborator(collab.user_id)}
                            className="p-0.5 rounded-full transition"
                            aria-label={`Remove ${collab.username}`}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Status Messages */}
            {searchError && <p className="detail text-supporting-error mt-1">{searchError}</p>}
            {loading && searchTerm.length >= 3 && <p className="detail text-supporting-support mt-1">Searching...</p>}
        </div>
    );
}