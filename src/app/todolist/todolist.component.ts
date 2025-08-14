import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TodoStore } from './store/todos.store';

@Component({
  selector: 'app-todolist',
  imports: [CommonModule, FormsModule],
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.scss'
})
export class TodolistComponent implements OnInit {
  
  readonly store = inject(TodoStore);

  ngOnInit(): void {
    this.store.loadTodos();
  }

  // Use store methods instead of component methods
  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.store.getSuggestions(form.value.task, form.value.deadline);
    }
  }

  onCheck(index: number): void {
    this.store.updateTodo(index);
  }

  onDelete(index: number): void {
    this.store.deleteTodo(index);
  }

  acceptSuggestions(selectedIndices: number[]): void {
    this.store.acceptSuggestions(selectedIndices);
  }

  rejectSuggestions(): void {
    this.store.rejectSuggestions();
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  getSelectedIndices(): number[] {
    return this.store.selectedSuggestions()
      .map((selected, index) => selected ? index : -1)
      .filter(index => index !== -1);
  }

  getAllIndices(): number[] {
    return this.store.suggestedTasks().map((_, index) => index);
  }

  askAi(): void {
    const question = this.store.question();
    if (question.trim()) {
      this.store.askAi(question);
    }
  }

  onQuestionChange(question: string): void {
    this.store.updateQuestion(question);
  }

  onSuggestionChange(index: number, event: any): void {
    this.store.updateSelectedSuggestion(index, event.target.checked);
  }

  loadTodos(): void {
    this.store.loadTodos();
  }
}