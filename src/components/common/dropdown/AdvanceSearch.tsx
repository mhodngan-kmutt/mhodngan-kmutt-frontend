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

const { categories, certifications, programs } = i18n.t('advanceSearch', { returnObjects: true }) as { categories: string[], certifications: string[], programs: string[] };

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function AdvanceSearch() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Profile Menu">
            <Settings2Icon size={20} />
            <span className="small">Advance search</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[288px] bg-main-white border border-main-neutral p-3 flex flex-col gap-6" align="end">
        <div className='flex items-center gap-3 justify-start'>
            <Settings2Icon size={20} />
            <h4>Advance search</h4>
        </div>
        <div className='flex flex-col gap-4'>

            <div className='flex flex-col gap-1'>
                <span className='large'>Category</span>
                <div className='flex flex-wrap justify-start gap-1'>
                    {categories.map((category) => (
                        <ToggleButton key={category} label={category} className="detail">
                            {category}
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
                                    onSelect={() => setSelectedYear(year)}
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
                        <ToggleButton key={certification} label={certification} className="detail">
                            {certification}
                        </ToggleButton>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-1'>
                <span className='large'>Contributor Program</span>
                <div className='flex flex-wrap justify-start gap-1'>
                    {programs.map((program) => (
                        <ToggleButton key={program} label={program} className="detail">
                            {program}
                        </ToggleButton>
                    ))}
                </div>
            </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
