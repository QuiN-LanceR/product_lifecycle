"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterSegmens from "@/components/tables/segmens/TableMasterSegmens";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";

export default function MasterSegmens() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Segments" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <ComponentCard title="List Segments">
          <TableMasterSegmens
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