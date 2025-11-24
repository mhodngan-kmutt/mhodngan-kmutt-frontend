'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2Icon } from 'lucide-react';
import ToggleButton from '../../common/button/ToggleButton';
import { ChevronDown } from 'lucide-react';
import i18n from '@/i18n/i18n';

const { categories, certifications } = i18n.t('advanceSearch', { returnObjects: true }) as { categories: { id: string, name: string }[], certifications: string[], programs: string[] };

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

interface AdvanceSearchProps {
  onCategoryChange?: (categories: string[]) => void;
  onYearChange?: (year: number | null) => void;
  onCertificationChange?: (certifications: string[]) => void;
}

export function AdvanceSearch({ onCategoryChange, onYearChange, onCertificationChange }: AdvanceSearchProps = {}) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string, active: boolean) => {
    const newCategories = active 
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    
    setSelectedCategories(newCategories);
    onCategoryChange?.(newCategories);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  const handleCertificationToggle = (certification: string, active: boolean) => {
    const newCertifications = active
      ? [...selectedCertifications, certification]
      : selectedCertifications.filter(c => c !== certification);
    
    setSelectedCertifications(newCertifications);
    onCertificationChange?.(newCertifications);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Profile Menu">
            <Settings2Icon size={20} />
            <span className="small">Advance search</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[330px] h-[420px] bg-main-white border border-main-neutral p-3 flex flex-col gap-6" align="end">
        <div className='flex items-center gap-3 justify-start'>
            <Settings2Icon size={20} />
            <h4>Advance search</h4>
        </div>
        <div className='flex flex-col gap-4'>

            <div className='flex flex-col gap-1'>
                <span className='large'>Category</span>
                <div className='flex flex-wrap justify-start gap-1'>
                    {categories.map((category) => (
                        <ToggleButton 
                            key={category.id} 
                            label={category.name} 
                            className="detail"
                            isActive={selectedCategories.includes(category.id)}
                            onActiveChange={(active) => handleCategoryToggle(category.id, active)}
                        >
                            {category.name}
                        </ToggleButton>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-1'>
                <span className='large'>Year</span>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="btn-icon px-2 py-1" type="button" aria-label="Select Year">
                                <span className="detail">{selectedYear || 'Select Year'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-main-white border border-main-neutral" align="start">
                            {years.map((year) => (
                                <DropdownMenuItem
                                    key={year}
                                    className="w-full cursor-pointer hover:bg-neutral-100"
                                    onSelect={() => handleYearChange(year)}
                                >
                                    {year}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </div>
            
            <div className='flex flex-col gap-1'>
                <span className='large'>Certification</span>
                <div className='flex flex-wrap justify-start gap-1'>
                    {certifications.map((certification) => (
                        <ToggleButton 
                            key={certification} 
                            label={certification} 
                            className="detail"
                            isActive={selectedCertifications.includes(certification)}
                            onActiveChange={(active) => handleCertificationToggle(certification, active)}
                        >
                            {certification}
                        </ToggleButton>
                    ))}
                </div>
            </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
