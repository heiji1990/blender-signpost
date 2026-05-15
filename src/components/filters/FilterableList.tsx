import { useState } from 'react';
import FilterBar from './FilterBar';
import type { FilterValues } from './FilterBar';
import { useTranslations as getTranslations } from '../../i18n/ui';
import type { Lang } from '../../i18n/ui';

interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: string;
  platform: string;
  priceType: string;
  creator: string;
  level: string[];
  categories: string[];
  summary: string;
  affiliateUrl?: string;
  isAffiliate?: boolean;
  isPr?: boolean;
  duration?: string;
  publishedAt?: string;
  blenderVersion?: string;
}

const platformIcons: Record<string, string> = {
  youtube: '▶️', udemy: '🎓', coloso: '🎨', note: '📝', gumroad: '💜',
  blender_market: '🛒', booth: '🏪', official: '📖', x: '🐦', instagram: '📸',
  web: '🌐', addon: '🔧', book: '📚',
};

function getYearBucket(publishedAt: string | undefined | null): string | null {
  if (!publishedAt) return null;
  if (/^\d{4}-\d{2}/.test(publishedAt)) {
    const ms = Date.now() - new Date(publishedAt).getTime();
    const years = ms / (1000 * 60 * 60 * 24 * 365.25);
    if (years < 1) return 'recent';
    if (years < 2) return '1y';
    if (years < 3) return '2y';
    if (years < 4) return '3y';
    return '4y';
  }
  return null;
}

function Card({ item, t, base }: { item: ContentItem; t: ReturnType<typeof useTranslations>; base: string }) {
  const linkUrl = item.isAffiliate && item.affiliateUrl ? item.affiliateUrl : item.url;

  const levelLabels: Record<string, string> = {
    beginner_zero: t.level.beginner_zero,
    beginner: t.level.beginner,
    intermediate: t.level.intermediate,
    advanced: t.level.advanced,
    career: t.level.career,
    hobby: t.level.hobby,
  };
  const platformLabels: Record<string, string> = {
    youtube: t.platform.youtube, udemy: t.platform.udemy, coloso: t.platform.coloso,
    note: t.platform.note, gumroad: t.platform.gumroad, blender_market: t.platform.blender_market,
    booth: t.platform.booth, official: t.platform.official, x: t.platform.x,
    instagram: t.platform.instagram, web: t.platform.web, addon: t.platform.addon, book: t.platform.book,
  };
  const categoryLabels: Record<string, string> = {
    beginner: t.category.beginner, geometry_nodes: t.category.geometry_nodes,
    cell_look: t.category.cell_look, loop_animation: t.category.loop_animation,
    character_animation: t.category.character_animation, motion_design: t.category.motion_design,
    logo_animation: t.category.logo_animation, photorealistic: t.category.photorealistic,
    product_cg: t.category.product_cg, addon_usage: t.category.addon_usage,
    freelance: t.category.freelance, sns_portfolio: t.category.sns_portfolio,
    modeling: t.category.modeling, lighting: t.category.lighting,
    rigging: t.category.rigging, compositing: t.category.compositing,
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{platformIcons[item.platform] ?? '🔗'}</span>
          <span className="text-xs text-gray-500">{platformLabels[item.platform] ?? item.platform}</span>
          {item.isPr && <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">{t.card.pr}</span>}
          {item.isAffiliate && !item.isPr && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{t.card.affiliate}</span>}
        </div>
        <span className={item.priceType === 'free'
          ? 'bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full'
          : 'bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full'
        }>
          {item.priceType === 'free' ? t.card.free : t.card.paid}
        </span>
      </div>

      <a href={`${base}/${item.type}s/${item.id}`}>
        <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-700 line-clamp-2 leading-snug">
          {item.title}
        </h3>
      </a>

      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.summary}</p>

      <div className="flex flex-wrap gap-1 mt-auto">
        {item.level.slice(0, 2).map((l) => (
          <span key={l} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
            {levelLabels[l] ?? l}
          </span>
        ))}
        {item.duration && (
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">⏱ {item.duration}</span>
        )}
        {item.blenderVersion && (
          <span className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">🟠 {item.blenderVersion}</span>
        )}
        {item.publishedAt && (
          <span className="text-xs text-gray-400">
            {/^\d{4}-\d{2}/.test(item.publishedAt) ? item.publishedAt.slice(0, 7) : item.publishedAt}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {item.categories.slice(0, 3).map((cat) => (
          <span key={cat} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md">
            {categoryLabels[cat] ?? cat}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-gray-500">{item.creator}</span>
        <a
          href={linkUrl}
          target="_blank"
          rel={item.isAffiliate ? 'nofollow noopener noreferrer' : 'noopener noreferrer'}
          className="text-xs font-medium text-blue-700 hover:text-blue-500"
        >
          {t.card.view}
        </a>
      </div>
    </article>
  );
}

interface Props {
  items: ContentItem[];
  showBlenderVersion?: boolean;
  showPublishedYear?: boolean;
  showCreator?: boolean;
  lang?: Lang;
}

export default function FilterableList({
  items,
  showBlenderVersion = false,
  showPublishedYear = false,
  showCreator = false,
  lang = 'ja',
}: Props) {
  const t = getTranslations(lang);
  const base = lang === 'en' ? '/en' : '';

  const [filters, setFilters] = useState<FilterValues>({
    level: '', priceType: '', category: '', creator: '', query: '', blenderVersion: '', publishedYear: '',
  });

  const creatorOptions = [...new Set(items.map((i) => i.creator).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((c) => ({ value: c, label: c }));

  const blenderVersionOptions = (() => {
    const versions = [...new Set(
      items.map((item) => item.blenderVersion).filter((v): v is string => !!v)
    )].sort((a, b) => {
      const [ma, pa = 0] = a.split('.').map(Number);
      const [mb, pb = 0] = b.split('.').map(Number);
      return ma !== mb ? ma - mb : pa - pb;
    });
    return versions.map((v) => ({ value: v, label: `Blender ${v}` }));
  })();

  const filtered = items.filter((item) => {
    if (filters.level && !item.level.includes(filters.level)) return false;
    if (filters.priceType && item.priceType !== filters.priceType) return false;
    if (filters.category && !item.categories.includes(filters.category)) return false;
    if (filters.creator && item.creator !== filters.creator) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.creator.toLowerCase().includes(q)) return false;
    }
    if (filters.blenderVersion && item.blenderVersion !== filters.blenderVersion) return false;
    if (filters.publishedYear) {
      const bucket = getYearBucket(item.publishedAt);
      if (bucket !== filters.publishedYear) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <FilterBar
        onFilter={setFilters}
        showBlenderVersion={showBlenderVersion}
        blenderVersionOptions={blenderVersionOptions}
        showPublishedYear={showPublishedYear}
        showCreator={showCreator}
        creatorOptions={creatorOptions}
        t={t}
      />
      <p className="text-sm text-gray-500">{filtered.length}{t.filter.results}</p>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>{t.filter.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => <Card key={item.id} item={item} t={t} base={base} />)}
        </div>
      )}
    </div>
  );
}
