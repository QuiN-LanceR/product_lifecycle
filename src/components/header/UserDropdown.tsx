"use client";
import Image from "next/image";
import React, { useState} from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UsersContext";
import toast from 'react-hot-toast';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      toast.success("Berhasil logout!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(`Gagal memuat data produk: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };
  
  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

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
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src={`/images/user/${user?.photo}`}
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.fullname || user?.username || 'User'}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.fullname || user?.username || 'User'}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email || `${user?.username}@company.com`}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/admin/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                  fill=""
                />
              </svg>
              Edit profile
            </DropdownItem>
          </li>
        </ul>
        <button
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300" 
          onClick={handleLogout}
        >
          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.86714 2.246C1.96114 2.15733 2.08507 2.1073 2.21429 2.10586H11.2143C11.3467 2.10586 11.4714 2.15729 11.5614 2.246C11.6037 2.28745 11.6374 2.33684 11.6606 2.39133C11.6837 2.44583 11.6959 2.50436 11.6964 2.56357V3.80043C11.6964 4.01355 11.7811 4.21794 11.9318 4.36864C12.0825 4.51934 12.2869 4.604 12.5 4.604C12.7131 4.604 12.9175 4.51934 13.0682 4.36864C13.2189 4.21794 13.3036 4.01355 13.3036 3.80043V2.56357C13.3036 2.01071 13.0799 1.48357 12.6864 1.09786C12.2924 0.714234 11.7642 0.4997 11.2143 0.5H2.21429C1.66529 0.5 1.13429 0.714715 0.742143 1.09914C0.35 1.48357 0.125 2.012 0.125 2.56486V16.4377C0.125 16.9906 0.348714 17.5164 0.742143 17.9034C1.13557 18.2879 1.66529 18.5013 2.21429 18.5013H11.2143C11.7633 18.5013 12.2943 18.2879 12.6864 17.9021C13.0786 17.5164 13.3036 16.9893 13.3036 16.4364V15.2009C13.3036 14.9877 13.2189 14.7833 13.0682 14.6326C12.9175 14.4819 12.7131 14.3973 12.5 14.3973C12.2869 14.3973 12.0825 14.4819 11.9318 14.6326C11.7811 14.7833 11.6964 14.9877 11.6964 15.2009V16.4377C11.6964 16.5534 11.6489 16.6691 11.5601 16.7553C11.4663 16.8432 11.3429 16.8927 11.2143 16.8941H2.21429C2.08186 16.8941 1.95714 16.8427 1.86714 16.7553C1.82485 16.7138 1.79116 16.6644 1.76799 16.61C1.74483 16.5555 1.73264 16.4969 1.73214 16.4377V2.56357C1.73214 2.44786 1.77843 2.33214 1.86714 2.246ZM12.1927 6.18671C12.0467 6.24836 11.9219 6.35151 11.8339 6.48338C11.7459 6.61525 11.6986 6.77004 11.6977 6.92857V8.69643H6.07143C5.85831 8.69643 5.65392 8.78109 5.50322 8.93179C5.35252 9.08249 5.26786 9.28688 5.26786 9.5C5.26786 9.71312 5.35252 9.91751 5.50322 10.0682C5.65392 10.2189 5.85831 10.3036 6.07143 10.3036H11.6964V12.0714C11.6964 12.2304 11.7435 12.3858 11.8318 12.5179C11.9201 12.6501 12.0456 12.7531 12.1925 12.814C12.3393 12.8748 12.5009 12.8907 12.6568 12.8597C12.8127 12.8287 12.9559 12.7521 13.0683 12.6397L15.6397 10.0683C15.7144 9.99366 15.7736 9.90507 15.814 9.80756C15.8544 9.71006 15.8751 9.60555 15.8751 9.5C15.8751 9.39446 15.8544 9.28995 15.814 9.19244C15.7736 9.09493 15.7144 9.00634 15.6397 8.93172L13.0683 6.36029C12.9558 6.24804 12.8127 6.17164 12.6568 6.14075C12.501 6.10985 12.3395 6.12585 12.1927 6.18671Z" fill=""/>
          </svg>
          LogOut
        </button>
      </Dropdown>
    </div>
  );
}