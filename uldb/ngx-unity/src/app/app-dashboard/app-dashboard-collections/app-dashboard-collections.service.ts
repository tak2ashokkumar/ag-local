import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CuratedCollection, CuratedCollectionViewData } from './app-dashboard-collections.type';

@Injectable()
export class AppDashboardCollectionsService {
  private readonly collectionEndpoint = '/customer/collections/';

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getCollections(criteria: SearchCriteria): Observable<PaginatedResult<CuratedCollection>> {
    return this.tableService.getData<PaginatedResult<CuratedCollection>>(this.collectionEndpoint, criteria);
  }

  convertToViewData(data: CuratedCollection[]): CuratedCollectionViewData[] {
    return data.map(d => {
      const view = new CuratedCollectionViewData();
      const updatedAt = d.updated_at || d.modified_at;
      view.collectionId = (d.uuid || d.id || '').toString();
      view.name = d.name;
      view.userRoles = this.getNames(this.getFirstFilledList(d.user_roles, d.roles));
      view.primaryRole = view.userRoles[0] || 'NA';
      view.extraRolesCount = view.userRoles.length > 1 ? view.userRoles.length - 1 : 0;
      view.userGroups = this.getNames(this.getFirstFilledList(d.user_groups, d.groups));
      view.primaryGroup = view.userGroups[0] || 'NA';
      view.extraGroupsCount = view.userGroups.length > 1 ? view.userGroups.length - 1 : 0;
      view.createdBy = this.getName(d.created_by);
      view.lastModified = updatedAt ? this.utilSvc.toUnityOneDateFormat(updatedAt) : 'NA';
      view.status = d.status;
      view.applicableModulePermissions = d.applicable_module_permissions || [];
      return view;
    });
  }

  saveStatus(collectionId: string, status: string): Observable<any> {
    return this.http.patch(`${this.collectionEndpoint}${collectionId}/`, { status });
  }

  delete(collectionId: string): Observable<any> {
    return this.http.delete(`${this.collectionEndpoint}${collectionId}/`);
  }

  private getNames(data?: any[]): string[] {
    return (data || [])
      .map(item => this.getName(item))
      .filter(name => name && name !== 'NA');
  }

  private getFirstFilledList(primary?: any[], fallback?: any[]): any[] {
    return primary && primary.length ? primary : fallback || [];
  }

  private getName(data: any): string {
    if (!data) {
      return 'NA';
    }
    if (typeof data === 'string' || typeof data === 'number') {
      return data.toString();
    }
    return data.name || data.username || data.email || data.full_name || 'NA';
  }
}
