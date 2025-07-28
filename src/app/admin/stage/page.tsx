"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterStages from "@/components/tables/stages/TableMasterStages";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";

export default function MasterStages() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Stages" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <ComponentCard title="List Stages">
          <TableMasterStages
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