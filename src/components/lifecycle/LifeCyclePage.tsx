"use client";
import { useEffect, useState } from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget  from "@/components/ecommerce/MonthlyTarget";
import React from "react";

export default function AdminPage() {
  
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/me")
    .then(res => res.json())
    .then(data => {
      if (user && typeof user === "object") {
        if (!data.authenticated) {
          window.location.href = "/login";
        } else {
          setUser(data.user);
        }
      }
    });
  }, [user]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
        <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Lifecycle Analyst
        </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="w-full lg:w-1/2">
            <MonthlySalesChart />
        </div>
        <div className="w-full lg:w-1/2">
            <MonthlyTarget />
        </div>
        </div>
    </div>
    );

}