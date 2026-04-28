import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivateCloudComputeDashboardService } from './private-cloud-compute-dashboard.service';
import { PrivateCloudComputeDashboardViewData } from './private-cloud-compute-dashboard.type';

@Component({
  selector: 'private-cloud-compute-dashboard',
  templateUrl: './private-cloud-compute-dashboard.component.html',
  styleUrls: ['./private-cloud-compute-dashboard.component.scss'],
  providers: [PrivateCloudComputeDashboardService]
})
export class PrivateCloudComputeDashboardComponent implements OnInit {
  viewData: PrivateCloudComputeDashboardViewData;

  constructor(private svc: PrivateCloudComputeDashboardService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.viewData = this.svc.getViewData();
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
