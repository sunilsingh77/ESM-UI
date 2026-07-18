export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardResponse {
  message: string;
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  roles: string[];
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  departmentId: number;
  departmentName: string;
  hireDate: string;
  skills?: EmployeeSkill[];
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  employeeName: string;
  skillId: number;
  skillName: string;
  proficiencyLevel: string;
  yearsOfExperience: number;
  isPrimary: boolean;
  acquiredDate: string;
}

/*export interface ApiError {
  success: boolean;
  statusCode: number;
  message: string;
  errorCode?: string;
  traceId?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}*/
export interface ApiError {
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
  traceId?: string;
}
