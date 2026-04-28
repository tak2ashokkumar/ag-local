export interface CuratedCollection {
  uuid: string;
  name: string;
  description?: string;
  user_roles: string[];
  user_groups: string[];
  dashboard_ids?: string[];
  created_by: string;
  updated_at: string;
  status: 'draft' | 'published';
}

export class CuratedCollectionViewData {
  collectionId: string;
  name: string;
  primaryRole: string;
  extraRolesCount: number;
  primaryGroup: string;
  extraGroupsCount: number;
  userRoles: string[];
  userGroups: string[];
  createdBy: string;
  lastModified: string;
  status: string;
  applicableModulePermissions: any[];
}
