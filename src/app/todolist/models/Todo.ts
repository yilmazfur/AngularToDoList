export interface Todo {
    id: number;
    taskName: string;
    isCompleted: boolean;
    deadline?: Date; // Optional field for deadline
    }