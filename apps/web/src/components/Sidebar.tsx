import React from 'react';
import {
  Home,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
  LucideIcon,
  CreditCard,
} from 'lucide-react';
import { IbiriLogo } from '../assets';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: CreditCard, label: 'Credit', href: '/dashboard/credit', className: 'tour-credit-page' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: HelpCircle, label: 'Help', href: '/dashboard/help' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-[84px] border-b">
        <span className="text-xl font-semibold ibiri-logo">
          <IbiriLogo fillColor="#3D4EE3" width={100} height={100} />
        </span>
      </div>
      <nav className="py-6 px-4">
        <ul className="flex flex-col gap-2">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center px-6 py-2 rounded-lg ${item.className || ''} ${
                  pathname === item.href
                    ? 'text-[#2467e3] bg-[#e8f0fc]'
                    : 'text-[#8592ad] hover:text-[#2467e3] hover:bg-[#e8f0fc]'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;