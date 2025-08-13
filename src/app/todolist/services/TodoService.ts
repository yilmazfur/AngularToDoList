import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/Todo'; 
import { TaskSuggestions } from '../models/TaskSuggestions';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'https://localhost:7263/ToDo';//local
  // private apiUrl = 'http://localhost:5000/ToDo';//docker
  // private apiUrl = 'http://localhost:30080/ToDo';//kubernetes


  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Get all todos
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  // Get todo by id
  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  // Create new todo
  createTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo, this.httpOptions);
  }

  // Update todo
  updateTodo(id: number, todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo, this.httpOptions);
  }

  // Delete todo
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  askAi(question: string): Observable<string>{
    const httpOptionsText = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };
    return this.http.post<string>(this.apiUrl + "/OpenAI", JSON.stringify(question), httpOptionsText)
  }

  suggestRelatedTasks(taskName: string): Observable<TaskSuggestions> {   
    return this.http.post<TaskSuggestions>(this.apiUrl + "/OpenAI/suggest-tasks", JSON.stringify(taskName), this.httpOptions);
  }
}