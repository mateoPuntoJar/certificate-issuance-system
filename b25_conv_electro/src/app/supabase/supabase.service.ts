import { Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor() {}

  get client() {
    return supabase;
  }
}
