"use client";

import { Toaster } from "react-hot-toast";
import React from "react";

type ToastProviderProps = {
  children: React.ReactNode;
};

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
