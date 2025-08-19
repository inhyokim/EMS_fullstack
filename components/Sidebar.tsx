import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Building, 
  MapPin, 
  Gauge, 
  Upload, 
  Play, 
  AlertTriangle, 
  Bell, 
  Search, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import type { UserRole } from '../App';

interface SidebarProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'operator']
  },
  {
    name: '자원 관리',
    href: '/buildings',
    icon: Building,
    roles: ['admin'],
    children: [
      { name: '건물', href: '/buildings', icon: Building, roles: ['admin'] },
      { name: '구역', href: '/zones', icon: MapPin, roles: ['admin'] },
      { name: '계측기', href: '/meters', icon: Gauge, roles: ['admin'] }
    ]
  },
  {
    name: '데이터 수집',
    href: '/readings',
    icon: Upload,
    roles: ['admin'],
    children: [
      { name: '데이터 업로드', href: '/readings/upload', icon: Upload, roles: ['admin'] },
      { name: '집계 작업', href: '/jobs', icon: Play, roles: ['admin'] }
    ]
  },
  {
    name: '알람 관리',
    href: '/alerts',
    icon: AlertTriangle,
    roles: ['admin', 'operator'],
    children: [
      { name: '알람 규칙', href: '/alert-rules', icon: AlertTriangle, roles: ['admin'] },
      { name: '알람 목록', href: '/alerts', icon: Bell, roles: ['admin', 'operator'] }
    ]
  },
  {
    name: '데이터 탐색',
    href: '/data-explorer',
    icon: Search,
    roles: ['admin', 'operator']
  },
  {
    name: '리포트',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'operator']
  }
];

export function Sidebar({ userRole, onRoleChange, isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole as 'admin' | 'operator')
  );

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300
        ${isOpen ? 'w-64' : 'w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600 mr-2" />
                <div>
                  <div className="font-bold text-gray-900">EMS Lite</div>
                  <div className="text-xs text-gray-500">
                    {userRole === 'admin' ? '관리자' : '운영자'}
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <div className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActiveRoute(item.href) 
                          ? 'text-blue-700 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                        }
                      `}>
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        {isOpen && <span>{item.name}</span>}
                      </div>
                      {isOpen && (
                        <ul className="ml-8 mt-2 space-y-1">
                          {item.children
                            .filter(child => child.roles.includes(userRole as 'admin' | 'operator'))
                            .map((child) => (
                            <li key={child.name}>
                              <Link
                                to={child.href}
                                className={`
                                  flex items-center px-3 py-2 text-sm rounded-md
                                  ${isActiveRoute(child.href)
                                    ? 'text-blue-700 bg-blue-50'
                                    : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <child.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActiveRoute(item.href)
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      {isOpen && <span>{item.name}</span>}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRoleChange(null)}
              className="w-full justify-start text-gray-700 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
              {isOpen && <span>로그아웃</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}