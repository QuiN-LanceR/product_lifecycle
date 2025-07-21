import LogInForm from "@/components/auth/LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Lifecycle",
  description: "Admin page Product LifeCycle PLN ICON +",
};

export default function SignIn() {
  return <LogInForm />;
}
