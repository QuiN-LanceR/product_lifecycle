"use client";

import ToastProvider from '@/components/toast/ToastProvider';
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>      
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <ThemeProvider>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
            {children}
            <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 rounded-tl-3xl rounded-bl-3xl lg:grid bg-gradient-to-b from-[#4791F2] to-[#A2CAFF] items-center hidden">
              <Image 
                src="/images/login/bg-login.svg" 
                alt="Login Background" 
                className="mx-auto w-auto h-auto max-w-[600px] max-h-[600px] object-contain"
                width={600}
                height={600}
              />
            </div>
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </ThemeProvider>
      </div> 
    </ToastProvider>
  );
}
