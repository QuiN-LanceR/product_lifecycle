"use client";

import React from "react";
import { UserProvider } from "@/context/UsersContext";
import { useSidebar } from "@/context/SidebarContext";
import ToastProvider from '@/components/toast/ToastProvider';
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { TourProvider } from '@/components/tour/TourProvider';
import { TourButton } from '@/components/tour/TourButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ToastProvider>
      <UserProvider>
        <TourProvider>
          <div className="min-h-screen xl:flex">
            {/* Sidebar and Backdrop */}
            <AppSidebar />
            <Backdrop />
            {/* Main Content Area */}
            <div
              className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
            >
              {/* Header */}
              <AppHeader />
              {/* Page Content */}
              <div className="p-4 md:p-6">{children}</div>
            </div>
          </div>
          {/* Tour Button */}
          <TourButton />
        </TourProvider>
      </UserProvider>   
    </ToastProvider>
  );
}