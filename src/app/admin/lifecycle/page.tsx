import LifeCyclePage from "@/components/lifecycle/LifeCyclePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Lifecycle",
  description: "Admin page Product LifeCycle PLN ICON +",
};

export default function Admin() {
  return <LifeCyclePage/>;
}
