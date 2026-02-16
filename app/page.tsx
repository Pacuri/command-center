import { getDashboardSummary } from "@/lib/queries";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getDashboardSummary();
  return <DashboardClient data={data} />;
}
