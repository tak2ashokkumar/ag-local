import { Component, OnInit } from '@angular/core';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { WorkloadManagementService } from './workload-management.service';
import { WorkloadSummaryKpi, ActiveJob, GpuClusterCell } from './workload-management.constants';

@Component({
  selector: 'app-workload-management',
  templateUrl: './workload-management.component.html',
  styleUrls: ['./workload-management.component.scss'],
  providers: [WorkloadManagementService]
})
export class WorkloadManagementComponent implements OnInit {

  summaryKpis: WorkloadSummaryKpi[] = [];
  resourceUtilizationChart: UnityChartDetails;
  gpuAllocationChart: UnityChartDetails;
  schedulingThroughputChart: UnityChartDetails;
  activeJobs: ActiveJob[] = [];
  gpuClusterMap: GpuClusterCell[] = [];
  gpuClusterLegend: { label: string; count: number; color: string }[] = [];

  constructor(private svc: WorkloadManagementService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.summaryKpis = this.svc.getSummaryKpis();
    this.resourceUtilizationChart = this.svc.getResourceUtilizationChartData();
    this.gpuAllocationChart = this.svc.getGpuAllocationChartData();
    this.schedulingThroughputChart = this.svc.getSchedulingThroughputChartData();
    this.activeJobs = this.svc.getActiveJobs();
    this.gpuClusterMap = this.svc.getGpuClusterMap();
    this.gpuClusterLegend = this.svc.getGpuClusterLegend();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'running': return 'text-success';
      case 'Disabled': return 'text-danger';
      case 'queued': return 'text-warning';
      case 'failed': return 'text-danger';
      default: return '';
    }
  }

  getClusterCellClass(status: string): string {
    switch (status) {
      case 'training': return 'cluster-cell-training';
      case 'streaming': return 'cluster-cell-streaming';
      case 'inference': return 'cluster-cell-inference';
      case 'available': return 'cluster-cell-available';
      default: return '';
    }
  }
}
