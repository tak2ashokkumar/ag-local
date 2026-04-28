import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AppDefaultDashboardsService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService) { }

  getDefaults(criteria: SearchCriteria): Observable<DefaultType[]> {
    let params = new HttpParams();
    if (criteria.searchValue?.trim()) {
      params = params.set('search', criteria.searchValue);
    }
    return this.http.get<DefaultType[]>(`/customer/dashboards/?type=preset&page_size=0`, { params: params }).pipe(
      map(data => this.mergePlaceholderDashboards(data, criteria))
    );
  }

  convertToViewData(data: DefaultType[]) {
    if(!data || !data.length) return [];
    let viewData: DefaultViewData[] = [];
    const defaultDashboard = [
      'Infrastructure Overview',
      'Network Overview',
      'Cloud Cost Overview',
      'Task and Workflow Overview',
      'IoT Device Overview',
      'Application Dashboard',
      'Private Cloud Compute Dashboard',
      'Public Cloud Compute Dashboard',
      'Database Dashboard',
      'Unified AIOps Command Center'
    ]
    const filterdData = data?.filter(d => defaultDashboard.includes(d.name));
    filterdData.forEach(d => {
      let view: DefaultViewData = new DefaultViewData();
      view.defaultId = d.uuid;
      view.name = d.name;
      view.type = d.type;
      view.status = d.status;
      view.description = d.description;
      view.createdBy = d.created_by;
      view.defaultDashboardUrl = this.getDefaultDashboardRouteSegment(d.name);
      viewData.push(view);
    })
    return viewData;
  }

  mergePlaceholderDashboards(data: DefaultType[], criteria: SearchCriteria): DefaultType[] {
    const searchValue = criteria.searchValue?.trim()?.toLowerCase();
    const placeholders = this.getPlaceholderDashboards().filter(d => !searchValue || d.name.toLowerCase().includes(searchValue));
    return [...(data || []), ...placeholders];
  }

  getPlaceholderDashboards(): DefaultType[] {
    return [
      this.getPlaceholderDashboard('preset-private-cloud-compute-dashboard', 'Private Cloud Compute Dashboard', 'Private cloud compute dashboard skeleton.'),
      this.getPlaceholderDashboard('preset-public-cloud-compute-dashboard', 'Public Cloud Compute Dashboard', 'Public cloud compute dashboard skeleton.'),
      this.getPlaceholderDashboard('preset-database-dashboard', 'Database Dashboard', 'Database dashboard skeleton.'),
      this.getPlaceholderDashboard('preset-unified-aiops-command-centre', 'Unified AIOps Command Center', 'Unified AIOps command center dashboard.')
    ];
  }

  getPlaceholderDashboard(uuid: string, name: string, description: string): DefaultType {
    return {
      uuid: uuid,
      name: name,
      description: description,
      type: 'preset',
      status: 'published',
      refresh_interval_in_sec: null,
      refresh: false,
      timeframe: null,
      created_at: '',
      updated_at: '',
      created_by: 'System',
      applicable_module_permissions: []
    };
  }

  getDefaultDashboardRouteSegment(name: string) {
    switch (name) {
      case 'Infrastructure Overview':
        return 'infrastructure';
      case 'Network Overview':
        return 'network-devices';
      case 'IoT Device Overview':
        return 'iot-devices';
      case 'Cloud Cost Overview':
        return 'cloud-cost';
      case 'Task and Workflow Overview':
        return 'orchestration';
      case 'Application Dashboard':
        return 'application';
      case 'Private Cloud Compute Dashboard':
        return 'private-cloud-compute';
      case 'Public Cloud Compute Dashboard':
        return 'public-cloud-compute';
      case 'Database Dashboard':
        return 'database';
      case 'Unified AIOps Command Centre':
      case 'Unified AIOps Command Center':
        return 'unified-aiops-command-centre';
    }
  }
}

export class DefaultViewData {
  constructor() { }
  defaultId: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string
  defaultDashboardUrl: string;
}

export interface DefaultType {
  uuid: string;
  name: string;
  description: string;
  type: string;
  status: string;
  refresh_interval_in_sec: null;
  refresh: boolean;
  timeframe: null;
  created_at: string;
  updated_at: string;
  created_by: string;
  applicable_module_permissions: any[];
}
