// /components/writeProject/CollaboratorSelector.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Searchbar } from '@/components/ui/searchbar'; // ตรวจสอบเส้นทาง import นี้อีกครั้ง
import { X, User, Plus } from 'lucide-react';

// Interfaces สำหรับข้อมูลผู้ใช้และ collaborators
interface UserProfile {
    user_id: string;
    username: string; // 💡 ใช้คอลัมน์ username ตาม Interface
}

interface Collaborator {
    user_id: string;
    username: string; // 💡 ใช้คอลัมน์ username ตาม Interface
}

interface CollaboratorSelectorProps {
    projectId: string; // Project ID สำหรับบันทึกใน project_collaborators
    currentLang: string;
}

const COLLAB_STORAGE_KEY = 'projectCollaborators';

export default function CollaboratorSelector({ projectId, currentLang }: CollaboratorSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
        // ... (Logic โหลด LocalStorage เดิม) ...
        if (typeof window !== 'undefined') {
            const storedCollabs = localStorage.getItem(COLLAB_STORAGE_KEY);
            // 💡 แก้ไขการ map เพื่อให้แน่ใจว่าได้ username
            return storedCollabs ? JSON.parse(storedCollabs) : [];
        }
        return [];
    });
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // ... (useEffect บันทึก LocalStorage และ collaboratorIds useMemo เดิม) ...
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLLAB_STORAGE_KEY, JSON.stringify(collaborators));
        }
    }, [collaborators]);

    const collaboratorIds = useMemo(() => new Set(collaborators.map(c => c.user_id)), [collaborators]);

    // 💡 3. Debounced Search
    const searchUsers = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setSearchError(null);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('user_id, username') 
                .ilike('username', `%${query}%`) 
                .limit(10);

            if (error) throw error;

            // 💡 แก้ไข: Mapping data ให้ตรงกับ UserProfile
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
    }, []);

    // ... (Debounce effect เดิม) ...
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchUsers]);

    // 💡 4. เพิ่ม Collaborator
    const addCollaborator = useCallback(async (user: UserProfile) => {
        if (collaboratorIds.has(user.user_id)) return;

        // 💡 แก้ไข: ใช้ username
        const newCollaborator: Collaborator = { user_id: user.user_id, username: user.username };

        // อัปเดต State และ LocalStorage ทันที
        setCollaborators(prev => [...prev, newCollaborator]);

        try {
            const { error } = await supabase.from('project_collaborators').insert([
                { project_id: projectId, contributor_user_id: user.user_id }
            ]);
            if (error) {
                console.error("Failed to save collab to DB:", error);
            }
        } catch (e) {
            console.error(e);
        }

        // ล้าง search state
        setSearchTerm('');
        setSearchResults([]);
    }, [collaboratorIds, projectId]);

    // 💡 5. ลบ Collaborator
    const removeCollaborator = useCallback(async (userId: string) => {
        // อัปเดต State และ LocalStorage
        setCollaborators(prev => prev.filter(c => c.user_id !== userId));

        // 💡 ลบออกจาก Supabase
        try {
            const { error } = await supabase.from('project_collaborators')
                .delete()
                .match({ project_id: projectId, contributor_user_id: userId });

            if (error) {
                console.error("Failed to delete collab from DB:", error);
            }
        } catch (e) {
            console.error(e);
        }
    }, [projectId]);

    // 1. Ref and state for width
    const searchbarRef = useRef<HTMLInputElement>(null);
    const [inputWidth, setInputWidth] = useState<number>();

    // 2. Measure width after render
    useLayoutEffect(() => {
        if (searchbarRef.current) {
            setInputWidth(searchbarRef.current.clientWidth);
        }
    }, [searchTerm]);

    return (
        <div className="flex flex-col gap-1.5">
            <h4>Collaborators</h4>

            {/* Search Bar สำหรับค้นหาผู้ใช้ */}
            <div className="relative">
                <Searchbar
                    ref={searchbarRef}
                    placeholder="Add collaborators by username"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    componentsColor="white"
                    onSubmit={(e) => e.preventDefault()}
                    className={`
                        w-full 
                        [&_input]:!bg-main-white 
                        [&_input]:border [&_input]:border-main-neutral [&_input]:rounded-md [&_input]:shadow-sm
                        [&_input]:hover:ring-transparent
                        [&_input]:focus-visible:ring-main-neutral [&_input]:focus-visible:ring-[1.5px] [&_input]:focus-visible:border-main-neutral
                    `}
                    lang={currentLang}
                />

                {/* กล่องแสดงผลการค้นหา */}
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
                {/* ... (No users found/Searching UI) ... */}
                {searchTerm.length >= 3 && !loading && searchResults.length === 0 && !searchError && (
                    <div 
                        className="absolute z-10 w-full mt-1 p-3 bg-white border border-main-neutral rounded-md shadow-lg small text-center text-supporting-support"
                        style={inputWidth ? { width: inputWidth } : undefined}
                    >
                        No users found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* แสดงรายชื่อ Collaborators ที่ถูกเพิ่มแล้ว */}
            <div className="flex flex-wrap gap-2 mt-2">
                {collaborators.map(collab => (
                    <div
                        key={collab.user_id}
                        className="flex items-center gap-2 p-2 large bg-main-neutral rounded-full shadow-sm"
                    >
                        <User size={16} className="text-supporting-support" />
                        {/* 💡 แก้ไข: แสดงผล username */}
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

            {searchError && <p className="detail text-supporting-error mt-1">{searchError}</p>}
            {loading && searchTerm.length >= 3 && <p className="detail text-supporting-support mt-1">Searching...</p>}

        </div>
    );
}