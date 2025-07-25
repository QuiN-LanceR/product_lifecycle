"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterJabatans from "@/components/tables/jabatans/TableMasterJabatans";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";

export default function MasterJabatans() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Job Positions" secondTitle="Users Management" />
      <div className="space-y-6">
        <ComponentCard title="List Job Positions">
          <TableMasterJabatans
            currentPage={currentPage}
            onTotalChange={(tp) => setTotalPages(tp)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </ComponentCard>
      </div>
    </div>
  );
}