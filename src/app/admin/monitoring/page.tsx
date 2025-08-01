import MonitoringPage from '@/components/monitoring/MonitoringPage';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function Monitoring() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Monitoring" secondTitle="" />
      <div className="space-y-6">
        <MonitoringPage />
      </div>
    </div>
  );
}