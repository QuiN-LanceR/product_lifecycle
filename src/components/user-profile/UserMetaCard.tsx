"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useUser } from "@/context/UsersContext";
import Swal from 'sweetalert2';


export default function UserMetaCard() {
  
  const { isOpen, closeModal } = useModal();
  const { user, loading } = useUser();  
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); 

    const fullname = (document.querySelector('input[name="fullname"]') as HTMLInputElement)?.value;
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
    const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
    const file = photoInput?.files?.[0];

    if (!user?.username) {
      Swal.fire({
        icon: 'success',
        title: 'Failed!',
        text: "Username tidak ditemukan",
      });

      return;
    }    

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("fullname", fullname);
    formData.append("email", email);
    
    if (file) formData.append("photo", file);

    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      closeModal();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Updated!',
        });

        setTimeout(() => {
          window.location.reload(); // reload setelah 1.5 detik
        }, 1500);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Gagal!',
          text: data.message || "Terjadi kesalahan",
        });
      }
    } catch (err) {      
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: "Data gagal terkirim",
      });
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-pulse flex items-center">
          <div className="rounded-full bg-gray-300 h-11 w-11 mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={`/images/user/${user?.photo}`}
                alt="user"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.fullname || user?.username || 'User'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.jabatan || 'Position'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <form onSubmit={handleSave}>
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <div className="custom-scrollbar h-[300px] overflow-y-auto px-2">
            <div className="mt-3">
              <h5 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Full Name</Label>
                  <Input type="text" defaultValue={user?.fullname} name="fullname" />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input type="text" defaultValue={user?.email} name="email" />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Photo</Label>
                  <Input type="file" name="photo" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm">
              Save Changes
            </Button>
          </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
