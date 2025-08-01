"use client";

import React, { useState } from "react";
import TableMasterDevHistori from "@/components/tables/devhistori/TableMasterDevHistori";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";

const DevHistoriPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageBreadcrumb pageTitle="Development History" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <TableMasterDevHistori 
          currentPage={currentPage}
          onTotalChange={(tp) => setTotalPages(tp)}
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default DevHistoriPage;