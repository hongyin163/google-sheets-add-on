declare let VERSION: string;

export type Item = {
  id: string,
  name: string
}

export type User = {
  name?: string, // 用户的邮箱, 如 hanli.deng@domain.com
  displayName?: string // 不一定是邮箱，如: Hanli Deng
}

export type SubTask = {
  key: string;
  summary: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
  plannedDevStartDate?:string;
  plannedDevDueDate?:string;
  devStartDate?: string;
  devDueDate?:string;
}

export type Task = {
  key: string;
  summary: string;
  plannedUATDate?: string;
  plannedReleaseDate?: string;
  status?: string;
  assignee?: string;
  subtasks: SubTask[];
}
