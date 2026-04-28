import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSideCard,
  PublicCloudAlertSummaryMetric,
  PublicCloudAlertTrendLegendItem,
  PublicCloudComputeBreakdownProvider,
  PublicCloudCriticalAlert,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDatabaseLatencyBadge,
  PublicCloudFilterOption,
  PublicCloudProviderDistributionItem,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudTagItem,
  PublicCloudTicketRow,
  PublicCloudUtilizationViewRow
} from './public-cloud-compute-dashboard.type';

@Component({
  selector: 'public-cloud-compute-dashboard',
  templateUrl: './public-cloud-compute-dashboard.component.html',
  styleUrls: ['./public-cloud-compute-dashboard.component.scss'],
  providers: [PublicCloudComputeDashboardService]
})
export class PublicCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private filterFormUnsubscribe = new Subject<void>();

  filterForm: FormGroup;
  platformOptions: PublicCloudFilterOption[] = [];
  regionOptions: PublicCloudRegionOption[] = [];
  accountOptions: PublicCloudAccountOption[] = [];

  summaryMetrics: PublicCloudSummaryMetric[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  tags: PublicCloudTagItem[] = [];
  heatmapOptions: EChartsOption = {};
  computeBreakdown: PublicCloudComputeBreakdownProvider[] = [];
  utilizationRows: PublicCloudUtilizationViewRow[] = [];
  latencyWorkloadOptions: EChartsOption = {};
  errorRateWorkloadOptions: EChartsOption = {};
  databasePerformanceOptions: EChartsOption = {};
  databaseLatencyBadges: PublicCloudDatabaseLatencyBadge[] = [];
  alertSummaryMetrics: PublicCloudAlertSummaryMetric[] = [];
  criticalAlerts: PublicCloudCriticalAlert[] = [];
  alertTrendLegend: PublicCloudAlertTrendLegendItem[] = [];
  alertTrendPolarOptions: EChartsOption = {};
  alertTrendStackOptions: EChartsOption = {};
  alertSideCards: PublicCloudAlertSideCard[] = [];
  ticketPriorityOptions: EChartsOption = {};
  ticketStatusOptions: EChartsOption = {};
  tickets: PublicCloudTicketRow[] = [];
  totalTickets = 0;

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    summaryMetrics: 'publicCloudSummaryMetricsLoader',
    providerDistribution: 'publicCloudProviderDistributionLoader',
    tags: 'publicCloudTagsLoader',
    regionHeatmap: 'publicCloudRegionHeatmapLoader',
    computeBreakdown: 'publicCloudComputeBreakdownLoader',
    utilization: 'publicCloudUtilizationLoader',
    latencyWorkloads: 'publicCloudLatencyWorkloadsLoader',
    errorRateWorkloads: 'publicCloudErrorRateWorkloadsLoader',
    databasePerformance: 'publicCloudDatabasePerformanceLoader',
    databaseLatencyBadges: 'publicCloudDatabaseLatencyBadgesLoader',
    alertSummary: 'publicCloudAlertSummaryLoader',
    criticalAlerts: 'publicCloudCriticalAlertsLoader',
    alertTrend: 'publicCloudAlertTrendLoader',
    alertSideCards: 'publicCloudAlertSideCardsLoader',
    ticketPriority: 'publicCloudTicketPriorityLoader',
    ticketStatus: 'publicCloudTicketStatusLoader',
    tickets: 'publicCloudTicketsLoader'
  };

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };

  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected'
  };

  constructor(private svc: PublicCloudComputeDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  /** Applies the current filter form output to every widget request. */
  applyFilters() {
    this.loadData();
  }

  /** Reloads the page filters from the source sequence and then refreshes all widgets. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form only after platform, region, and account data is ready. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads platform options first, then continues the dependent filter-loading chain. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinnerService.start(this.loaderNames.filters);
    this.svc.getPlatforms().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.platformOptions = res || [];
      this.loadInitialRegions();
    }, () => {
      this.stopFilterLoader();
    });
  }

  /** Loads region options from the selected-by-default platform values during initial filter setup. */
  private loadInitialRegions() {
    const platformValues = this.getValuesFromOptions(this.platformOptions);
    this.svc.getRegions(platformValues).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regionOptions = res || [];
      this.loadInitialAccounts(platformValues);
    }, () => {
      this.regionOptions = [];
      this.accountOptions = [];
      this.stopFilterLoader();
    });
  }

  /** Loads account options from the selected-by-default platform and region values, then creates the filter form. */
  private loadInitialAccounts(platformValues: string[]) {
    const regionValues = this.getValuesFromOptions(this.regionOptions);
    this.svc.getAccounts(platformValues, regionValues).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.accountOptions = res || [];
      this.buildFilterForm();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.accountOptions = [];
      this.stopFilterLoader();
    });
  }

  /** Wires dependent filter changes without reloading widgets until the filter button is clicked. */
  private watchFilterChanges() {
    this.filterForm.get('platforms').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadRegionOptionsForForm();
      });

    this.filterForm.get('regions').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadAccountOptionsForForm();
      });
  }

  /** Refreshes region options for the current platform selections and keeps still-valid region selections. */
  private loadRegionOptionsForForm() {
    this.svc.getRegions(this.getSelectedValues('platforms')).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regionOptions = res || [];
      this.patchSelectedOptions('regions', this.regionOptions);
      this.loadAccountOptionsForForm();
    }, () => {
      this.regionOptions = [];
      this.accountOptions = [];
      this.setControlValue('regions', []);
      this.setControlValue('accounts', []);
      this.stopFilterLoader();
    });
  }

  /** Refreshes account options for the current platform and region selections and keeps still-valid account selections. */
  private loadAccountOptionsForForm() {
    this.svc.getAccounts(this.getSelectedValues('platforms'), this.getSelectedValues('regions'))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.accountOptions = res || [];
        this.patchSelectedOptions('accounts', this.accountOptions);
        this.stopFilterLoader();
      }, () => {
        this.accountOptions = [];
        this.setControlValue('accounts', []);
        this.stopFilterLoader();
      });
  }

  /** Creates the filter form with all currently loaded filter options selected by default. */
  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.platformOptions, this.regionOptions, this.accountOptions);
    this.watchFilterChanges();
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.platformOptions = [];
    this.regionOptions = [];
    this.accountOptions = [];
  }

  /** Keeps current selections when still available; if none remain, dependent options default to all available options. */
  private patchSelectedOptions(controlName: string, options: PublicCloudFilterOption[]) {
    const selectedValues = this.getSelectedValues(controlName);
    let nextValue: PublicCloudFilterOption[] = [];
    if (selectedValues.length) {
      const selectedOptions = options.filter(option => selectedValues.includes(option.value));
      nextValue = selectedOptions.length ? selectedOptions : options;
    }
    this.setControlValue(controlName, nextValue);
  }

  /** Sets a filter control value without triggering dependent filter subscriptions. */
  private setControlValue(controlName: string, value: PublicCloudFilterOption[]) {
    this.filterForm.get(controlName).setValue(value, { emitEvent: false });
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<PublicCloudFilterOption | string>): string[] {
    return (options || [])
      .map((item: PublicCloudFilterOption | string) => typeof item === 'string' ? item : item?.value)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): PublicCloudDashboardFilterCriteria {
    return {
      platforms: this.getSelectedValues('platforms'),
      regions: this.getSelectedValues('regions'),
      accounts: this.getSelectedValues('accounts')
    };
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm && !!this.platformOptions.length && !!this.regionOptions.length && !!this.accountOptions.length;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  /** Builds the visible scope text from the current filter form selections. */
  get scopeText(): string {
    if (!this.filterForm) {
      return 'Loading filters';
    }
    return `${this.getSelectedLabel(this.platformOptions, this.getSelectedValues('platforms'), 'All providers', 'providers', 'No providers')} | ${this.getSelectedLabel(this.regionOptions, this.getSelectedValues('regions'), 'All regions', 'regions', 'No regions')} | ${this.getSelectedLabel(this.accountOptions, this.getSelectedValues('accounts'), 'All accounts', 'accounts', 'No accounts')}`;
  }

  /** Converts selected values into a compact filter label for the header scope text. */
  getSelectedLabel(options: PublicCloudFilterOption[], selectedValues: string[], allLabel: string, pluralLabel: string, emptyLabel: string): string {
    if (!selectedValues.length) {
      return emptyLabel;
    }
    if (options?.length && selectedValues.length === options.length) {
      return allLabel;
    }
    if (selectedValues.length === 1) {
      return options?.find(option => option.value === selectedValues[0])?.label || allLabel;
    }
    return `${selectedValues.length} ${pluralLabel}`;
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    const filterFormOutput = this.getFilterFormOutput();
    setTimeout(() => {
      this.getSummaryMetrics(filterFormOutput);
      this.getProviderDistribution(filterFormOutput);
      this.getTags(filterFormOutput);
      this.getRegionHeatmap(filterFormOutput);
      this.getComputeBreakdown(filterFormOutput);
      this.getUtilizationRows(filterFormOutput);
      this.getLatencyWorkloads(filterFormOutput);
      this.getErrorRateWorkloads(filterFormOutput);
      this.getDatabasePerformance(filterFormOutput);
      this.getDatabaseLatencyBadges(filterFormOutput);
      this.getAlertSummaryMetrics(filterFormOutput);
      this.getCriticalAlerts(filterFormOutput);
      this.getAlertTrend(filterFormOutput);
      this.getAlertSideCards(filterFormOutput);
      this.getTicketPriority(filterFormOutput);
      this.getTicketStatus(filterFormOutput);
      this.getTickets(filterFormOutput);
      this.getTicketsTotal(filterFormOutput);
    }, 0);
  }

  getSummaryMetrics(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummaryMetrics(filterFormOutput), res => {
      this.summaryMetrics = this.svc.convertToSummaryMetricsViewData(res);
    }, () => {
      this.summaryMetrics = [];
    });
  }

  getProviderDistribution(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.loadWidget(this.loaderNames.providerDistribution, this.svc.getProviderDistribution(filterFormOutput), res => {
      this.providerDistribution = this.svc.convertToProviderDistributionViewData(res);
      this.providerDistributionOptions = this.svc.convertToProviderDistributionOptions(this.providerDistribution);
    }, () => {
      this.providerDistribution = [];
      this.providerDistributionOptions = {};
    });
  }

  getTags(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.tags = [];
    this.loadWidget(this.loaderNames.tags, this.svc.getTags(filterFormOutput), res => {
      this.tags = this.svc.convertToTagsViewData(res);
    }, () => {
      this.tags = [];
    });
  }

  getRegionHeatmap(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.heatmapOptions = {};
    this.loadWidget(this.loaderNames.regionHeatmap, this.svc.getRegionHeatmap(filterFormOutput), res => {
      this.heatmapOptions = this.svc.convertToRegionHeatmapOptions(res);
    }, () => {
      this.heatmapOptions = {};
    });
  }

  getComputeBreakdown(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.computeBreakdown = [];
    this.loadWidget(this.loaderNames.computeBreakdown, this.svc.getComputeBreakdown(filterFormOutput), res => {
      this.computeBreakdown = this.svc.convertToComputeBreakdownViewData(res);
    }, () => {
      this.computeBreakdown = [];
    });
  }

  getUtilizationRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.utilizationRows = [];
    this.loadWidget(this.loaderNames.utilization, this.svc.getUtilizationRows(filterFormOutput), res => {
      this.utilizationRows = this.svc.convertToUtilizationRowsViewData(res);
    }, () => {
      this.utilizationRows = [];
    });
  }

  getLatencyWorkloads(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.latencyWorkloadOptions = {};
    this.loadWidget(this.loaderNames.latencyWorkloads, this.svc.getLatencyWorkloads(filterFormOutput), res => {
      this.latencyWorkloadOptions = this.svc.convertToLatencyWorkloadOptions(res);
    }, () => {
      this.latencyWorkloadOptions = {};
    });
  }

  getErrorRateWorkloads(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.errorRateWorkloadOptions = {};
    this.loadWidget(this.loaderNames.errorRateWorkloads, this.svc.getErrorRateWorkloads(filterFormOutput), res => {
      this.errorRateWorkloadOptions = this.svc.convertToErrorRateWorkloadOptions(res);
    }, () => {
      this.errorRateWorkloadOptions = {};
    });
  }

  getDatabasePerformance(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databasePerformanceOptions = {};
    this.loadWidget(this.loaderNames.databasePerformance, this.svc.getDatabasePerformance(filterFormOutput), res => {
      this.databasePerformanceOptions = this.svc.convertToDatabasePerformanceOptions(res);
    }, () => {
      this.databasePerformanceOptions = {};
    });
  }

  getDatabaseLatencyBadges(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseLatencyBadges = [];
    this.loadWidget(this.loaderNames.databaseLatencyBadges, this.svc.getDatabaseLatencyBadges(filterFormOutput), res => {
      this.databaseLatencyBadges = this.svc.convertToDatabaseLatencyBadgesViewData(res);
    }, () => {
      this.databaseLatencyBadges = [];
    });
  }

  getAlertSummaryMetrics(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.alertSummaryMetrics = [];
    this.loadWidget(this.loaderNames.alertSummary, this.svc.getAlertSummaryMetrics(filterFormOutput), res => {
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryMetricsViewData(res);
    }, () => {
      this.alertSummaryMetrics = [];
    });
  }

  getCriticalAlerts(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.criticalAlerts = [];
    this.loadWidget(this.loaderNames.criticalAlerts, this.svc.getCriticalAlerts(filterFormOutput), res => {
      this.criticalAlerts = this.svc.convertToCriticalAlertsViewData(res);
    }, () => {
      this.criticalAlerts = [];
    });
  }

  getAlertTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.alertTrendLegend = [];
    this.alertTrendPolarOptions = {};
    this.alertTrendStackOptions = {};
    this.loadWidget(this.loaderNames.alertTrend, this.svc.getAlertTrendLegend(filterFormOutput), res => {
      this.alertTrendLegend = this.svc.convertToAlertTrendLegendViewData(res);
      this.alertTrendPolarOptions = this.svc.convertToAlertTrendPolarOptions(this.alertTrendLegend);
    }, () => {
      this.alertTrendLegend = [];
      this.alertTrendPolarOptions = {};
    });
    this.loadWidget(this.loaderNames.alertTrend, this.svc.getAlertTrendStackGroups(filterFormOutput), res => {
      this.alertTrendStackOptions = this.svc.convertToAlertTrendStackOptions(res);
    }, () => {
      this.alertTrendStackOptions = {};
    });
  }

  getAlertSideCards(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.alertSideCards = [];
    this.loadWidget(this.loaderNames.alertSideCards, this.svc.getAlertSideCards(filterFormOutput), res => {
      this.alertSideCards = this.svc.convertToAlertSideCardsViewData(res);
    }, () => {
      this.alertSideCards = [];
    });
  }

  getTicketPriority(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.ticketPriorityOptions = {};
    this.loadWidget(this.loaderNames.ticketPriority, this.svc.getTicketPriority(filterFormOutput), res => {
      this.ticketPriorityOptions = this.svc.convertToTicketPriorityOptions(res);
    }, () => {
      this.ticketPriorityOptions = {};
    });
  }

  getTicketStatus(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.ticketStatusOptions = {};
    this.loadWidget(this.loaderNames.ticketStatus, this.svc.getTicketStatus(filterFormOutput), res => {
      this.ticketStatusOptions = this.svc.convertToTicketStatusOptions(res);
    }, () => {
      this.ticketStatusOptions = {};
    });
  }

  getTickets(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.tickets = [];
    this.loadWidget(this.loaderNames.tickets, this.svc.getTickets(filterFormOutput), res => {
      this.tickets = this.svc.convertToTicketsViewData(res);
    }, () => {
      this.tickets = [];
    });
  }

  getTicketsTotal(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.totalTickets = 0;
    this.loadWidget(this.loaderNames.tickets, this.svc.getTicketsTotal(filterFormOutput), res => {
      this.totalTickets = res || 0;
    }, () => {
      this.totalTickets = 0;
    });
  }

  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  trackByValue(index: number, option: PublicCloudFilterOption) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void) {
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => setTimeout(() => this.spinnerService.stop(loaderName), 0))
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
