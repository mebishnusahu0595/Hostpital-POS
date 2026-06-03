export type Role = 'super_admin' | 'hospital_admin' | 'engineer' | 'staff' | 'scm_manager';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
