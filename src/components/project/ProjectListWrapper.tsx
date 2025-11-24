'use client';

import { useState, useMemo } from 'react';
import type { Project, Contributor, Professor } from '@/lib/api';
import { AdvanceSearch } from '../common/dropdown/AdvanceSearch';
import { Heart, Eye } from 'lucide-react';
import AvatarGroup from '../common/Avatar/AvatarGroup';
import { ProjectActionsDropdown } from '../common/dropdown/ProjectActionsDropdown';

interface Translations {
  certified: string;
  contributors: string;
}

interface ProjectListWrapperProps {
  initialProjects: Project[];
  lang: string;
  translations: Translations;
  searchQuery?: string;
  pageTitle?: string; // Optional custom title (e.g., "My Projects")
  showActions?: boolean; // Show edit/delete actions
  token?: string; // Auth token for actions
}

interface BigCardProps {
  project: Project;
  lang: string;
  translations: Translations;
  showActions?: boolean;
  token?: string;
}

function BigCard({ project, lang, translations, showActions, token }: BigCardProps) {
  return (
    <a href={`/${lang}/project/${project.projectId}`} className="block hover:shadow-lg transition-shadow rounded-xl">
      <div className="w-[360px] flex flex-col gap-3 p-2.5 rounded-xl bg-main-white shadow-[0_0_16px_0_rgba(0,0,0,0.06)]">
        <div className="relative h-[160px] w-full rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={project.previewImageUrl || '/images/mocks/ProjectImageMocks-2.png'}
            alt={project.title}
            className="w-full h-full object-cover object-center rounded-xl transition duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="w-full pl-1.5 pr-4 overflow-hidden">
          <h4 className="truncate">{project.title}</h4>
        </div>
        <div className="w-full pl-1.5 pr-4">
          <div className="text-supporting-support h-[50px] line-clamp-2">{project.shortDescription}</div>
        </div>
        <div className="w-full flex justify-between items-center px-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" color="var(--color-supporting-light-orange)" />
              <div className="subtle text-supporting-support">{project.likeCount}</div>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" color="var(--color-supporting-light-orange)" />
              <div className="subtle text-supporting-support">{project.viewCount}</div>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {project.certifiedBy.length > 0 && (
              <>
                <div className="detail text-supporting-support">{translations.certified}</div>
                <div className="flex justify-center -space-x-5">
                  <AvatarGroup contributors={project.certifiedBy} className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex px-4 py-3 rounded-xl border-2 border-main-background h-[72px]">
          <div className="flex w-full gap-2.5">
            <AvatarGroup contributors={project.contributors} />
            <div className="w-full gap-1">
              <div className="small">{translations.contributors}</div>
              <div className="detail text-supporting-support">@cpe, kmutt</div>
            </div>
          </div>
          {showActions && token && (
            <ProjectActionsDropdown projectId={project.projectId} token={token} />
          )}
        </div>
      </div>
    </a>
  );
}

export function ProjectListWrapper({ initialProjects, lang, translations, searchQuery, pageTitle, showActions, token }: ProjectListWrapperProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  // Client-side filtering logic
  const filteredProjects = useMemo(() => {
    let filtered = [...initialProjects];

    // Filter by categories (OR logic - project must have at least one selected category)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(project =>
        project.categories.some(cat => selectedCategories.includes(cat.categoryId))
      );
    }

    // Filter by year (exact match on creation year)
    if (selectedYear !== null) {
      filtered = filtered.filter(project => {
        const projectYear = new Date(project.createdAt).getFullYear();
        return projectYear === selectedYear;
      });
    }

    // Filter by certification (OR logic - check if project has certifications)
    if (selectedCertifications.length > 0) {
      filtered = filtered.filter(project => {
        const isCertified = project.certifiedBy && project.certifiedBy.length > 0;
        return selectedCertifications.some(cert => {
          if (cert.toLowerCase().includes('certified') && !cert.toLowerCase().includes('not')) {
            return isCertified;
          } else {
            return !isCertified;
          }
        });
      });
    }

    return filtered;
  }, [initialProjects, selectedCategories, selectedYear, selectedCertifications]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-between items-center">
        <h2>
          {searchQuery ? (
            <>
              <span>Result for </span>
              <span className="text-main-primary">"{searchQuery}"</span>
            </>
          ) : (
            <span>{pageTitle || 'All Projects'}</span>
          )}
        </h2>
        <AdvanceSearch
          onCategoryChange={setSelectedCategories}
          onYearChange={setSelectedYear}
          onCertificationChange={setSelectedCertifications}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10">
          <img src={'https://i.postimg.cc/v8xM1Ds5/dizzy-Duck-Image.png'} alt={'dizzyDuckImage'} width="300" />
          <h3 className=" text-main-neutral2 mt-10">No results</h3>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {filteredProjects.map((project) => (
            <BigCard 
              key={project.projectId} 
              project={project} 
              lang={lang} 
              translations={translations}
              showActions={showActions}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
}
