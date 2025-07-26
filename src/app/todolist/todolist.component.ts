import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
        isCompleted: false 
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
}