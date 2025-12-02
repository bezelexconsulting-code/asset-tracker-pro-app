'use client';

import { StatsCard } from '../ui/stats-card';

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

interface StatsOverviewProps {
  stats: StatItem[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {stat.icon && (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <div className="text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  {stat.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{stat.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  {stat.trend && (
                    <div className={`flex items-center space-x-1 text-xs font-medium ${
                      stat.trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      <svg className={`w-3 h-3 ${stat.trend.isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9 3 3" />
                      </svg>
                      <span>{Math.abs(stat.trend.value)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="w-12 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded opacity-60 group-hover:opacity-80 transition-opacity">
                  {/* Mini chart placeholder */}
                  <div className="w-full h-full flex items-end justify-center space-x-0.5 p-1">
                    <div className="w-1 bg-blue-400 rounded-full" style={{ height: '60%' }}></div>
                    <div className="w-1 bg-blue-400 rounded-full" style={{ height: '40%' }}></div>
                    <div className="w-1 bg-blue-400 rounded-full" style={{ height: '80%' }}></div>
                    <div className="w-1 bg-blue-500 rounded-full" style={{ height: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}