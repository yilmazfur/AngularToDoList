import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, AbstractControl, ValidationErrors, ValidatorFn  } from '@angular/forms';
import { TodoService } from './services/TodoService';
import { Todo } from './models/Todo';
import { TaskSuggestions } from './models/TaskSuggestions';

@Component({
  selector: 'app-todolist',
  imports: [CommonModule, FormsModule],
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.scss'
})

export class TodolistComponent implements OnInit {
  taskArray: Todo[] = [];
  isLoading = false;
  errorMessage = '';
  question = "";
  answer = "";

  showSuggestions = false;
  suggestedTasks: string[] = [];
  originalTaskData: any = null;
  isGettingSuggestions = false;
  selectedSuggestions: boolean[] = [];

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.taskArray = todos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.errorMessage = 'Failed to load todos. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      // Store the form data for potential suggestions
      this.originalTaskData = {
        taskName: form.value.task,
        deadline: form.value.deadline
      };

      // Get AI suggestions first
      this.getSuggestions(form.value.task, form.value.deadline);
    }
  }

  onCheck(index: number): void {
    const todo = this.taskArray[index];
    if (todo.id) {
      todo.isCompleted = !todo.isCompleted;
      this.todoService.updateTodo(todo.id, todo).subscribe({
        next: (updatedTodo) => {
          this.taskArray[index] = updatedTodo;
        },
        error: (error) => {
          console.error('Error updating todo:', error);
          this.errorMessage = 'Failed to update todo. Please try again.';
        }
      });
    }
  }

  getSuggestions(taskName: string, deadline?: string): void {
    this.isGettingSuggestions = true;
    this.todoService.suggestRelatedTasks(taskName).subscribe({
      next: (suggestions) => {
        this.suggestedTasks = suggestions.suggestedTasks;
        this.selectedSuggestions = new Array(this.suggestedTasks.length).fill(false);
        this.showSuggestions = true;
        this.isGettingSuggestions = false;
      },
      error: (error) => {
        console.error('Error getting suggestions:', error);
        // If AI fails, just create the original task
        this.createOriginalTask();
        this.isGettingSuggestions = false;
      }
    });
  }

  createOriginalTask(): void {
    const newTodo: Todo = {
      id: 0,
      taskName: this.originalTaskData.taskName,
      isCompleted: false,
      deadline: this.originalTaskData.deadline
    };

    this.todoService.createTodo(newTodo).subscribe({
      next: (todo) => {
        this.taskArray.push(todo);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating todo:', error);
        this.errorMessage = 'Failed to create todo. Please try again.';
      }
    });
  }

  createTasksFromSuggestions(selectedTasks: string[]): void {
    // Add original task
    const tasks = [this.originalTaskData.taskName, ...selectedTasks];
    
    // Create all selected tasks
    const createRequests = tasks.map(taskName => {
      const newTodo: Todo = {
        id: 0,
        taskName: taskName,
        isCompleted: false,
        deadline: this.originalTaskData.deadline
      };
      return this.todoService.createTodo(newTodo);
    });

    // Execute all requests
    this.isLoading = true;
    Promise.all(createRequests.map(req => req.toPromise())).then(
      (todos) => {
        todos.forEach(todo => {
          if (todo) this.taskArray.push(todo);
        });
        this.resetForm();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating todos:', error);
        this.errorMessage = 'Failed to create some todos. Please try again.';
        this.isLoading = false;
      }
    );
  }

  acceptSuggestions(selectedIndices: number[]): void {
    const selectedTasks = selectedIndices.map(i => this.suggestedTasks[i]);
    this.createTasksFromSuggestions(selectedTasks);
  }

  rejectSuggestions(): void {
    this.createOriginalTask();
  }

  resetForm(): void {
    this.showSuggestions = false;
    this.suggestedTasks = [];
    this.originalTaskData = null;
    this.selectedSuggestions = [];
  }

  onDelete(index: number): void {
    const todo = this.taskArray[index];
    if (todo.id) {
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.taskArray.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
          this.errorMessage = 'Failed to delete todo. Please try again.';
        }
      });
    }
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  getSelectedIndices(): number[] {
    return this.selectedSuggestions
      .map((selected, index) => selected ? index : -1)
      .filter(index => index !== -1);
  }

  getAllIndices(): number[] {
    return this.suggestedTasks.map((_, index) => index);
  }

  askAi(){
    var param = this.question;
    this.todoService.askAi(param).subscribe({
      next:(aiAnswer: string) => {
        this.answer = aiAnswer;
      },
      error: (error)=>{
          console.error('Error with AI:', error);
          this.errorMessage = 'Failed to get AI response. Please try again.';
      }
    })
  }
}