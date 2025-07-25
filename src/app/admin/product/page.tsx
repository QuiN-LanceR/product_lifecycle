import ProductPage from '@/components/product/ProductPage';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function MasterProduct() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Product Catalog" secondTitle="" />
      <div className="space-y-6">
        <ProductPage />;
      </div>
    </div>
  );
}