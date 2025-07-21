"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Script from "next/script";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = (document.querySelector('input[placeholder="Username"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[placeholder="Enter your password"]') as HTMLInputElement)?.value;

    // request reCAPTCHA token
    const token = await grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: "login" });
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, token }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      toast.success("Login berhasil!");
      router.push("/admin");
    } else {
      toast.error(data.message || "Login gagal");
    }

  };
  
  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="beforeInteractive"
      />
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto relative">
          <div className="absolute top-10 left-4 flex items-center gap-2">
            <img
              src="/images/login/icon-login.png"
              alt="PLC Icon"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-gray-700 dark:text-white">
              PLC Manager
            </span>
          </div>
          <div>
            <div className="mb-3 sm:mb-5 text-center">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Product Lifecycle <br /> Manager
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Masuk ke dashboard anda
              </p>
            </div>
            <div>
              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
              </div>
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Username <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input placeholder="Username" />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Tetap masuk
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button className="w-full" size="sm">
                      Masuk
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
