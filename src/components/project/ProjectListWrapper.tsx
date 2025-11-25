'use client';

import { useState, useMemo } from 'react';
import type { Project } from '@/lib/api';
import { AdvanceSearch } from '../common/dropdown/AdvanceSearch';
import BigCard from '../common/previewCard/BigCard';

interface Translations {
  certified: string;
  contributors: string;
}

interface ProjectListWrapperProps {
  initialProjects: Project[];
  lang: string;
  translations: Translations;
  searchQuery?: string;
  pageTitle?: string;
  showActions?: boolean;
  token?: string;
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
          <div className="grid gap-6 justify-center grid-cols-[repeat(auto-fit,_minmax(250px,_360px))]">
          {filteredProjects.map((project) => (
            <BigCard 
              key={project.projectId}
              projectImage={project.previewImageUrl}
              title={project.title}
              explanation={project.shortDescription}
              likes={project.likeCount}
              views={project.viewCount}
              professors={project.certifiedBy}
              contributors={project.contributors}
              link={`/${lang}/project/${project.projectId}`}
              showActions={showActions}
              projectId={project.projectId}
              token={token}
              certified={translations.certified}
              contributorsLabel={translations.contributors}
            />
          ))}
        </div>
      )}
    </div>
  );
}
