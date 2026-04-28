import { EChartsOption } from 'echarts';

export type PublicCloudPlatform = 'aws' | 'azure' | 'gcp' | 'oracle';
export type PublicCloudStatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface PublicCloudFilterOption {
  value: string;
  label: string;
}

export interface PublicCloudRegionOption extends PublicCloudFilterOption {
  platforms: PublicCloudPlatform[];
}

export interface PublicCloudAccountOption extends PublicCloudFilterOption {
  platform: PublicCloudPlatform;
  region: string;
}

export interface PublicCloudDashboardFilterCriteria {
  platforms: string[];
  regions: string[];
  accounts: string[];
}

export interface PublicCloudSummaryMetric {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudProviderDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudTagItem {
  name: string;
  count: string;
  textColor: string;
  backgroundColor: string;
}

export interface PublicCloudHeatmapGroup {
  name: string;
  color: string;
  labelX: number;
  labelY: number;
  children: PublicCloudHeatmapItem[];
}

export interface PublicCloudHeatmapItem {
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  usage?: string;
}

export interface PublicCloudComputeBreakdownProvider {
  name: string;
  displayName: string;
  brandClass: string;
  logoPath: string;
  stats: PublicCloudComputeBreakdownStat[];
}

export interface PublicCloudComputeBreakdownStat {
  name: string;
  value: number;
}

export interface PublicCloudStorageUtilization {
  capacity: string;
  used: string;
  free: string;
  percent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudDiskIops {
  label: string;
  percent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudUtilizationRow {
  name: string;
  cpuSeries: number[];
  cpuStatus: number;
  cpuTone: PublicCloudStatusTone;
  memorySeries: number[];
  memoryStatus: number;
  memoryTone: PublicCloudStatusTone;
  storage: PublicCloudStorageUtilization;
  diskIops: PublicCloudDiskIops;
  upTime: string;
}

export interface PublicCloudUtilizationViewRow extends PublicCloudUtilizationRow {
  cpuChartOptions: EChartsOption;
  memoryChartOptions: EChartsOption;
}

export interface PublicCloudHorizontalBarItem {
  name: string;
  value: number;
  label: string;
  color: string;
}

export interface PublicCloudDatabaseLatencyBadge {
  name: string;
  value: string;
  textColor: string;
  backgroundColor: string;
}

export interface PublicCloudAlertSummaryMetric {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudCriticalAlert {
  id: string;
  deviceName: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export interface PublicCloudAlertTrendLegendItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudAlertTrendBarGroup {
  name: string;
  values: number[];
}

export interface PublicCloudAlertSideMetric {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudAlertSideCard {
  title: string;
  value: string;
  metrics: PublicCloudAlertSideMetric[];
}

export interface PublicCloudTicketDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudTicketRow {
  id: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}
