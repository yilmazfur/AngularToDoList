import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodolistComponent } from './todolist/todolist.component'; //import eklendi
import { TodoStore } from './todolist/store/todos.store';


@Component({
  selector: 'app-root',
  imports: [ TodolistComponent, FormsModule], //import eklendi
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'todo';
  store = inject(TodoStore);//burada inject ettik ama yeterli degil todos.store.ts icinde {providedIn: 'root'} eklenmeli
}
