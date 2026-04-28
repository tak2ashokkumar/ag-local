import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppDashboardCollectionsCrudService } from './app-dashboard-collections-crud.service';
import { DashboardItem, GroupOption, RoleOption } from './app-dashboard-collections-crud.type';

@Component({
  selector: 'app-dashboard-collections-crud',
  templateUrl: './app-dashboard-collections-crud.component.html',
  styleUrls: ['./app-dashboard-collections-crud.component.scss'],
  providers: [AppDashboardCollectionsCrudService]
})
export class AppDashboardCollectionsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  collectionUUID: string;
  isEditMode = false;
  submitted = false;

  form: FormGroup;

  groups: GroupOption[] = [];
  roles: RoleOption[] = [];
  defaultDashboards: DashboardItem[] = [];
  myDashboards: DashboardItem[] = [];
  selectedDashboards: DashboardItem[] = [];

  defaultSearch = '';
  mySearch = '';
  selectedSearch = '';

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
  };

  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'selected',
    checkedPlural: 'selected',
    searchPlaceholder: 'Search',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  get filteredDefault(): DashboardItem[] {
    const q = this.defaultSearch.trim().toLowerCase();
    return q ? this.defaultDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.defaultDashboards;
  }

  get filteredMy(): DashboardItem[] {
    const q = this.mySearch.trim().toLowerCase();
    return q ? this.myDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.myDashboards;
  }

  get filteredSelected(): DashboardItem[] {
    const q = this.selectedSearch.trim().toLowerCase();
    return q ? this.selectedDashboards.filter(d => d.name.toLowerCase().includes(q)) : this.selectedDashboards;
  }

  constructor(
    private svc: AppDashboardCollectionsCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) {}

  ngOnInit(): void {
    this.spinner.start('main');
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.collectionUUID = params.get('collectionUUID');
      this.isEditMode = !!this.collectionUUID;
    });
    this.buildForm();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm(data?: any) {
    this.form = new FormGroup({
      name: new FormControl(data?.name || '', [Validators.required]),
      description: new FormControl(data?.description || ''),
      groups: new FormControl([], [arrayRequired()]),
      roles: new FormControl([], [arrayRequired()]),
      status: new FormControl(data?.status || 'draft')
    });
  }

  loadInitialData() {
    forkJoin({
      groups: this.svc.getGroups().pipe(catchError(() => of([]))),
      roles: this.svc.getRoles().pipe(catchError(() => of([]))),
      defaults: this.svc.getDefaultDashboards().pipe(catchError(() => of([]))),
      myDash: this.svc.getMyDashboards().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ groups, roles, defaults, myDash }) => {
      this.groups = groups;
      this.roles = roles;
      this.defaultDashboards = defaults;
      this.myDashboards = myDash;

      if (this.isEditMode) {
        this.svc.getCollection(this.collectionUUID)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(col => {
            if (col) {
              this.buildForm(col);
              this.form.get('groups').setValue(
                groups.filter(g => (col.user_groups || []).includes(g.name))
              );
              this.form.get('roles').setValue(
                roles.filter(r => (col.user_roles || []).includes(r.name))
              );
              if (col.dashboard_ids?.length) {
                const all = [...defaults, ...myDash];
                this.selectedDashboards = col.dashboard_ids
                  .map(id => all.find(d => d.uuid === id))
                  .filter((d): d is DashboardItem => !!d)
                  .map(d => ({ ...d, checked: false }));
              }
            }
            this.spinner.stop('main');
          }, () => this.spinner.stop('main'));
      } else {
        this.spinner.stop('main');
      }
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load data. Try again later.'));
    });
  }

  setStatus(status: 'draft' | 'published') {
    this.form.get('status').setValue(status);
  }

  moveToSelected() {
    const checked = [
      ...this.defaultDashboards.filter(d => d.checked),
      ...this.myDashboards.filter(d => d.checked)
    ];
    checked.forEach(item => {
      if (!this.selectedDashboards.some(s => s.uuid === item.uuid)) {
        this.selectedDashboards = [...this.selectedDashboards, { ...item, checked: false }];
      }
      item.checked = false;
    });
  }

  clearSelected() {
    this.selectedDashboards = [];
  }

  removeFromSelected(item: DashboardItem) {
    this.selectedDashboards = this.selectedDashboards.filter(d => d.uuid !== item.uuid);
  }

  isFieldInvalid(field: string): boolean {
    return this.submitted && this.form.get(field)?.invalid;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.spinner.start('main');
    const v = this.form.value;
    const selectedGroups: GroupOption[] = v.groups || [];
    const selectedRoles: RoleOption[] = v.roles || [];
    const payload = {
      name: v.name,
      description: v.description || '',
      user_groups: selectedGroups.map(g => g.name),
      user_roles: selectedRoles.map(r => r.name),
      status: v.status as 'draft' | 'published',
      dashboard_ids: this.selectedDashboards.map(d => d.uuid)
    };

    const action$ = this.isEditMode
      ? this.svc.updateCollection(this.collectionUUID, payload)
      : this.svc.createCollection(payload);

    action$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinner.stop('main');
      const msg = this.isEditMode ? 'Collection updated successfully.' : 'Collection created successfully.';
      this.notification.success(new Notification(msg));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      const msg = this.isEditMode ? 'Failed to update Collection.' : 'Failed to create Collection.';
      this.notification.error(new Notification(msg));
    });
  }

  goBack() {
    this.router.navigate(['collections'], { relativeTo: this.route.parent });
  }
}

function arrayRequired(): ValidatorFn {
  return (control: AbstractControl) =>
    control.value?.length ? null : { required: true };
}
