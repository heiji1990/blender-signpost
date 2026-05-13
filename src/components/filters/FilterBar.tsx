import { useState, useEffect } from 'react';
import type { Translations } from '../../i18n/ui';

export interface FilterValues {
  level: string;
  priceType: string;
  category: string;
  query: string;
  blenderVersion: string;
  publishedYear: string;
}

interface Props {
  onFilter: (filters: FilterValues) => void;
  showBlenderVersion?: boolean;
  blenderVersionOptions?: { value: string; label: string }[];
  showPublishedYear?: boolean;
  t: Translations;
}

export default function FilterBar({
  onFilter,
  showBlenderVersion = false,
  blenderVersionOptions = [],
  showPublishedYear = false,
  t,
}: Props) {

  const levelOptions = [
    { value: '', label: t.filter.allLevels },
    { value: 'beginner_zero', label: t.level.beginner_zero },
    { value: 'beginner', label: t.level.beginner },
    { value: 'intermediate', label: t.level.intermediate },
    { value: 'advanced', label: t.level.advanced },
    { value: 'career', label: t.level.career },
    { value: 'hobby', label: t.level.hobby },
  ];

  const priceOptions = [
    { value: '', label: t.filter.allPrice },
    { value: 'free', label: t.filter.freeOnly },
    { value: 'paid', label: t.filter.paidOnly },
  ];

  const categoryOptions = [
    { value: '', label: t.filter.allCategories },
    { value: 'beginner', label: t.category.beginner },
    { value: 'geometry_nodes', label: t.category.geometry_nodes },
    { value: 'cell_look', label: t.category.cell_look },
    { value: 'loop_animation', label: t.category.loop_animation },
    { value: 'character_animation', label: t.category.character_animation },
    { value: 'motion_design', label: t.category.motion_design },
    { value: 'logo_animation', label: t.category.logo_animation },
    { value: 'photorealistic', label: t.category.photorealistic },
    { value: 'product_cg', label: t.category.product_cg },
    { value: 'addon_usage', label: t.category.addon_usage },
    { value: 'freelance', label: t.category.freelance },
    { value: 'sns_portfolio', label: t.category.sns_portfolio },
    { value: 'modeling', label: t.category.modeling },
    { value: 'lighting', label: t.category.lighting },
    { value: 'rigging', label: t.category.rigging },
    { value: 'compositing', label: t.category.compositing },
  ];

  const publishedYearOptions = [
    { value: '', label: t.filter.allYears },
    { value: 'recent', label: t.yearBucket.recent },
    { value: '1y', label: t.yearBucket['1y'] },
    { value: '2y', label: t.yearBucket['2y'] },
    { value: '3y', label: t.yearBucket['3y'] },
    { value: '4y', label: t.yearBucket['4y'] },
  ];

  const [level, setLevel] = useState('');
  const [priceType, setPriceType] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [blenderVersion, setBlenderVersion] = useState('');
  const [publishedYear, setPublishedYear] = useState('');

  useEffect(() => {
    onFilter({ level, priceType, category, query, blenderVersion, publishedYear });
  }, [level, priceType, category, query, blenderVersion, publishedYear]);

  const hasFilter = level || priceType || category || query || blenderVersion || publishedYear;

  const sel = "text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder={t.filter.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={sel}>
          {levelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className={sel}>
          {priceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel}>
          {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {showBlenderVersion && blenderVersionOptions.length > 0 && (
          <select value={blenderVersion} onChange={(e) => setBlenderVersion(e.target.value)} className={sel}>
            <option value="">{t.filter.allVersions}</option>
            {blenderVersionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}

        {showPublishedYear && (
          <select value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} className={sel}>
            {publishedYearOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}

        {hasFilter && (
          <button
            onClick={() => {
              setLevel(''); setPriceType(''); setCategory(''); setQuery('');
              setBlenderVersion(''); setPublishedYear('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            {t.filter.reset}
          </button>
        )}
      </div>
    </div>
  );
}
