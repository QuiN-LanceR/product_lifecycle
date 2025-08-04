"use client";

import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import ChangePasswordModal from "@/components/user-profile/ChangePasswordModal";
import ActivityLogModal from "@/components/user-profile/ActivityLogModal";
import React from "react";
import { User, Settings, Shield, Activity } from "lucide-react";

import { useModal } from "@/hooks/useModal";

export default function Profile() {
  const { isOpen: isPasswordModalOpen, openModal: openPasswordModal, closeModal: closePasswordModal } = useModal();
  const { isOpen: isActivityModalOpen, openModal: openActivityModal, closeModal: closeActivityModal } = useModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 lg:p-6">
      {/* Header Section with Gradient Background */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 via-brand-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white lg:text-4xl">
                Profile Settings
              </h1>
              <p className="text-white/80 mt-1">
                Kelola informasi personal dan pengaturan akun Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50 dark:backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Account Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Akun Anda aktif dan terverifikasi
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50 dark:backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                Online
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Activity Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Terakhir aktif hari ini
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50 dark:backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                Updated
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Profile Complete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Semua informasi telah lengkap
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Meta Card - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <UserMetaCard />
          </div>
        </div>

        {/* User Info Card - Takes 2 columns */}
        <div className="xl:col-span-2">
          <UserInfoCard />
          
          {/* Additional Settings Card */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-brand-100 p-3 dark:bg-brand-900/30">
                <Settings className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Quick Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pengaturan cepat untuk akun Anda
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={openPasswordModal}
                className="group cursor-pointer rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-brand-900/20 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2 group-hover:bg-brand-100 dark:bg-gray-700 dark:group-hover:bg-brand-900/30">
                    <Shield className="h-5 w-5 text-gray-600 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Security
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ubah password
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={openActivityModal}
                className="group cursor-pointer rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:hover:border-brand-600 dark:hover:bg-brand-900/20 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2 group-hover:bg-brand-100 dark:bg-gray-700 dark:group-hover:bg-brand-900/30">
                    <Activity className="h-5 w-5 text-gray-600 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Activity Log
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lihat aktivitas
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={closePasswordModal} />
      <ActivityLogModal isOpen={isActivityModalOpen} onClose={closeActivityModal} />
    </div>
  );
}