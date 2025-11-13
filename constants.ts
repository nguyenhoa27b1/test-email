
import { User, Task, Role, Status, Priority } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Alex Ray', email: 'alex@example.com', password: 'password123', role: Role.Admin, avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'Jordan Lee', email: 'jordan@example.com', password: 'password123', role: Role.User, avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Taylor Kim', email: 'taylor@example.com', password: 'password123', role: Role.User, avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },
  { id: 'user-4', name: 'Casey Morgan', email: 'casey@example.com', password: 'password123', role: Role.User, avatarUrl: 'https://i.pravatar.cc/150?u=user-4' },
  { id: 'user-5', name: 'Sam Viewer', email: 'sam@example.com', password: 'password123', role: Role.Viewer, avatarUrl: 'https://i.pravatar.cc/150?u=user-5' },
];

export const TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design new dashboard UI',
    description: 'Create mockups and a prototype for the new v2 dashboard, focusing on user experience and data visualization.',
    assigneeId: 'user-2',
    creatorId: 'user-1',
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)),
    status: Status.InProgress,
    priority: Priority.High,
  },
  {
    id: 'task-2',
    title: 'Develop API endpoint for user authentication',
    description: 'Implement JWT-based authentication for the main API gateway. Include refresh token logic.',
    assigneeId: 'user-3',
    creatorId: 'user-1',
    deadline: new Date(new Date().setDate(new Date().getDate() + 10)),
    status: Status.ToDo,
    priority: Priority.High,
  },
  {
    id: 'task-3',
    title: 'Write documentation for the onboarding flow',
    description: 'Document the entire user onboarding process for the new help center. Include screenshots and code examples.',
    assigneeId: 'user-4',
    creatorId: 'user-2',
    deadline: new Date(new Date().setDate(new Date().getDate() - 1)), // Overdue
    status: Status.InProgress,
    priority: Priority.Medium,
  },
    {
    id: 'task-4',
    title: 'Fix login button bug on mobile',
    description: 'The login button is not rendering correctly on Safari mobile. Investigate and deploy a hotfix.',
    assigneeId: 'user-3',
    creatorId: 'user-1',
    deadline: new Date(new Date().setDate(new Date().getDate() + 1)), // Due soon
    status: Status.ToDo,
    priority: Priority.High,
  },
  {
    id: 'task-5',
    title: 'Review Q3 marketing campaign results',
    description: 'Analyze the performance metrics from the Q3 campaign and prepare a presentation for the stakeholders meeting.',
    assigneeId: 'user-1',
    creatorId: 'user-1',
    deadline: new Date(new Date().setDate(new Date().getDate() - 5)),
    status: Status.Done,
    score: 95,
    priority: Priority.Low,
  },
];
