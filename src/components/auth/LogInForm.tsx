"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useEffect, useState } from "react";
import { useNavigateWithLoading } from '@/hooks/useNavigateWithLoading';
import { toast } from 'react-hot-toast';
import Image from "next/image";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { navigateTo } = useNavigateWithLoading();

  useEffect(() => {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaLoaded(true);
          console.log('reCAPTCHA ready');
        });
      }
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaLoaded(true);
          console.log('reCAPTCHA ready');
        });
      } else {
        console.error('reCAPTCHA failed to load');
      }
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup yang lebih efisien
      const cleanup = () => {
        const recaptchaScript = document.querySelector('script[src*="recaptcha/api.js"]');
        if (recaptchaScript?.parentNode) {
          recaptchaScript.parentNode.removeChild(recaptchaScript);
        }
        
        // Batch remove badges
        const badges = document.querySelectorAll('.grecaptcha-badge');
        badges.forEach(badge => badge.remove());
      };
      
      // Delay cleanup untuk menghindari race condition
      setTimeout(cleanup, 100);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    setIsLoading(true);

    const username = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value;

    try {
      // Pastikan grecaptcha sudah dimuat
      if (!recaptchaLoaded || !window.grecaptcha) {
        toast.error("reCAPTCHA belum dimuat, silakan tunggu sebentar");
        setIsLoading(false);
        return;
      }

      // Request reCAPTCHA token
      const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: "login" });
      
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
        navigateTo("/admin");
      } else {
        toast.error(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col flex-1 w-full px-4 sm:px-6 md:px-8 lg:w-1/2">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto relative py-6 sm:py-8 md:py-10">
          <div>
            <div className="mb-3 sm:mb-5 relative text-center sm:text-left">
              <div className="sm:absolute relative mx-auto sm:mx-0 -top-20 sm:-top-30 left-0 mb-4 sm:mb-0">
                <Image
                  src="/images/admin/plniconplus.png"
                  alt="PLC Icon"
                  className="w-20 h-20 sm:w-25 sm:h-25 object-contain"
                  width={250}
                  height={250}
                />
              </div>
              <h2 className="font-bold text-gray-800 text-theme-xl dark:text-gray-400">
                Welcome to
              </h2>
              <h1 className="font-bold text-brand-500 text-base sm:text-title-md dark:text-brand-300 whitespace-nowrap">
                Product Lifecycle Manager
              </h1>
            </div>
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-400 mt-4">
                Masuk ke dashboard anda
              </p>
              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
              </div>
              <form onSubmit={handleLogin}>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <Label>
                      Username <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input placeholder="Username" name="username" />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password" name="password" 
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
                    <Button 
                      type="submit"
                      className="w-full" 
                      size="sm"
                      disabled={isLoading || !recaptchaLoaded}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Memproses...
                        </div>
                      ) : (
                        "Masuk"
                      )}
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