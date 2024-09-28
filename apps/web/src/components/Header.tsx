'use client';

import React from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ibiri/components';
import { Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-[84px] bg-white border-l border-b px-6">
      <div className="flex justify-between items-center h-full">
        <div>
          <h4 className="text-2xl font-bold">Hello {user?.firstName} 👋🏼</h4>
          <p className="text-sm text-[#8592ad]">
            Spend Wisely, Score Higher, Live Better
          </p>
        </div>
        <div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
