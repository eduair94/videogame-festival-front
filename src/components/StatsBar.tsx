import { Calendar, Gamepad2, TrendingUp, Trophy } from 'lucide-react';

interface TypeCount {
  type: string;
  count: number;
}

interface StatsBarProps {
  stats: {
    total: number;
    byType: TypeCount[] | Record<string, number>;
    openSubmissions?: number;
    withOpenSubmissions?: number;
  };
}

export default function StatsBar({ stats }: StatsBarProps) {
  // Handle both array and object formats of byType data
  const processedByType: [string, number][] = Array.isArray(stats.byType)
    ? stats.byType.map((item) => [item.type, item.count] as [string, number])
    : Object.entries(stats.byType || {}).map(([key, value]) => [key, typeof value === 'number' ? value : 0] as [string, number]);

  const topTypes = processedByType
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const openCount = stats.openSubmissions ?? stats.withOpenSubmissions ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Gamepad2 className="w-16 h-16 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Events</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </div>

        {/* Open Submissions */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Calendar className="w-16 h-16 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Open Submissions</p>
          <p className="text-3xl font-bold text-white mt-1">{openCount}</p>
        </div>

        {/* Top Type 1 */}
        {topTypes[0] && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Trophy className="w-16 h-16 text-amber-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">{topTypes[0][0]}</p>
            <p className="text-3xl font-bold text-white mt-1">{topTypes[0][1]}</p>
          </div>
        )}

        {/* Top Type 2 */}
        {topTypes[1] && (
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp className="w-16 h-16 text-cyan-400" />
            </div>
            <p className="text-gray-400 text-sm font-medium">{topTypes[1][0]}</p>
            <p className="text-3xl font-bold text-white mt-1">{topTypes[1][1]}</p>
          </div>
        )}
      </div>
    </div>
  );
}