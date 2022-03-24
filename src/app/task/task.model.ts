export interface Task {
  id: string;
  title: string;
  description: string;
}

export enum ProgressType {
  TODO="todo",
  INPROGRESS="inProgress",
  DONE="done"
}
