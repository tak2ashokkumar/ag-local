import { Component, OnInit } from '@angular/core';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AiLifecycleStorageService } from './ai-lifecycle-storage.service';
import { StorageSummaryKpi, StoragePoolCard, StoragePoolInventoryItem } from './ai-lifecycle-storage.constants';

@Component({
  selector: 'app-ai-lifecycle-storage',
  templateUrl: './ai-lifecycle-storage.component.html',
  styleUrls: ['./ai-lifecycle-storage.component.scss'],
  providers: [AiLifecycleStorageService]
})
export class AiLifecycleStorageComponent implements OnInit {

  summaryKpis: StorageSummaryKpi[] = [];
  storagePoolCards: StoragePoolCard[] = [];
  ioOperationChart: UnityChartDetails;
  storageByTenantChart: UnityChartDetails;
  dataGrowthTrendChart: UnityChartDetails;
  storagePoolInventory: StoragePoolInventoryItem[] = [];

  constructor(private svc: AiLifecycleStorageService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.summaryKpis = this.svc.getSummaryKpis();
    this.storagePoolCards = this.svc.getStoragePoolCards();
    this.ioOperationChart = this.svc.getIoOperationChartData();
    this.storageByTenantChart = this.svc.getStorageByTenantChartData();
    this.dataGrowthTrendChart = this.svc.getDataGrowthTrendChartData();
    this.storagePoolInventory = this.svc.getStoragePoolInventory();
  }
}
