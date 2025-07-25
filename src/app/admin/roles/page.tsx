"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterRoles from "@/components/tables/roles/TableMasterRoles";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";

export default function MasterRoles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Role" secondTitle="Users Management" />
      <div className="space-y-6">
        <ComponentCard title="List Roles">
          <TableMasterRoles
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