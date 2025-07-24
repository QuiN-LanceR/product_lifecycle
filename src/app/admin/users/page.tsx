"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterUsers from "@/components/tables/TableMasterUsers";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";

export default function MasterUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Users" secondTitle="Users Management" />
      <div className="space-y-6">
        <ComponentCard title="List Users">
          <TableMasterUsers
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
