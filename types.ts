
export enum Role {
  Admin = 'Admin',
  User = 'User',
  Viewer = 'Viewer',
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  creatorId: string;
  deadline: Date;
  status: Status;
  priority?: Priority;
  score?: number;
}
