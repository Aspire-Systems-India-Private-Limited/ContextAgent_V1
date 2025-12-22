import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Settings, TrendingUp } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/cost-metrics/aggregated', label: 'Cost Metrics', icon: DollarSign },
    { path: '/metrics/performance', label: 'Performance', icon: TrendingUp },
    { path: '/agent/sol-001/agent-001', label: 'Agent Details', icon: Users },
    { path: '/agent/agent-001/config', label: 'Configuration', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#333]">Agent Operations Platform</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={isActive ? {
                    background: 'linear-gradient(to right, #8B5CF6 0%, #06B6D4 100%)',
                  } : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    isActive
                      ? 'text-white font-medium shadow-md'
                      : 'text-[#666] hover:bg-[#f8f9fa] hover:text-[#333]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
