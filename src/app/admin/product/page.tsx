import ProductPage from '@/components/product/ProductPage';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function MasterProduct() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Master Product" secondTitle="Product Catalog" />
      <div className="space-y-6">
        <ProductPage />
      </div>
    </div>
  );
}