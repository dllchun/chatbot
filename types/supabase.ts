export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          source: string
          whatsapp_number: string | null
          customer: string | null
          messages: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          source: string
          whatsapp_number?: string | null
          customer?: string | null
          messages: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          source?: string
          whatsapp_number?: string | null
          customer?: string | null
          messages?: Json[]
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_analytics: {
        Row: {
          id: string
          chatbot_id: string
          date: string
          total_conversations: number
          total_messages: number
          source_distribution: Json
          avg_response_time_ms: number
          avg_conversation_length: number
          messages_by_hour: Json
          bounce_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          date: string
          total_conversations: number
          total_messages: number
          source_distribution: Json
          avg_response_time_ms: number
          avg_conversation_length: number
          messages_by_hour: Json
          bounce_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          date?: string
          total_conversations?: number
          total_messages?: number
          source_distribution?: Json
          avg_response_time_ms?: number
          avg_conversation_length?: number
          messages_by_hour?: Json
          bounce_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 