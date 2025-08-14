import { inject } from '@angular/core'
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { Todo } from '../models/Todo'
import { TodoService } from '../services/TodoService'

type TodoState = {
    todos: Todo[]
    isLoading: boolean
    errorMessage: string
    showSuggestions: boolean
    suggestedTasks: string[]
    originalTaskData: any
    isGettingSuggestions: boolean
    selectedSuggestions: boolean[]
    question: string
    answer: string
}

const intialState: TodoState = {
    todos: [],
    isLoading: false,
    errorMessage: '',
    showSuggestions: false,
    suggestedTasks: [],
    originalTaskData: null,
    isGettingSuggestions: false,
    selectedSuggestions: [],
    question: '',
    answer: ''
}

export const TodoStore = signalStore(
    {providedIn: 'root'},
    withState(intialState),
    withMethods((store, todoService = inject(TodoService)) => ({
        // Load todos from API (matches your loadTodos method)
        loadTodos() {
            patchState(store, { isLoading: true, errorMessage: '' });
            
            todoService.getTodos().subscribe({
                next: (todos) => {
                    patchState(store, { todos, isLoading: false });
                },
                error: (error) => {
                    console.error('Error loading todos:', error);
                    patchState(store, { 
                        errorMessage: 'Failed to load todos. Please try again.',
                        isLoading: false 
                    });
                }
            });
        },

        // Toggle todo completion (matches your onCheck method)
        updateTodo(index: number) {
            const todos = store.todos();
            const todo = todos[index];
            
            if (todo.id) {
                todo.isCompleted = !todo.isCompleted;
                
                todoService.updateTodo(todo.id, todo).subscribe({
                    next: (updatedTodo) => {
                        const updatedTodos = [...todos];
                        updatedTodos[index] = updatedTodo;
                        patchState(store, { todos: updatedTodos });
                    },
                    error: (error) => {
                        console.error('Error updating todo:', error);
                        patchState(store, { 
                            errorMessage: 'Failed to update todo. Please try again.'
                        });
                    }
                });
            }
        },

        // Delete todo (matches your onDelete method)
        deleteTodo(index: number) {
            const todos = store.todos();
            const todo = todos[index];
            
            if (todo.id) {
                todoService.deleteTodo(todo.id).subscribe({
                    next: () => {
                        const updatedTodos = todos.filter((_, i) => i !== index);
                        patchState(store, { todos: updatedTodos });
                    },
                    error: (error) => {
                        console.error('Error deleting todo:', error);
                        patchState(store, { 
                            errorMessage: 'Failed to delete todo. Please try again.'
                        });
                    }
                });
            }
        },

        // Get suggestions (matches your getSuggestions method)
        getSuggestions(taskName: string, deadline?: string) {
            patchState(store, { 
                isGettingSuggestions: true,
                originalTaskData: { taskName, deadline }
            });

            todoService.suggestRelatedTasks(taskName).subscribe({
                next: (suggestions) => {
                    patchState(store, {
                        suggestedTasks: suggestions.suggestedTasks,
                        selectedSuggestions: new Array(suggestions.suggestedTasks.length).fill(false),
                        showSuggestions: true,
                        isGettingSuggestions: false
                    });
                },
                error: (error) => {
                    console.error('Error getting suggestions:', error);
                    this.createOriginalTask();
                    patchState(store, { isGettingSuggestions: false });
                }
            });
        },

        // Create original task (matches your createOriginalTask method)
        createOriginalTask() {
            const originalData = store.originalTaskData();
            const newTodo: Todo = {
                id: 0,
                taskName: originalData.taskName,
                isCompleted: false,
                deadline: originalData.deadline
            };

            todoService.createTodo(newTodo).subscribe({
                next: (todo) => {
                    patchState(store, {
                        todos: [...store.todos(), todo]
                    });
                    this.resetForm();
                },
                error: (error) => {
                    console.error('Error creating todo:', error);
                    patchState(store, { 
                        errorMessage: 'Failed to create todo. Please try again.'
                    });
                }
            });
        },

        // Create tasks from suggestions (matches your createTasksFromSuggestions method)
        createTasksFromSuggestions(selectedTasks: string[]) {
            const originalData = store.originalTaskData();
            const tasks = [originalData.taskName, ...selectedTasks];
            
            const createRequests = tasks.map(taskName => {
                const newTodo: Todo = {
                    id: 0,
                    taskName: taskName,
                    isCompleted: false,
                    deadline: originalData.deadline
                };
                return todoService.createTodo(newTodo);
            });

            patchState(store, { isLoading: true });
            Promise.all(createRequests.map(req => req.toPromise())).then(
                (todos) => {
                    const validTodos = todos.filter(todo => todo) as Todo[];
                    patchState(store, {
                        todos: [...store.todos(), ...validTodos],
                        isLoading: false
                    });
                    this.resetForm();
                },
                (error) => {
                    console.error('Error creating todos:', error);
                    patchState(store, {
                        errorMessage: 'Failed to create some todos. Please try again.',
                        isLoading: false
                    });
                }
            );
        },

        // Accept suggestions (matches your acceptSuggestions method)
        acceptSuggestions(selectedIndices: number[]) {
            const selectedTasks = selectedIndices.map(i => store.suggestedTasks()[i]);
            this.createTasksFromSuggestions(selectedTasks);
        },

        // Reject suggestions (matches your rejectSuggestions method)
        rejectSuggestions() {
            this.createOriginalTask();
        },

        // Reset form (matches your resetForm method)
        resetForm() {
            patchState(store, {
                showSuggestions: false,
                suggestedTasks: [],
                originalTaskData: null,
                selectedSuggestions: []
            });
        },

        // Update selected suggestion
        updateSelectedSuggestion(index: number, selected: boolean) {
            const current = store.selectedSuggestions();
            const updated = [...current];
            updated[index] = selected;
            patchState(store, { selectedSuggestions: updated });
        },

        // Ask AI (matches your askAi method)
        askAi(question: string) {
            patchState(store, { question });
            
            todoService.askAi(question).subscribe({
                next: (aiAnswer: string) => {
                    patchState(store, { answer: aiAnswer });
                },
                error: (error) => {
                    console.error('Error with AI:', error);
                    patchState(store, { 
                        errorMessage: 'Failed to get AI response. Please try again.'
                    });
                }
            });
        },

        // Update question
        updateQuestion(question: string) {
            patchState(store, { question });
        }
    }))
);