import { createApiRef } from "@backstage/core-plugin-api";
import { Dashboard } from "../../../dashboards-common/src";

export interface DashboardsApi {
  getDashboards(): Promise<Dashboard[]>
  getDashboard(name: string): Promise<Dashboard>
}

/** @public */
export const dashboardsApiRef = createApiRef<DashboardsApi>({
  id: 'plugin.dashboards.api',
});
