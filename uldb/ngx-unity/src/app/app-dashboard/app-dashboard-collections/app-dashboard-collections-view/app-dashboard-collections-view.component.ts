import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CollectionDetailResponse, DashboardItem } from '../app-dashboard-collections-crud/app-dashboard-collections-crud.type';
import { AppDashboardCollectionsViewService } from './app-dashboard-collections-view.service';

@Component({
  selector: 'app-dashboard-collections-view',
  templateUrl: './app-dashboard-collections-view.component.html',
  styleUrls: ['./app-dashboard-collections-view.component.scss'],
  providers: [AppDashboardCollectionsViewService]
})
export class AppDashboardCollectionsViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  collectionId: string;
  collection: CollectionDetailResponse;

  defaultDashboards: DashboardItem[] = [];
  myDashboards: DashboardItem[] = [];
  selectedDashboards: DashboardItem[] = [];
  modalSelectedDashboards: DashboardItem[] = [];

  defaultSearch = '';
  mySearch = '';
  selectedSearch = '';

  modalRef: BsModalRef;
  @ViewChild('dashboardPickerRef') dashboardPickerRef: TemplateRef<any>;

  get collectionName(): string {
    return this.collection?.name || 'Collection';
  }

  get filteredDefault(): DashboardItem[] {
    const q = this.defaultSearch.trim().toLowerCase();
    const dashboards = this.availableDefaultDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredMy(): DashboardItem[] {
    const q = this.mySearch.trim().toLowerCase();
    const dashboards = this.availableMyDashboards;
    return q ? dashboards.filter(d => d.name.toLowerCase().includes(q)) : dashboards;
  }

  get filteredSelected(): DashboardItem[] {
    const q = this.selectedSearch.trim().toLowerCase();
    return q ? this.modalSelectedDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.modalSelectedDashboards;
  }

  get availableDefaultDashboards(): DashboardItem[] {
    return this.defaultDashboards.filter(dashboard => !this.isDashboardInModalSelection(dashboard));
  }

  get availableMyDashboards(): DashboardItem[] {
    return this.myDashboards.filter(dashboard => !this.isDashboardInModalSelection(dashboard));
  }

  get dashboardsToBeSelectedCount(): number {
    return [
      ...this.availableDefaultDashboards,
      ...this.availableMyDashboards
    ].filter(dashboard => dashboard.checked).length;
  }

  get dashboardsToBeRemovedCount(): number {
    return this.modalSelectedDashboards.filter(dashboard => dashboard.checked).length;
  }

  constructor(
    private svc: AppDashboardCollectionsViewService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionId = params.get('collectionId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadInitialData() {
    forkJoin({
      collection: this.svc.getCollection(this.collectionId),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ collection, defaults, myDash }) => {
      if (!collection) {
        this.spinner.stop('main');
        this.notification.error(new Notification('Collection details not found.'));
        return;
      }
      this.collection = collection;
      this.defaultDashboards = defaults;
      this.myDashboards = myDash;
      this.selectedDashboards = this.svc.getSelectedDashboards(collection, [...defaults, ...myDash]);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Collection. Try again later.'));
    });
  }

  openDashboardModal() {
    this.defaultSearch = '';
    this.mySearch = '';
    this.selectedSearch = '';
    this.clearSourceSelections();
    this.modalSelectedDashboards = this.cloneDashboards(this.selectedDashboards);
    this.modalRef = this.modalService.show(this.dashboardPickerRef,
      Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  moveToSelected() {
    const checked = [
      ...this.availableDefaultDashboards.filter(d => d.checked),
      ...this.availableMyDashboards.filter(d => d.checked)
    ];
    checked.forEach(item => {
      if (!this.modalSelectedDashboards.some(s => s.uuid === item.uuid)) {
        this.modalSelectedDashboards = [...this.modalSelectedDashboards, { ...item, checked: false }];
      }
      item.checked = false;
    });
  }

  moveFromSelected() {
    this.modalSelectedDashboards = this.modalSelectedDashboards.filter(dashboard => !dashboard.checked);
  }

  updateCollectionDashboards() {
    this.spinner.start('main');
    this.svc.updateCollectionDashboards(this.collectionId, this.modalSelectedDashboards)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.selectedDashboards = this.cloneDashboards(this.modalSelectedDashboards);
        this.modalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Collection dashboards updated successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update Collection dashboards. Try again later.'));
      });
  }

  isDashboardInModalSelection(item: DashboardItem): boolean {
    return this.modalSelectedDashboards.some(dashboard => dashboard.uuid === item.uuid);
  }

  goBack() {
    this.router.navigate(['collections'], { relativeTo: this.route.parent });
  }

  private cloneDashboards(dashboards: DashboardItem[]): DashboardItem[] {
    return (dashboards || []).map(dashboard => ({ ...dashboard, checked: false }));
  }

  private clearSourceSelections() {
    [...this.defaultDashboards, ...this.myDashboards].forEach(dashboard => dashboard.checked = false);
  }
}
