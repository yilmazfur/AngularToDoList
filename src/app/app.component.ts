import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodolistComponent } from './todolist/todolist.component'; //import eklendi


@Component({
  selector: 'app-root',
  imports: [ TodolistComponent, FormsModule], //import eklendi
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'todo';
}
