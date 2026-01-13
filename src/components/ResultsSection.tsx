import { Users, User, Heart, TrendingDown, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  colorClass: string;
}

function StatCard({ icon: Icon, label, value, colorClass }: StatCardProps) {
  return (
    <div className="group p-5 md:p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div
          className={cn(
            'p-3 md:p-4 rounded-2xl transition-transform group-hover:scale-110',
            colorClass
          )}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
      <div className="text-xl md:text-3xl font-extrabold mb-1 md:mb-2">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

interface ResultsSectionProps {
  children: React.ReactNode;
  totalCount: number;
  filteredCount: number;
  stats: {
    following: number;
    followers: number;
    mutuals: number;
    notFollowingBack: number;
  };
}

export function ResultsSection({
  children,
  totalCount,
  filteredCount,
  stats,
}: ResultsSectionProps) {
  const { t } = useTranslation('results');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <StatCard
          icon={Users}
          label={t('stats.following')}
          value={stats.following}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={User}
          label={t('stats.followers')}
          value={stats.followers}
          colorClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={Heart}
          label={t('badges.mutuals')}
          value={stats.mutuals}
          colorClass="bg-indigo-500/10 text-indigo-500"
        />
        <StatCard
          icon={TrendingDown}
          label={t('stats.notFollowing')}
          value={stats.notFollowingBack}
          colorClass="bg-rose-500/10 text-rose-500"
        />
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Left Sidebar - Filters */}
        <aside className="md:w-72 shrink-0">{children}</aside>

        {/* Right Content - Account List */}
        <main className="flex-grow rounded-4xl border border-border bg-card shadow-sm">
          {/* Account list will be rendered here via composition */}
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-4">
              {t('header.showing', {
                filtered: filteredCount.toLocaleString(),
                total: totalCount.toLocaleString(),
              })}
            </div>
            {/* Account list component will be inserted here */}
          </div>
        </main>
      </div>
    </div>
  );
}
