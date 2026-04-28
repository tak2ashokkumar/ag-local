import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { DataCenterTabs } from 'src/app/united-cloud/datacenter/tabs';
import {
  UNIFIED_AIOPS_ALERT_LEGEND,
  UNIFIED_AIOPS_ALERT_REDUCTION_METRICS,
  UNIFIED_AIOPS_ALERT_RESPONSE_METRICS,
  UNIFIED_AIOPS_ALERT_SEGREGATION_ITEMS,
  UNIFIED_AIOPS_ALERT_SOURCES,
  UNIFIED_AIOPS_ALL_SELECTED_VALUE,
  UNIFIED_AIOPS_AI_GPU_METRICS,
  UNIFIED_AIOPS_APPLICATION_ROWS,
  UNIFIED_AIOPS_BUSINESS_SERVICES,
  UNIFIED_AIOPS_CRITICAL_ALERTS,
  UNIFIED_AIOPS_DATABASE_ROWS,
  UNIFIED_AIOPS_DATACENTER_INFRASTRUCTURE,
  UNIFIED_AIOPS_DATACENTER_OPTIONS,
  UNIFIED_AIOPS_DISCOVERY_ITEMS,
  UNIFIED_AIOPS_EMPLOYEE_METRICS,
  UNIFIED_AIOPS_GEO_HEATMAP,
  UNIFIED_AIOPS_KUBERNETES_METRICS,
  UNIFIED_AIOPS_OS_ROWS,
  UNIFIED_AIOPS_PERFORMANCE_METRICS,
  UNIFIED_AIOPS_PRIVATE_CLOUD_COVERAGE,
  UNIFIED_AIOPS_PUBLIC_CLOUD_COVERAGE,
  UNIFIED_AIOPS_REMEDIATION_METRICS,
  UNIFIED_AIOPS_REMEDIATION_SUMMARY,
  UNIFIED_AIOPS_SERVICE_ROWS,
  UNIFIED_AIOPS_SUMMARY_METRICS,
  UNIFIED_AIOPS_TICKETS
} from './unified-aiops-command-centre.const';
import {
  UnifiedAiopsAlertRow,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsFilterOption,
  UnifiedAiopsHeatmapGroup,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsStackItem,
  UnifiedAiopsTableRow,
  UnifiedAiopsTicketRow
} from './unified-aiops-command-centre.type';

@Injectable()
export class UnifiedAiopsCommandCentreService {
  constructor(private builder: FormBuilder,
    private datacenterService: DatacenterService) { }

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(datacenters: UnifiedAiopsFilterOption[]): FormGroup {
    return this.builder.group({
      datacenters: [datacenters || []]
    });
  }

  getDatacenters(): Observable<UnifiedAiopsFilterOption[]> {
    return this.datacenterService.getDataCenters().pipe(
      map(datacenters => this.getDatacenterFilterOptions(datacenters))
    );
  }

  getFallbackDatacenters(): UnifiedAiopsFilterOption[] {
    return this.getDatacenterFilterOptions([]);
  }

  private getDatacenterFilterOptions(datacenters: DataCenterTabs[]): UnifiedAiopsFilterOption[] {
    const options = (datacenters || [])
      .filter(datacenter => datacenter && datacenter.uuid && datacenter.name)
      .map(datacenter => ({ value: datacenter.uuid, label: datacenter.name }));

    return options.length
      ? options
      : UNIFIED_AIOPS_DATACENTER_OPTIONS.filter(option => option.value !== UNIFIED_AIOPS_ALL_SELECTED_VALUE);
  }
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Executive Monitoring Summary Widget Related -------------------
   */
  getSummaryMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_SUMMARY_METRICS);
  }

  convertToMetricsViewData(data: UnifiedAiopsMetric[]): UnifiedAiopsMetric[] {
    return data || [];
  }
  /*
   * ******End ****** Executive Monitoring Summary Widget Related ********************
   */

  /*
   * -----Start----- Device Discovery vs Monitoring Enablement Widget Related -------------------
   */
  getDiscoveryItems(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsStackItem[]> {
    return of(UNIFIED_AIOPS_DISCOVERY_ITEMS);
  }

  convertToDiscoveryOptions(data: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getDiscoveryOptions(data || []);
  }

  private getDiscoveryOptions(items: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getStackedBarOptions(
      items,
      ['Monitored', 'Not Monitored'],
      ['#16a052', '#dfe3e8'],
      300
    );
  }
  /*
   * ******End ****** Device Discovery vs Monitoring Enablement Widget Related ********************
   */

  /*
   * -----Start----- Alert Segregation by Type Widget Related -------------------
   */
  getAlertSegregationLegend(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsLegendMetric[]> {
    return of(UNIFIED_AIOPS_ALERT_LEGEND);
  }

  convertToLegendMetricsViewData(data: UnifiedAiopsLegendMetric[]): UnifiedAiopsLegendMetric[] {
    return data || [];
  }

  getAlertSegregationItems(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsStackItem[]> {
    return of(UNIFIED_AIOPS_ALERT_SEGREGATION_ITEMS);
  }

  convertToAlertSegregationOptions(data: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getAlertSegregationOptions(data || []);
  }

  private getAlertSegregationOptions(items: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getStackedBarOptions(
      items,
      ['Critical', 'Warning', 'Info'],
      ['#5572c6', '#92cf75', '#ffc95d'],
      22
    );
  }
  /*
   * ******End ****** Alert Segregation by Type Widget Related ********************
   */

  private getStackedBarOptions(items: UnifiedAiopsStackItem[], names: string[], colors: string[], max: number): EChartsOption {
    const categories = items.map(item => item.name).reverse();
    const reversedItems = [...items].reverse();

    return {
      color: colors,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 7,
        textStyle: { color: '#627283', fontSize: 10 }
      },
      grid: { left: 86, right: 18, top: 12, bottom: 28 },
      xAxis: {
        type: 'value',
        max,
        axisLabel: { color: '#758394', fontSize: 9 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#5e6b78', fontSize: 9 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: names.map((name, index) => ({
        name,
        type: 'bar',
        stack: 'total',
        barWidth: 16,
        label: {
          show: true,
          position: 'inside',
          color: index === 1 && names.length === 2 ? '#56616d' : '#ffffff',
          fontSize: 8,
          formatter: (params: any) => params.value ? params.value : ''
        },
        emphasis: { focus: 'series' },
        data: reversedItems.map(item => item.values[index])
      }))
    };
  }

  /*
   * -----Start----- Business Services Widget Related -------------------
   */
  getBusinessServices(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsBusinessService[]> {
    return of(UNIFIED_AIOPS_BUSINESS_SERVICES);
  }

  convertToBusinessServicesViewData(data: UnifiedAiopsBusinessService[]): UnifiedAiopsBusinessService[] {
    return data || [];
  }
  /*
   * ******End ****** Business Services Widget Related ********************
   */

  /*
   * -----Start----- Employee / Digital Experience Widget Related -------------------
   */
  getEmployeeMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_EMPLOYEE_METRICS);
  }
  /*
   * ******End ****** Employee / Digital Experience Widget Related ********************
   */

  /*
   * -----Start----- Geo Distribution / Global Operations Widget Related -------------------
   */
  getGeoHeatmap(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsHeatmapGroup[]> {
    return of(UNIFIED_AIOPS_GEO_HEATMAP);
  }

  convertToGeoHeatmapOptions(data: UnifiedAiopsHeatmapGroup[]): EChartsOption {
    return this.getGeoHeatmapOptions(data || []);
  }

  private getGeoHeatmapOptions(groups: UnifiedAiopsHeatmapGroup[]): EChartsOption {
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
    const usageLabels = cells
      .filter(item => item.usage)
      .map(item => ({
        name: item.usage,
        value: [item.value[0] + 3, item.value[1] - 1]
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
        },
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          silent: true,
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = usageLabels[params.dataIndex];
            const point = api.coord(item.value);

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: point[0],
                    y: point[1] - 18,
                    width: 88,
                    height: 22,
                    r: 2
                  },
                  style: {
                    fill: '#e8edf5',
                    shadowBlur: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.15)'
                  }
                },
                {
                  type: 'text',
                  style: {
                    text: item.name,
                    x: point[0] + 8,
                    y: point[1] - 7,
                    fill: '#53606d',
                    font: '8px Arial',
                    textAlign: 'left',
                    textVerticalAlign: 'middle'
                  }
                }
              ]
            };
          },
          data: usageLabels
        }
      ]
    };
  }
  /*
   * ******End ****** Geo Distribution / Global Operations Widget Related ********************
   */

  /*
   * -----Start----- Infrastructure Coverage Widgets Related -------------------
   */
  getPrivateCloudCoverage(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsCoverageCard[]> {
    return of(UNIFIED_AIOPS_PRIVATE_CLOUD_COVERAGE);
  }

  getPublicCloudCoverage(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsCoverageCard[]> {
    return of(UNIFIED_AIOPS_PUBLIC_CLOUD_COVERAGE);
  }

  convertToCoverageCardsViewData(data: UnifiedAiopsCoverageCard[]): UnifiedAiopsCoverageCard[] {
    return data || [];
  }
  /*
   * ******End ****** Infrastructure Coverage Widgets Related ********************
   */

  /*
   * -----Start----- Data Center Infrastructure Widget Related -------------------
   */
  getDatacenterInfrastructureMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_DATACENTER_INFRASTRUCTURE);
  }
  /*
   * ******End ****** Data Center Infrastructure Widget Related ********************
   */

  /*
   * -----Start----- Kubernetes / Container Widget Related -------------------
   */
  getKubernetesMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_KUBERNETES_METRICS);
  }
  /*
   * ******End ****** Kubernetes / Container Widget Related ********************
   */

  /*
   * -----Start----- AI / GPU / LLM Widget Related -------------------
   */
  getAiGpuMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_AI_GPU_METRICS);
  }
  /*
   * ******End ****** AI / GPU / LLM Widget Related ********************
   */

  /*
   * -----Start----- Application and Services Overview Widgets Related -------------------
   */
  getApplicationRows(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return of(UNIFIED_AIOPS_APPLICATION_ROWS);
  }

  getServiceRows(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return of(UNIFIED_AIOPS_SERVICE_ROWS);
  }

  convertToTableRowsViewData(data: UnifiedAiopsTableRow[]): UnifiedAiopsTableRow[] {
    return data || [];
  }
  /*
   * ******End ****** Application and Services Overview Widgets Related ********************
   */

  /*
   * -----Start----- Database and OS Monitoring Widgets Related -------------------
   */
  getDatabaseRows(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return of(UNIFIED_AIOPS_DATABASE_ROWS);
  }

  getOsRows(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return of(UNIFIED_AIOPS_OS_ROWS);
  }
  /*
   * ******End ****** Database and OS Monitoring Widgets Related ********************
   */

  /*
   * -----Start----- Infrastructure / Platform Performance Widget Related -------------------
   */
  getBandwidthBar(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getBandwidthBarOptions());
  }

  convertToBandwidthBarOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthBarOptions(): EChartsOption {
    const names = ['prod-db-01', 'ml-gpu-04', 'k8s-node-12', 'app-srv-08', 'es-node-03'];
    const values = [94, 88, 81, 76, 71];
    return {
      grid: { left: 72, right: 18, top: 12, bottom: 24 },
      xAxis: { type: 'value', max: 100, axisLabel: { fontSize: 9, color: '#7b8794' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      yAxis: { type: 'category', data: names.reverse(), axisLabel: { fontSize: 9, color: '#5f6d7b' }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: values.reverse().map((value, index) => ({ value, itemStyle: { color: ['#2f80ed', '#2f80ed', '#2f80ed', '#e68612', '#e5232b'][index] } })),
        barWidth: 13
      }]
    };
  }

  getBandwidthLine(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getBandwidthLineOptions());
  }

  convertToBandwidthLineOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthLineOptions(): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 14, bottom: 25 },
      xAxis: { type: 'category', data: ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50', '11:00'], axisLabel: { fontSize: 9, color: '#758394' } },
      yAxis: { type: 'value', min: 0, max: 45, axisLabel: { fontSize: 9, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [{
        type: 'line',
        data: [12, 14, 17, 42, 37, 24, 16],
        smooth: true,
        symbolSize: 5,
        lineStyle: { color: '#2f7bc7', width: 3 },
        itemStyle: { color: '#2f7bc7' },
        areaStyle: { color: 'rgba(47, 123, 199, 0.12)' }
      }]
    };
  }

  getPlatformPerformance(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getPlatformPerformanceOptions());
  }

  convertToPlatformPerformanceOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getPlatformPerformanceOptions(): EChartsOption {
    const data = [
      { name: 'VMware 24', value: 24, itemStyle: { color: '#617887' } },
      { name: 'AWS 22', value: 22, itemStyle: { color: '#ff7f0e' } },
      { name: 'Azure 18', value: 18, itemStyle: { color: '#00a0df' } },
      { name: 'GCP 12', value: 12, itemStyle: { color: '#4285f4' } },
      { name: 'Nutanix 10', value: 10, itemStyle: { color: '#0b56ad' } },
      { name: 'Other 4', value: 4, itemStyle: { color: '#777777' } }
    ];

    return {
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'middle',
        itemWidth: 13,
        itemHeight: 13,
        textStyle: { fontSize: 12, color: '#1f2a34' }
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['34%', '52%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data
      }]
    };
  }

  getPerformanceMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_PERFORMANCE_METRICS);
  }
  /*
   * ******End ****** Infrastructure / Platform Performance Widget Related ********************
   */

  /*
   * -----Start----- Analytics & Health Charts Widget Related -------------------
   */
  getDeviceAvailability(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getDeviceAvailabilityOptions());
  }

  convertToDeviceAvailabilityOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getDeviceAvailabilityOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: 'Up 93.4%', value: 93.4, color: '#17a84c' },
      { name: 'Down 2.8%', value: 2.8, color: '#e01919' },
      { name: 'Unknown 3.8%', value: 3.8, color: '#f28b00' }
    ], ['Up 93.4%', 'Down 2.8%', 'Unknown 3.8%'], ['#17a84c', '#e01919', '#f28b00']);
  }

  getAvailabilityCategory(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getAvailabilityCategoryOptions());
  }

  convertToAvailabilityCategoryOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAvailabilityCategoryOptions(): EChartsOption {
    const categories = ['VM', 'Network', 'DB', 'K8s', 'Cloud', 'App'];
    return {
      color: ['#17a84c', '#e01919', '#f28b00'],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 2, itemWidth: 10, itemHeight: 7, textStyle: { fontSize: 10 } },
      grid: { left: 34, right: 8, top: 28, bottom: 28 },
      xAxis: { type: 'category', data: categories, axisLabel: { fontSize: 10, color: '#5f6d7b' } },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', fontSize: 9, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [
        { name: 'UP', type: 'bar', stack: 'availability', data: [94, 98, 91, 88, 95, 92], barWidth: 22 },
        { name: 'Down', type: 'bar', stack: 'availability', data: [3, 1, 5, 8, 2, 4], barWidth: 22 },
        { name: 'Unknown', type: 'bar', stack: 'availability', data: [3, 1, 4, 4, 3, 4], barWidth: 22 }
      ]
    };
  }

  getAlertTrend(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getAlertTrendOptions());
  }

  convertToAlertTrendOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertTrendOptions(): EChartsOption {
    return {
      color: ['#e01919', '#f28b00', '#2d6db4'],
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, itemWidth: 10, itemHeight: 7, textStyle: { fontSize: 10 } },
      grid: { left: 34, right: 12, top: 14, bottom: 28 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10, color: '#5f6d7b' } },
      yAxis: { type: 'value', axisLabel: { fontSize: 9, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [
        { name: 'Critical', type: 'line', data: [8, 12, 18, 8, 14, 5, 12], smooth: true },
        { name: 'High', type: 'line', data: [28, 34, 42, 37, 44, 23, 36], smooth: true },
        { name: 'Medium', type: 'line', data: [84, 91, 128, 94, 111, 64, 125], smooth: true }
      ]
    };
  }
  /*
   * ******End ****** Analytics & Health Charts Widget Related ********************
   */

  /*
   * -----Start----- Alerts Widget Related -------------------
   */
  getAlertReductionMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_ALERT_REDUCTION_METRICS);
  }

  getAlertResponseMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_ALERT_RESPONSE_METRICS);
  }

  getAlertSourceSankey(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getAlertSourceSankeyOptions());
  }

  convertToAlertSourceSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertSourceSankeyOptions(): EChartsOption {
    return this.getCustomAlertChartOptions((api: any) => {
      const scale = this.getAlertChartScale(api, 720, 320);
      const x = scale.x;
      const y = scale.y;
      const elements = [];
      const sourceY = [44, 96, 148, 200, 252];
      const sourceX = 180;
      const eventsX = 276;
      const branchX = 386;
      const conditionX = 520;
      const ticketX = 632;
      const sourceSliceColors = ['#dcecff', '#fff0cc', '#ffd9de'];
      const eventsInY = [14, 31, 48, 69, 86, 103, 124, 141, 158, 179, 196, 213, 234, 251, 268];
      const logoSizes = {
        UNITYONECLOUD: { width: 20, height: 20, countX: 150 },
        LogicMonitor: { width: 108, height: 21, countX: 150 },
        OpsRamp: { width: 90, height: 20, countX: 150 },
        dynatrace: { width: 108, height: 22, countX: 150 },
        'new relic': { width: 106, height: 23, countX: 150 }
      };

      UNIFIED_AIOPS_ALERT_SOURCES.forEach((source, index) => {
        const centerY = sourceY[index];
        const logoSize = logoSizes[source.name];
        elements.push(this.getAlertImage(
          source.logoPath,
          x(4),
          y(centerY - logoSize.height / 2),
          x(logoSize.width),
          y(logoSize.height)
        ));
        if (source.name === 'UNITYONECLOUD') {
          elements.push(this.getAlertText(`UNITYONECLOUD (${source.count})`, x(36), y(centerY), {
            fontSize: 11,
            vertical: 'middle'
          }));
        } else {
          elements.push(this.getAlertText(`(${source.count})`, x(logoSize.countX), y(centerY), {
            fontSize: 12,
            vertical: 'middle'
          }));
        }
        elements.push(this.getAlertNode(x(sourceX), y(centerY - 21), x(4), y(18), '#2d86dd'));
        elements.push(this.getAlertNode(x(sourceX), y(centerY + 3), x(4), y(18), '#ff7a7a'));

        [0, 1, 2].forEach(sliceIndex => {
          const targetIndex = index * 3 + sliceIndex;
          const thickness = sliceIndex === 1 ? 6 : 5;
          elements.push(this.getAlertFlow(
            x(sourceX + 4),
            y(centerY - 20 + sliceIndex * 12),
            x(eventsX),
            y(eventsInY[targetIndex]),
            y(thickness),
            sourceSliceColors[sliceIndex],
            0.78
          ));
        });
      });

      elements.push(this.getAlertNode(x(eventsX), y(4), x(11), y(292), '#55bfc6'));
      elements.push(this.getAlertText('Events 950', x(eventsX + 22), y(156), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(eventsX + 11), y(18), x(branchX), y(18), y(62), '#d6d1ee', 0.82));
      elements.push(this.getAlertFlow(x(eventsX + 11), y(76), x(branchX), y(88), y(112), '#ece8f7', 0.9));
      elements.push(this.getAlertFlow(x(eventsX + 11), y(176), x(branchX), y(206), y(90), '#f4dada', 0.9));

      elements.push(this.getAlertNode(x(branchX), y(8), x(11), y(68), '#6648ad'));
      elements.push(this.getAlertText('Alerts 142', x(branchX + 27), y(42), { fontSize: 15, vertical: 'middle' }));
      elements.push(this.getAlertNode(x(branchX), y(88), x(11), y(112), '#b8a9dc'));
      elements.push(this.getAlertText('Dedupe Events', x(branchX + 27), y(119), { fontSize: 15 }));
      elements.push(this.getAlertText('305', x(branchX + 70), y(153), { fontSize: 15, align: 'center' }));
      elements.push(this.getAlertNode(x(branchX), y(210), x(11), y(86), '#e6a0a5'));
      elements.push(this.getAlertText('Suppressed Events', x(branchX + 27), y(246), { fontSize: 15 }));
      elements.push(this.getAlertText('503', x(branchX + 70), y(280), { fontSize: 15, align: 'center' }));

      elements.push(this.getAlertFlow(x(branchX + 11), y(18), x(conditionX), y(30), y(54), '#fff0cc', 0.78));
      elements.push(this.getAlertFlow(x(branchX + 11), y(50), x(conditionX), y(66), y(44), '#f4ccd1', 0.78));
      elements.push(this.getAlertNode(x(conditionX), y(28), x(10), y(90), '#6f7770'));
      elements.push(this.getAlertText('Conditions 21', x(conditionX + 15), y(73), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(conditionX + 10), y(28), x(ticketX), y(18), y(92), '#cdece1', 0.82));
      elements.push(this.getAlertFlow(x(conditionX + 10), y(84), x(ticketX), y(132), y(86), '#f0cccc', 0.82));
      elements.push(this.getAlertNode(x(ticketX), y(18), x(10), y(92), '#58c39f'));
      elements.push(this.getAlertNode(x(ticketX), y(132), x(10), y(86), '#e6a0a5'));
      elements.push(this.getAlertText('Ticket\nGenerated\n18', x(ticketX + 16), y(60), { fontSize: 14, lineHeight: 17, vertical: 'middle' }));
      elements.push(this.getAlertText('No Ticket\nGenerated\n3', x(ticketX + 16), y(174), { fontSize: 14, lineHeight: 17, vertical: 'middle' }));

      return {
        type: 'group',
        children: elements
      };
    });
  }

  getAlertLifecycleSankey(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getAlertLifecycleSankeyOptions());
  }

  convertToAlertLifecycleSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertLifecycleSankeyOptions(): EChartsOption {
    return this.getCustomAlertChartOptions((api: any) => {
      const scale = this.getAlertChartScale(api, 610, 320);
      const x = scale.x;
      const y = scale.y;
      const elements = [];
      const sourceX = 18;
      const stateX = 188;
      const actionX = 300;
      const durationX = 452;
      const terminalGroups = [
        { y: 18, label: 'Acknowledged\n143' },
        { y: 126, label: 'Auto Healed\n143' },
        { y: 234, label: 'Auto\nRemediation\n143' }
      ];

      elements.push(this.getAlertFlow(x(sourceX + 12), y(18), x(stateX), y(20), y(76), '#c9eef2', 0.85));
      elements.push(this.getAlertFlow(x(sourceX + 12), y(96), x(stateX), y(86), y(214), '#c7e9ee', 0.85));
      elements.push(this.getAlertNode(x(sourceX), y(18), x(12), y(294), '#58c4cf'));
      elements.push(this.getAlertText('Condition 164', x(44), y(172), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertNode(x(stateX), y(18), x(12), y(52), '#6648ad'));
      elements.push(this.getAlertText('Open\n21', x(stateX + 22), y(44), { fontSize: 15, lineHeight: 18, vertical: 'middle' }));
      elements.push(this.getAlertNode(x(stateX), y(84), x(12), y(228), '#6648ad'));
      elements.push(this.getAlertText('Resolved\n143', x(stateX + 22), y(198), { fontSize: 15, lineHeight: 18, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(stateX + 12), y(22), x(actionX), y(18), y(44), '#d9cdf0', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(72), x(actionX), y(62), y(54), '#d7c9ef', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(130), x(actionX), y(152), y(64), '#d7c9ef', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(210), x(actionX), y(246), y(54), '#d7c9ef', 0.82));

      terminalGroups.forEach((group, index) => {
        const actionY = group.y;
        elements.push(this.getAlertNode(x(actionX), y(actionY), x(12), y(84), '#de8fc2'));
        elements.push(this.getAlertText(group.label, x(actionX + 20), y(actionY + 42), {
          fontSize: 15,
          lineHeight: 18,
          vertical: 'middle'
        }));

        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 2), x(durationX), y(actionY), y(26), '#dff1e8', 0.78));
        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 28), x(durationX), y(actionY + 32), y(27), '#ffe1bc', 0.82));
        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 56), x(durationX), y(actionY + 66), y(18), '#f7c5c6', 0.82));
        elements.push(this.getAlertNode(x(durationX), y(actionY), x(12), y(26), '#55c49c'));
        elements.push(this.getAlertNode(x(durationX), y(actionY + 32), x(12), y(27), '#ff9e23'));
        elements.push(this.getAlertNode(x(durationX), y(actionY + 66), x(12), y(18), '#e00000'));
        elements.push(this.getAlertText('5 Min : 56', x(durationX + 24), y(actionY + 13), { fontSize: 15, vertical: 'middle' }));
        elements.push(this.getAlertText('30 Min : 51', x(durationX + 24), y(actionY + 45), { fontSize: 15, vertical: 'middle' }));
        elements.push(this.getAlertText('> 30 Min : 36', x(durationX + 24), y(actionY + 75), { fontSize: 15, vertical: 'middle' }));
      });

      return {
        type: 'group',
        children: elements
      };
    });
  }

  private getCustomAlertChartOptions(renderItem: (api: any) => any): EChartsOption {
    return {
      animation: false,
      tooltip: { show: false },
      series: [{
        type: 'custom',
        coordinateSystem: 'none',
        silent: true,
        renderItem: (_params: any, api: any) => renderItem(api),
        data: [0]
      }] as any
    };
  }

  private getAlertChartScale(api: any, baseWidth: number, baseHeight: number): any {
    const width = api.getWidth();
    const height = api.getHeight();

    return {
      x: (value: number) => (value / baseWidth) * width,
      y: (value: number) => (value / baseHeight) * height
    };
  }

  private getAlertNode(x: number, y: number, width: number, height: number, color: string): any {
    return {
      type: 'rect',
      z2: 20,
      shape: { x, y, width, height },
      style: {
        fill: color
      }
    };
  }

  private getAlertFlow(x0: number, y0: number, x1: number, y1: number, thickness: number, color: string, opacity: number): any {
    return {
      type: 'path',
      z2: 1,
      shape: {
        pathData: this.getAlertFlowPath(x0, y0, x1, y1, thickness)
      },
      style: {
        fill: color,
        opacity
      }
    };
  }

  private getAlertFlowPath(x0: number, y0: number, x1: number, y1: number, thickness: number): string {
    const curve = Math.max(24, (x1 - x0) * 0.52);
    const y0Bottom = y0 + thickness;
    const y1Bottom = y1 + thickness;

    return [
      `M ${x0} ${y0}`,
      `C ${x0 + curve} ${y0}, ${x1 - curve} ${y1}, ${x1} ${y1}`,
      `L ${x1} ${y1Bottom}`,
      `C ${x1 - curve} ${y1Bottom}, ${x0 + curve} ${y0Bottom}, ${x0} ${y0Bottom}`,
      'Z'
    ].join(' ');
  }

  private getAlertText(text: string, x: number, y: number, config: any = {}): any {
    return {
      type: 'text',
      silent: true,
      z2: 30,
      style: {
        text,
        x,
        y,
        fill: config.color || '#101820',
        font: `${config.fontWeight || 400} ${config.fontSize || 14}px Arial`,
        lineHeight: config.lineHeight || 18,
        textAlign: config.align || 'left',
        textVerticalAlign: config.vertical || 'top'
      }
    };
  }

  private getAlertImage(image: string, x: number, y: number, width: number, height: number): any {
    return {
      type: 'image',
      silent: true,
      z2: 30,
      style: {
        image,
        x,
        y,
        width,
        height
      }
    };
  }
  /*
   * ******End ****** Alerts Widget Related ********************
   */

  /*
   * -----Start----- Top 10 Critical Alerts Widget Related -------------------
   */
  getCriticalAlerts(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsAlertRow[]> {
    return of(UNIFIED_AIOPS_CRITICAL_ALERTS);
  }

  convertToCriticalAlertsViewData(data: UnifiedAiopsAlertRow[]): UnifiedAiopsAlertRow[] {
    return data || [];
  }
  /*
   * ******End ****** Top 10 Critical Alerts Widget Related ********************
   */

  /*
   * -----Start----- ITSM Tickets Widget Related -------------------
   */
  getTicketPriority(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getTicketPriorityOptions());
  }

  convertToTicketPriorityOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getTicketPriorityOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: '2 - High', value: 2, color: '#ff5252' },
      { name: '4 - Low', value: 4, color: '#6695ff' },
      { name: '3 - Moderate', value: 170, color: '#aaf25f' },
      { name: '1 - Critical', value: 24, color: '#ff62c7' },
      { name: '5 - Planning', value: 15, color: '#80e5d1' }
    ], ['2 - High', '4 - Low', '3 - Moderate', '1 - Critical', '5 - Planning'], ['#ff5252', '#6695ff', '#aaf25f', '#ff62c7', '#80e5d1']);
  }

  getTicketStatus(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getTicketStatusOptions());
  }

  convertToTicketStatusOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getTicketStatusOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: 'Closed', value: 58, color: '#f85fc0' },
      { name: 'New', value: 20, color: '#d8ed4c' },
      { name: 'Assess', value: 12, color: '#81e2f2' },
      { name: 'Resolved', value: 18, color: '#84d65a' },
      { name: 'In Progress', value: 8, color: '#8678ff' }
    ], ['Closed', 'New', 'Assess', 'Resolved', 'In Progress'], ['#f85fc0', '#d8ed4c', '#81e2f2', '#84d65a', '#8678ff']);
  }

  getTickets(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTicketRow[]> {
    return of(UNIFIED_AIOPS_TICKETS);
  }

  convertToTicketsViewData(data: UnifiedAiopsTicketRow[]): UnifiedAiopsTicketRow[] {
    return data || [];
  }
  /*
   * ******End ****** ITSM Tickets Widget Related ********************
   */

  /*
   * -----Start----- Auto-Remediation Summary Widget Related -------------------
   */
  getRemediationDonut(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getRemediationDonutOptions());
  }

  convertToRemediationDonutOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getRemediationDonutOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: 'Successful 91%', value: 91, color: '#5b9f1f' },
      { name: 'Failed 9%', value: 9, color: '#e64a4a' }
    ], [], ['#5b9f1f', '#e64a4a'], false);
  }

  getRemediationActions(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return of(this.getRemediationActionsOptions());
  }

  convertToRemediationActionsOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getRemediationActionsOptions(): EChartsOption {
    const names = ['Restart service', 'Scale out ASG', 'Revoke SG rule', 'Snapshot cleanup', 'Disk resize'];
    const values = [412, 338, 261, 204, 138];
    return {
      grid: { left: 100, right: 36, top: 8, bottom: 18 },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: names.reverse(), axisLabel: { color: '#1f2a34', fontSize: 11 }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: values.reverse().map((value, index) => ({
          value,
          label: { show: true, position: 'right', color: '#1f2a34', fontSize: 10 },
          itemStyle: { color: ['#5b9f1f', '#5b9f1f', '#f5a623', '#2f80ed', '#2f80ed'][index] }
        })),
        barWidth: 12
      }]
    };
  }

  getRemediationSummary(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return of(UNIFIED_AIOPS_REMEDIATION_SUMMARY);
  }

  getRemediationMetrics(_criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsRemediationMetric[]> {
    return of(UNIFIED_AIOPS_REMEDIATION_METRICS);
  }

  convertToRemediationMetricsViewData(data: UnifiedAiopsRemediationMetric[]): UnifiedAiopsRemediationMetric[] {
    return data || [];
  }
  /*
   * ******End ****** Auto-Remediation Summary Widget Related ********************
   */

  private getDonutOptions(data: { name: string; value: number; color: string }[], legendData: string[], colors: string[], showLegend = true): EChartsOption {
    return {
      color: colors,
      tooltip: { trigger: 'item' },
      legend: showLegend ? {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 8,
        textStyle: { fontSize: 11, color: '#1f2a34' },
        data: legendData
      } : { show: false },
      series: [{
        type: 'pie',
        radius: ['48%', '75%'],
        center: ['50%', showLegend ? '45%' : '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: data.map(item => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
      }]
    };
  }
}
