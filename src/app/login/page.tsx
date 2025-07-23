import LogInForm from "@/components/auth/LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Lifecycle",
  description: "Admin page Product LifeCycle PLN ICON +",
};

export default function SignIn() {
  return (
    <>
      <LogInForm />
      <script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        async
        defer
      ></script>
    </>
  );
}
