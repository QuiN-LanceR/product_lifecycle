"use client";

import React, { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { useDevHistori } from "../../../hooks/useDevHistori";
import { Modal } from "../../ui/modal";
import Button from "@/components/ui/button/Button";
import AddDevHistoriForm from "../../devhistori/AddDevHistoriForm";
import EditDevHistoriForm from "../../devhistori/EditDevHistoriForm";
import DevHistoriSearchBar from "../../devhistori/DevHistoriSearchBar";
import DevHistoriTableHeader from "../../devhistori/DevHistoriTableHeader";
import DevHistoriTableRow from "../../devhistori/DevHistoriTableRow";
import DevHistoriSkeleton from "../../devhistori/DevHistoriSkeleton";
import { useUser } from "@/context/UsersContext";
import { DevHistori, TableMasterDevHistoriProps } from "../../../types/devhistori.types";
import DevHistoriImportModal from "../../devhistori/DevHistoriImportModal";

export default function TableMasterDevHistori({ currentPage, onTotalChange }: TableMasterDevHistoriProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useUser();
  const [editingDevHistori, setEditingDevHistori] = useState<DevHistori | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = () => {
    fetchDevHistoris();
    setIsImportModalOpen(false);
  };

  const {
    devHistoris,
    loading,
    searchQuery,
    setSearchQuery,
    setDebouncedSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    handleDelete,
    fetchDevHistoris
  } = useDevHistori(currentPage, onTotalChange);

  const currentRole = user?.role;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleAdd = () => {
    setEditingDevHistori(null);
    openModal();
  };

  const handleEdit = (devHistori: DevHistori) => {
    setEditingDevHistori(devHistori);
    openModal();
  };

  const handleSuccess = () => {
    fetchDevHistoris();
    closeModal();
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setIsDescriptionModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Master Development History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola data riwayat pengembangan produk
            </p>
          </div>
          {(currentRole == "Admin") && (
            <div className="flex items-center gap-3">
              <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
                Tambah Data
              </Button>
              <Button onClick={handleImport} className="bg-emerald-600 hover:bg-emerald-700">
                Import Data
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <DevHistoriSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
        />

        {/* Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700" style={{minWidth: '500px'}}>
              <DevHistoriTableHeader
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <DevHistoriSkeleton />
                ) : devHistoris.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Belum ada data development history
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian Anda.' : 'Mulai dengan menambahkan data development history baru.'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  devHistoris.map((devHistori, index) => (
                    <DevHistoriTableRow
                      key={devHistori.id}
                      devHistori={devHistori}
                      index={index}
                      currentPage={currentPage}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDescription={handleViewDescription}
                      currentRole={currentRole}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl">
          <div className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingDevHistori ? "Edit Product Development History" : "Tambah Product Development History"}
            </h2>
            {editingDevHistori ? (
              <EditDevHistoriForm
                devHistori={editingDevHistori}
                onSuccess={handleSuccess}
                onCancel={closeModal}
              />
            ) : (
              <AddDevHistoriForm
                onSuccess={handleSuccess}
                onCancel={closeModal}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Description Modal */}
      <Modal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
      >
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {selectedDescription}
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setIsDescriptionModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
      {/* Import Modal */}
      <DevHistoriImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </>
  );
}