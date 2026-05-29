export type Role = "admin" | "member";
export type ProjectStatus = "active" | "archived";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  assignee_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
