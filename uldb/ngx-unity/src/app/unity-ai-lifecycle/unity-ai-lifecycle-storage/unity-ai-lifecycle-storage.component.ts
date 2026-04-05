import { Component, OnInit } from '@angular/core';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { UnityAiLifecycleStorageService } from './unity-ai-lifecycle-storage.service';
import { StorageSummaryKpi, StoragePoolCard, StoragePoolInventoryItem } from './unity-ai-lifecycle-storage.constants';

@Component({
  selector: 'app-unity-ai-lifecycle-storage',
  templateUrl: './unity-ai-lifecycle-storage.component.html',
  styleUrls: ['./unity-ai-lifecycle-storage.component.scss'],
  providers: [UnityAiLifecycleStorageService]
})
export class UnityAiLifecycleStorageComponent implements OnInit {

  summaryKpis: StorageSummaryKpi[] = [];
  storagePoolCards: StoragePoolCard[] = [];
  ioOperationChart: UnityChartDetails;
  storageByTenantChart: UnityChartDetails;
  dataGrowthTrendChart: UnityChartDetails;
  storagePoolInventory: StoragePoolInventoryItem[] = [];

  constructor(private svc: UnityAiLifecycleStorageService) { }

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
