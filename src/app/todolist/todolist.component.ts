import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, AbstractControl, ValidationErrors, ValidatorFn  } from '@angular/forms';
import { TodoService } from './services/TodoService';
import { Todo } from './models/Todo';

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
      const newTodo: Todo = {
        id: 0, // fix it 
        taskName: form.value.task, 
        isCompleted: false,
        deadline:form.value.deadline
      };

      this.todoService.createTodo(newTodo).subscribe({
        next: (todo) => {
          this.taskArray.push(todo);
          form.reset();
        },
        error: (error) => {
          console.error('Error creating todo:', error);
          this.errorMessage = 'Failed to create todo. Please try again.';
        }
      });
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
  
  notPastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values
      }
      
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        return { pastDate: true };
      }
      
      return null;
    };
  }

}