// Auto-generated Supabase types (à regénérer avec CLI Supabase)
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
      profiles: any
      subscriptions: any
      quotas: any
      matches: any
      conversations: any
      messages: any
      astra_conversations: any
      astra_messages: any
      astra_memory: any
      guardian_events: any
      horoscopes: any
      profile_views: any
      notifications: any
    }
  }
}
