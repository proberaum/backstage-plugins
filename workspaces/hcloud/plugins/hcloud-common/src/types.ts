/** Hetzner Cloud server status values */
export type HcloudServerStatus =
  | 'running'
  | 'initializing'
  | 'starting'
  | 'stopping'
  | 'off'
  | 'deleting'
  | 'migrating'
  | 'rebuilding'
  | 'unknown';

/** Server type info (vCPU, memory, disk) */
export interface HcloudServerType {
  id: number;
  name: string;
  description: string;
  cores: number;
  memory: number;
  disk: number;
}

/** Datacenter location */
export interface HcloudLocation {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
}

/** Datacenter info */
export interface HcloudDatacenter {
  id: number;
  name: string;
  description: string;
  location: HcloudLocation;
}

/** IPv4 info */
export interface HcloudIPv4 {
  ip: string;
  blocked: boolean;
}

/** IPv6 info */
export interface HcloudIPv6 {
  ip: string;
  blocked: boolean;
}

/** Public networking */
export interface HcloudPublicNet {
  ipv4: HcloudIPv4;
  ipv6: HcloudIPv6;
  floating_ips: number[];
  firewalls: Array<{ id: number; status: string }>;
}

/** Server image */
export interface HcloudImage {
  id: number;
  type: string;
  name: string | null;
  description: string;
  created: string;
}

/** Protection settings */
export interface HcloudProtection {
  delete: boolean;
  rebuild: boolean;
}

/** Volume info (denormalized from volumes API) */
export interface HcloudVolume {
  id: number;
  name: string;
  size: number;
  format: string | null;
  linux_device: string | null;
}

/** Full server details returned by the backend API */
export interface HcloudServerDetails {
  id: number;
  name: string;
  status: HcloudServerStatus;
  server_type: HcloudServerType;
  datacenter: HcloudDatacenter;
  public_net: HcloudPublicNet;
  image: HcloudImage | null;
  created: string;
  labels: Record<string, string>;
  volumes: HcloudVolume[];
  protection: HcloudProtection;
  backup_window: string | null;
  outgoing_traffic: number | null;
  ingoing_traffic: number | null;
  included_traffic: number;
  load_balancers: number[];
}

/** Valid metric types */
export type HcloudMetricType = 'cpu' | 'disk' | 'network';

/** Valid time range presets */
export type HcloudTimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

/** A single time series */
export interface HcloudTimeSeries {
  name: string;
  values: Array<{ timestamp: number; value: number }>;
}

/** Metrics response from the backend API */
export interface HcloudMetricsResponse {
  type: HcloudMetricType;
  range: HcloudTimeRange;
  start: string;
  end: string;
  step: number;
  timeSeries: HcloudTimeSeries[];
}
