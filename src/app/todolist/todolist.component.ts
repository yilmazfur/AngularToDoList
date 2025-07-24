import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todolist',
  imports: [FormsModule, CommonModule],
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.scss'
})
export class TodolistComponent implements OnInit {
  todos: string[] = [];
  newTodo: string = '';
  taskArray = [
    {name: 'Task 1', isCompleted: true},
    {name: 'Task 2', isCompleted: false},
  ];

  ngOnInit(): void {
    // Initialize with some default todos
    this.todos = ['Learn Angular', 'Build a Todo App'];
  }

  onSubmit(form :NgForm): void {
    console.log('Form submitted:', form);
    // this.taskArray.push({name: form.value.task, isCompleted: false});
    this.taskArray.push({name: form.controls['task'].value, isCompleted: false});

    form.reset(); // Reset the form after submission

  }

  onDelete(index: number): void {
    console.log('Deleting task at index:', index);
    this.taskArray.splice(index, 1);
  }

  onCheck(index: number): void {
    // Logic for checking/unchecking a task can be added here
    console.log('Checking task at index:', index);
    this.taskArray[index].isCompleted = !this.taskArray[index].isCompleted;

  }

  // addTodo(): void {
  //   if (this.newTodo.trim()) {
  //     this.todos.push(this.newTodo.trim());
  //     this.newTodo = '';
  //   }
  // }

  // removeTodo(index: number): void {
  //   this.todos.splice(index, 1);
  // }

}
