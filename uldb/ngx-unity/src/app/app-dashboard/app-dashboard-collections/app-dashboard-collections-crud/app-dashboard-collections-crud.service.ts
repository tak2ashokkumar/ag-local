import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MOCK_COLLECTIONS } from '../app-dashboard-collections.const';
import { CuratedCollection } from '../app-dashboard-collections.type';
import { CollectionFormPayload, DashboardItem, GroupOption, RoleOption } from './app-dashboard-collections-crud.type';

@Injectable()
export class AppDashboardCollectionsCrudService {

  constructor(private http: HttpClient) {}

  getGroups(): Observable<GroupOption[]> {
    return this.http.get<any[]>(`/customer/rbac/user_groups/?page_size=0`).pipe(
      map(res => (res || []).map(g => ({ uuid: g.uuid, name: g.name })))
    );
  }

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<any[]>(`/customer/rbac/roles/?page_size=0`).pipe(
      map(res => (res || []).map(r => ({ uuid: r.uuid, name: r.name })))
    );
  }

  getDefaultDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/dashboards/?type=preset&page_size=0`).pipe(
      map(res => (res || []).map((d: any) => ({
        uuid: d.uuid, name: d.name, source: 'default' as const, checked: false
      }))),
      map(dashboards => this.mergePlaceholderDashboards(dashboards))
    );
  }

  getMyDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/persona/dashboards/?page_size=0`).pipe(
      map(res => (res || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => ({
          uuid: d.uuid, name: d.name, source: 'personal' as const, checked: false
        }))
      )
    );
  }

  getCollection(uuid: string): Observable<CuratedCollection | null> {
    return of(MOCK_COLLECTIONS.find(c => c.uuid === uuid) || null);
  }

  // Stores group/role names (not UUIDs) to keep mock data consistent with list display
  createCollection(payload: CollectionFormPayload): Observable<any> {
    const newCollection: CuratedCollection = {
      uuid: `col-${Date.now()}`,
      name: payload.name,
      description: payload.description,
      user_roles: payload.user_roles,
      user_groups: payload.user_groups,
      dashboard_ids: payload.dashboard_ids,
      created_by: 'Current User',
      updated_at: new Date().toISOString(),
      status: payload.status
    };
    MOCK_COLLECTIONS.unshift(newCollection);
    return of({ success: true });
  }

  updateCollection(uuid: string, payload: CollectionFormPayload): Observable<any> {
    const idx = MOCK_COLLECTIONS.findIndex(c => c.uuid === uuid);
    if (idx > -1) {
      MOCK_COLLECTIONS[idx] = {
        ...MOCK_COLLECTIONS[idx],
        name: payload.name,
        description: payload.description,
        user_roles: payload.user_roles,
        user_groups: payload.user_groups,
        dashboard_ids: payload.dashboard_ids,
        status: payload.status,
        updated_at: new Date().toISOString()
      };
    }
    return of({ success: true });
  }

  private mergePlaceholderDashboards(dashboards: DashboardItem[]): DashboardItem[] {
    const existing = new Set((dashboards || []).map(d => d.name.toLowerCase()));
    return [
      ...(dashboards || []),
      ...this.getPlaceholderDashboards().filter(d => !existing.has(d.name.toLowerCase()))
    ];
  }

  private getPlaceholderDashboards(): DashboardItem[] {
    return [
      this.getPlaceholderDashboard('preset-private-cloud-compute-dashboard', 'Private Cloud Compute Dashboard'),
      this.getPlaceholderDashboard('preset-public-cloud-compute-dashboard', 'Public Cloud Compute Dashboard'),
      this.getPlaceholderDashboard('preset-database-dashboard', 'Database Dashboard'),
      this.getPlaceholderDashboard('preset-unified-aiops-command-centre', 'Unified AIOps Command Center')
    ];
  }

  private getPlaceholderDashboard(uuid: string, name: string): DashboardItem {
    return {
      uuid,
      name,
      source: 'default',
      checked: false
    };
  }
}
