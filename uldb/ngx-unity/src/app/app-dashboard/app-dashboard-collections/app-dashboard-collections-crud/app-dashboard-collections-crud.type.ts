export interface GroupOption {
  uuid: string;
  name: string;
}

export interface RoleOption {
  uuid: string;
  name: string;
}

export interface DashboardItem {
  uuid: string;
  name: string;
  source: 'default' | 'personal';
  checked: boolean;
}

export interface CollectionFormPayload {
  name: string;
  description: string;
  user_groups: string[];
  user_roles: string[];
  status: 'draft' | 'published';
  dashboard_ids: string[];
}
