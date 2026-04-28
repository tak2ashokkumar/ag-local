import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import {
  PUBLIC_CLOUD_ACCOUNT_OPTIONS,
  PUBLIC_CLOUD_ALERT_SIDE_CARDS,
  PUBLIC_CLOUD_ALERT_SUMMARY,
  PUBLIC_CLOUD_ALERT_TREND_LEGEND,
  PUBLIC_CLOUD_ALERT_TREND_STACK_GROUPS,
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN,
  PUBLIC_CLOUD_CRITICAL_ALERTS,
  PUBLIC_CLOUD_DATABASE_LATENCY_BADGES,
  PUBLIC_CLOUD_DATABASE_PERFORMANCE,
  PUBLIC_CLOUD_HIGH_ERROR_WORKLOADS,
  PUBLIC_CLOUD_HIGH_LATENCY_WORKLOADS,
  PUBLIC_CLOUD_PLATFORM_OPTIONS,
  PUBLIC_CLOUD_PROVIDER_DISTRIBUTION,
  PUBLIC_CLOUD_REGION_HEATMAP,
  PUBLIC_CLOUD_REGION_OPTIONS,
  PUBLIC_CLOUD_SUMMARY_METRICS,
  PUBLIC_CLOUD_TAGS,
  PUBLIC_CLOUD_TICKET_PRIORITY,
  PUBLIC_CLOUD_TICKET_STATUS,
  PUBLIC_CLOUD_TICKETS,
  PUBLIC_CLOUD_TICKETS_TOTAL,
  PUBLIC_CLOUD_UTILIZATION_ROWS
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSideCard,
  PublicCloudAlertSummaryMetric,
  PublicCloudAlertTrendBarGroup,
  PublicCloudAlertTrendLegendItem,
  PublicCloudComputeBreakdownProvider,
  PublicCloudCriticalAlert,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDatabaseLatencyBadge,
  PublicCloudFilterOption,
  PublicCloudHeatmapGroup,
  PublicCloudHorizontalBarItem,
  PublicCloudPlatform,
  PublicCloudProviderDistributionItem,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudTagItem,
  PublicCloudTicketDonutItem,
  PublicCloudTicketRow,
  PublicCloudUtilizationRow,
  PublicCloudUtilizationViewRow
} from './public-cloud-compute-dashboard.type';

@Injectable()
export class PublicCloudComputeDashboardService {

  constructor(private builder: FormBuilder) { }

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(platforms: PublicCloudFilterOption[], regions: PublicCloudRegionOption[], accounts: PublicCloudAccountOption[]): FormGroup {
    return this.builder.group({
      platforms: [platforms || []],
      regions: [regions || []],
      accounts: [accounts || []]
    });
  }

  getPlatformOptions(): PublicCloudFilterOption[] {
    return PUBLIC_CLOUD_PLATFORM_OPTIONS.filter(option => option.value !== PUBLIC_CLOUD_ALL_SELECTED_VALUE);
  }

  getPlatforms(): Observable<PublicCloudFilterOption[]> {
    return of(this.getPlatformOptions());
  }

  getRegions(platforms: string[]): Observable<PublicCloudRegionOption[]> {
    return of(this.getRegionsForPlatforms(platforms));
  }

  getAccounts(platforms: string[], regions: string[]): Observable<PublicCloudAccountOption[]> {
    return of(this.getAccountsForSelection(platforms, regions));
  }

  getRegionsForPlatforms(platforms?: string[]): PublicCloudRegionOption[] {
    if (!platforms) {
      return PUBLIC_CLOUD_REGION_OPTIONS;
    }
    const selectedPlatforms = this.getSelectedPlatforms(platforms);
    if (!selectedPlatforms.length) {
      return [];
    }
    return PUBLIC_CLOUD_REGION_OPTIONS.filter(region =>
      region.platforms.some(platform => selectedPlatforms.includes(platform))
    );
  }

  getAccountsForSelection(platforms?: string[], regions?: string[]): PublicCloudAccountOption[] {
    const selectedPlatforms = platforms ? this.getSelectedPlatforms(platforms) : [];
    const selectedRegions = regions ? this.getSelectedValues(regions) : [];
    if ((platforms && !selectedPlatforms.length) || (regions && !selectedRegions.length)) {
      return [];
    }
    return PUBLIC_CLOUD_ACCOUNT_OPTIONS.filter(account => {
      const matchesPlatform = !selectedPlatforms.length || selectedPlatforms.includes(account.platform);
      const matchesRegion = !selectedRegions.length || selectedRegions.includes(account.region);
      return matchesPlatform && matchesRegion;
    });
  }

  private getSelectedValues(values: string[]): string[] {
    return (values || []).filter(value => value && value !== PUBLIC_CLOUD_ALL_SELECTED_VALUE);
  }

  private getSelectedPlatforms(values: string[]): PublicCloudPlatform[] {
    return this.getSelectedValues(values) as PublicCloudPlatform[];
  }
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Executive Summary / Cloud Inventory Widget Related -------------------
   */
  getSummaryMetrics(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudSummaryMetric[]> {
    return of(PUBLIC_CLOUD_SUMMARY_METRICS);
  }

  convertToSummaryMetricsViewData(data: PublicCloudSummaryMetric[]): PublicCloudSummaryMetric[] {
    return data || [];
  }

  getProviderDistribution(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProviderDistributionItem[]> {
    return of(PUBLIC_CLOUD_PROVIDER_DISTRIBUTION);
  }

  convertToProviderDistributionViewData(data: PublicCloudProviderDistributionItem[]): PublicCloudProviderDistributionItem[] {
    return data || [];
  }

  convertToProviderDistributionOptions(data: PublicCloudProviderDistributionItem[]): EChartsOption {
    return this.getProviderDistributionOptions(data || []);
  }

  private getProviderDistributionOptions(items: PublicCloudProviderDistributionItem[]): EChartsOption {
    return {
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%'
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: items.map(item => ({
            name: `${item.name} ${item.value}%`,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  getTags(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudTagItem[]> {
    return of(PUBLIC_CLOUD_TAGS);
  }

  convertToTagsViewData(data: PublicCloudTagItem[]): PublicCloudTagItem[] {
    return data || [];
  }

  getRegionHeatmap(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHeatmapGroup[]> {
    return of(PUBLIC_CLOUD_REGION_HEATMAP);
  }

  convertToRegionHeatmapOptions(data: PublicCloudHeatmapGroup[]): EChartsOption {
    return this.getRegionHeatmapOptions(data || []);
  }

  private getRegionHeatmapOptions(groups: PublicCloudHeatmapGroup[]): EChartsOption {
    const cells = groups.reduce((items: any[], group) => {
      group.children.forEach(child => {
        items.push({
          name: child.name,
          region: group.name,
          value: [child.x, child.y, child.width, child.height],
          usage: child.usage,
          color: group.color
        });
      });
      return items;
    }, []);
    const labels = groups.map(group => ({
      name: group.name,
      value: [group.labelX, group.labelY]
    }));

    return {
      animation: false,
      tooltip: {
        formatter: (info: any) => {
          const data = info.data || {};
          const region = data.region ? String(data.region).replace(/\n/g, ' ') : '';
          return data.usage ? `${region}<br/>${data.name}<br/>${data.usage}` : `${region}<br/>${data.name}`;
        }
      },
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        inverse: true,
        show: false
      },
      series: [
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = cells[params.dataIndex];
            const start = api.coord([item.value[0], item.value[1]]);
            const end = api.coord([item.value[0] + item.value[2], item.value[1] + item.value[3]]);
            const width = end[0] - start[0];
            const height = end[1] - start[1];

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: start[0],
                    y: start[1],
                    width,
                    height
                  },
                  style: {
                    fill: item.color,
                    stroke: 'rgba(255, 255, 255, 0.35)',
                    lineWidth: 1
                  }
                },
                {
                  type: 'text',
                  silent: true,
                  style: {
                    text: item.name,
                    x: start[0] + width / 2,
                    y: start[1] + height / 2,
                    fill: '#26313b',
                    font: '8px Arial',
                    textAlign: 'center',
                    textVerticalAlign: 'middle'
                  }
                }
              ]
            };
          },
          data: cells
        },
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          silent: true,
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = labels[params.dataIndex];
            const point = api.coord(item.value);

            return {
              type: 'text',
              style: {
                text: item.name,
                x: point[0],
                y: point[1],
                fill: '#26313b',
                font: '8px Arial',
                textAlign: 'left',
                textVerticalAlign: 'top'
              }
            };
          },
          data: labels
        }
      ]
    };
  }
  /*
   * ******End ****** Executive Summary / Cloud Inventory Widget Related ********************
   */

  /*
   * -----Start----- Compute Breakdown Widget Related -------------------
   */
  getComputeBreakdown(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudComputeBreakdownProvider[]> {
    return of(PUBLIC_CLOUD_COMPUTE_BREAKDOWN);
  }

  convertToComputeBreakdownViewData(data: PublicCloudComputeBreakdownProvider[]): PublicCloudComputeBreakdownProvider[] {
    return data || [];
  }
  /*
   * ******End ****** Compute Breakdown Widget Related ********************
   */

  /*
   * -----Start----- Performance Hotspots Widget Related -------------------
   */
  getUtilizationRows(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudUtilizationRow[]> {
    return of(PUBLIC_CLOUD_UTILIZATION_ROWS);
  }

  convertToUtilizationRowsViewData(data: PublicCloudUtilizationRow[]): PublicCloudUtilizationViewRow[] {
    return (data || []).map(row => this.convertToUtilizationViewRow(row));
  }

  private convertToUtilizationViewRow(row: PublicCloudUtilizationRow): PublicCloudUtilizationViewRow {
    return {
      ...row,
      cpuChartOptions: this.getSparklineOptions(row.cpuSeries, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      memoryChartOptions: this.getSparklineOptions(row.memorySeries, '#6aa544', 'rgba(106, 165, 68, 0.28)')
    };
  }

  private getSparklineOptions(data: number[], lineColor: string, areaColor: string): EChartsOption {
    return {
      animation: false,
      grid: { top: 2, right: 1, bottom: 2, left: 1 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((_, index) => index)
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 100
      },
      series: [
        {
          type: 'line',
          data: data,
          symbol: 'none',
          smooth: false,
          lineStyle: {
            width: 1.5,
            color: lineColor
          },
          areaStyle: {
            color: areaColor
          }
        }
      ]
    };
  }
  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  /*
   * -----Start----- Performance / Workload Insights Widget Related -------------------
   */
  getLatencyWorkloads(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_HIGH_LATENCY_WORKLOADS);
  }

  convertToLatencyWorkloadOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 900);
  }

  getErrorRateWorkloads(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_HIGH_ERROR_WORKLOADS);
  }

  convertToErrorRateWorkloadOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 9);
  }

  getDatabasePerformance(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_DATABASE_PERFORMANCE);
  }

  convertToDatabasePerformanceOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 100);
  }

  getDatabaseLatencyBadges(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseLatencyBadge[]> {
    return of(PUBLIC_CLOUD_DATABASE_LATENCY_BADGES);
  }

  convertToDatabaseLatencyBadgesViewData(data: PublicCloudDatabaseLatencyBadge[]): PublicCloudDatabaseLatencyBadge[] {
    return data || [];
  }

  private getHorizontalBarOptions(items: PublicCloudHorizontalBarItem[], max: number): EChartsOption {
    return {
      animation: false,
      grid: { top: 4, right: 36, bottom: 0, left: 104 },
      xAxis: {
        type: 'value',
        show: false,
        max: max
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#55616d',
          fontSize: 10
        },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          barGap: '-100%',
          silent: true,
          itemStyle: {
            color: '#eef1f3',
            borderRadius: 4
          },
          data: items.map(() => max)
        },
        {
          type: 'bar',
          barWidth: 8,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => items[params.dataIndex].label,
            color: '#2e3338',
            fontSize: 10
          },
          itemStyle: {
            borderRadius: 4,
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.value)
        }
      ]
    };
  }
  /*
   * ******End ****** Performance / Workload Insights Widget Related ********************
   */

  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */
  getAlertSummaryMetrics(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertSummaryMetric[]> {
    return of(PUBLIC_CLOUD_ALERT_SUMMARY);
  }

  convertToAlertSummaryMetricsViewData(data: PublicCloudAlertSummaryMetric[]): PublicCloudAlertSummaryMetric[] {
    return data || [];
  }

  getCriticalAlerts(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudCriticalAlert[]> {
    return of(PUBLIC_CLOUD_CRITICAL_ALERTS);
  }

  convertToCriticalAlertsViewData(data: PublicCloudCriticalAlert[]): PublicCloudCriticalAlert[] {
    return data || [];
  }

  getAlertTrendLegend(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertTrendLegendItem[]> {
    return of(PUBLIC_CLOUD_ALERT_TREND_LEGEND);
  }

  convertToAlertTrendLegendViewData(data: PublicCloudAlertTrendLegendItem[]): PublicCloudAlertTrendLegendItem[] {
    return data || [];
  }

  convertToAlertTrendPolarOptions(data: PublicCloudAlertTrendLegendItem[]): EChartsOption {
    return this.getAlertTrendPolarOptions(data || []);
  }

  private getAlertTrendPolarOptions(items: PublicCloudAlertTrendLegendItem[]): EChartsOption {
    return {
      color: items.map(item => item.color),
      angleAxis: {
        type: 'category',
        data: items.map(item => item.name),
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      radiusAxis: {
        min: 0,
        max: 900,
        splitNumber: 9,
        axisLabel: {
          color: '#6f7882',
          fontSize: 9
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      polar: {
        radius: '78%',
        center: ['50%', '50%']
      },
      series: [
        {
          type: 'bar',
          coordinateSystem: 'polar',
          roundCap: false,
          data: items.map(item => ({
            value: item.value,
            itemStyle: {
              color: item.color,
              borderColor: item.color.replace('0.35', '1'),
              opacity: 0.75
            }
          }))
        }
      ]
    };
  }

  getAlertTrendStackGroups(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertTrendBarGroup[]> {
    return of(PUBLIC_CLOUD_ALERT_TREND_STACK_GROUPS);
  }

  convertToAlertTrendStackOptions(data: PublicCloudAlertTrendBarGroup[]): EChartsOption {
    return this.getAlertTrendStackOptions(data || []);
  }

  private getAlertTrendStackOptions(groups: PublicCloudAlertTrendBarGroup[]): EChartsOption {
    const categories = groups.map(group => group.name);
    const names = ['Critical', 'Warning', 'Informative'];
    const colors = ['#d90000', '#ff8a00', '#3f92d7'];
    return {
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      grid: { top: 12, right: 8, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLabel: { color: '#3c4650', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        max: 900,
        splitLine: { lineStyle: { color: '#e5e9ed' } },
        axisLabel: { color: '#6f7882', fontSize: 10 }
      },
      series: names.map((name, index) => ({
        name: name,
        type: 'bar',
        stack: 'total',
        barWidth: 54,
        itemStyle: { color: colors[index] },
        data: groups.map(group => group.values[index])
      }))
    };
  }

  getAlertSideCards(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertSideCard[]> {
    return of(PUBLIC_CLOUD_ALERT_SIDE_CARDS);
  }

  convertToAlertSideCardsViewData(data: PublicCloudAlertSideCard[]): PublicCloudAlertSideCard[] {
    return data || [];
  }
  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  /*
   * -----Start----- ITSM Tickets Widget Related -------------------
   */
  getTicketPriority(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudTicketDonutItem[]> {
    return of(PUBLIC_CLOUD_TICKET_PRIORITY);
  }

  convertToTicketPriorityOptions(data: PublicCloudTicketDonutItem[]): EChartsOption {
    return this.getTicketDonutOptions(data || [], 'Tickets by Priority');
  }

  getTicketStatus(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudTicketDonutItem[]> {
    return of(PUBLIC_CLOUD_TICKET_STATUS);
  }

  convertToTicketStatusOptions(data: PublicCloudTicketDonutItem[]): EChartsOption {
    return this.getTicketDonutOptions(data || [], 'Tickets by Status');
  }

  getTickets(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudTicketRow[]> {
    return of(PUBLIC_CLOUD_TICKETS);
  }

  convertToTicketsViewData(data: PublicCloudTicketRow[]): PublicCloudTicketRow[] {
    return data || [];
  }

  getTicketsTotal(_criteria?: PublicCloudDashboardFilterCriteria): Observable<number> {
    return of(PUBLIC_CLOUD_TICKETS_TOTAL);
  }

  private getTicketDonutOptions(items: PublicCloudTicketDonutItem[], title: string): EChartsOption {
    return {
      animation: false,
      title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 11,
          fontWeight: 600,
          color: '#4d5966'
        }
      },
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: {
        type: 'plain',
        bottom: 0,
        left: 'center',
        itemWidth: 7,
        itemHeight: 7,
        textStyle: {
          fontSize: 8,
          color: '#566270'
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '46%'],
          label: {
            formatter: '{c}',
            color: '#ffffff',
            fontSize: 8
          },
          labelLine: { show: false },
          data: items.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }
  /*
   * ******End ****** ITSM Tickets Widget Related ********************
   */
}
