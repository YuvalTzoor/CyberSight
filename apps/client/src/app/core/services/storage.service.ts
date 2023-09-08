import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get<Type>(name: string): Type | null {
    try {
      return JSON.parse(localStorage.getItem(name) as string);
    } catch (error) {
      return null;
    }
  }

  set(name: string, value: string): void {
    localStorage.setItem(name, value);
  }

  remove(name: string): void {
    localStorage.removeItem(name);
  }
}
