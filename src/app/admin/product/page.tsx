import ProductPage from '@/components/product/ProductPage';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Lifecycle",
  description: "Admin page Product LifeCycle PLN ICON +",
};

export default function MasterProduct() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Master Product" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <ProductPage />;
      </div>
    </div>
  );
}