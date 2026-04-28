import { Injectable } from '@angular/core';
import { PRIVATE_CLOUD_COMPUTE_DASHBOARD_TITLE } from './private-cloud-compute-dashboard.const';
import { PrivateCloudComputeDashboardViewData } from './private-cloud-compute-dashboard.type';

@Injectable()
export class PrivateCloudComputeDashboardService {

  getViewData(): PrivateCloudComputeDashboardViewData {
    return {
      title: PRIVATE_CLOUD_COMPUTE_DASHBOARD_TITLE
    };
  }
}
