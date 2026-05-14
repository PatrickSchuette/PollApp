import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            'https://yyqxjyxndhndhhnsxdaa.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXhqeXhuZGhuZGhobnN4ZGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDg5ODUsImV4cCI6MjA5NDMyNDk4NX0.dCjduk0ujLmHx9MxCajQa5Ba9S7gRihZRmtrfA7oeR0'
        );
    }

    get client(): SupabaseClient {
        return this.supabase;
    }
}
