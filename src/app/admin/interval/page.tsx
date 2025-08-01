"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableMasterIntervalStage from "@/components/tables/interval/TableMasterIntervalStage";
import Pagination from "@/components/tables/Pagination";
import React, { useState, useCallback } from "react";

export default function MasterIntervalStage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const handleTotalChange = useCallback((totalPages: number) => {
    setTotalPages(totalPages);
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Master Interval Stage" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <ComponentCard title="List Interval Stage">
          <TableMasterIntervalStage 
            currentPage={currentPage} 
            onTotalChange={handleTotalChange} 
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