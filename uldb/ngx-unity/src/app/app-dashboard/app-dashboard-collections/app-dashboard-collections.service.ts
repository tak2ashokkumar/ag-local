import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MOCK_COLLECTIONS } from './app-dashboard-collections.const';
import { CuratedCollection, CuratedCollectionViewData } from './app-dashboard-collections.type';

@Injectable()
export class AppDashboardCollectionsService {
  constructor(private utilSvc: AppUtilityService) {}

  getCollections(criteria: SearchCriteria): Observable<PaginatedResult<CuratedCollection>> {
    let data = [...MOCK_COLLECTIONS];

    if (criteria.searchValue) {
      const q = criteria.searchValue.toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q) || c.created_by.toLowerCase().includes(q));
    }

    const statusFilter = criteria.params?.[0]?.['status'];
    if (statusFilter) {
      data = data.filter(c => c.status === statusFilter);
    }

    if (criteria.sortColumn) {
      const dir = criteria.sortDirection === 'desc' ? -1 : 1;
      data = data.sort((a, b) => {
        const aVal = (a as any)[criteria.sortColumn] ?? '';
        const bVal = (b as any)[criteria.sortColumn] ?? '';
        return aVal.localeCompare(bVal) * dir;
      });
    }

    const page = criteria.pageNo || 1;
    const pageSize = criteria.pageSize || 10;
    const start = (page - 1) * pageSize;
    const results = data.slice(start, start + pageSize);

    return of({ count: data.length, results, next: null, previous: null });
  }

  convertToViewData(data: CuratedCollection[]): CuratedCollectionViewData[] {
    return data.map(d => {
      const view = new CuratedCollectionViewData();
      view.collectionId = d.uuid;
      view.name = d.name;
      view.userRoles = d.user_roles;
      view.primaryRole = d.user_roles[0] ?? '';
      view.extraRolesCount = d.user_roles.length > 1 ? d.user_roles.length - 1 : 0;
      view.userGroups = d.user_groups;
      view.primaryGroup = d.user_groups[0] ?? '';
      view.extraGroupsCount = d.user_groups.length > 1 ? d.user_groups.length - 1 : 0;
      view.createdBy = d.created_by;
      view.lastModified = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'NA';
      view.status = d.status;
      view.applicableModulePermissions = [];
      return view;
    });
  }

  saveStatus(collectionId: string, status: string): Observable<any> {
    const item = MOCK_COLLECTIONS.find(c => c.uuid === collectionId);
    if (item) {
      item.status = status as 'draft' | 'published';
    }
    return of({ success: true });
  }

  delete(collectionId: string): Observable<any> {
    const idx = MOCK_COLLECTIONS.findIndex(c => c.uuid === collectionId);
    if (idx !== -1) {
      MOCK_COLLECTIONS.splice(idx, 1);
    }
    return of({ success: true });
  }
}
