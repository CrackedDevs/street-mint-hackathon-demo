export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          avatar_url: string
          bio: string
          collections: number[] | null
          email: string
          farcaster_username: string | null
          id: number
          instagram_username: string | null
          linkedin_username: string | null
          username: string
          wallet_address: string
          x_username: string | null
        }
        Insert: {
          avatar_url: string
          bio: string
          collections?: number[] | null
          email: string
          farcaster_username?: string | null
          id: number
          instagram_username?: string | null
          linkedin_username?: string | null
          username: string
          wallet_address: string
          x_username?: string | null
        }
        Update: {
          avatar_url?: string
          bio?: string
          collections?: number[] | null
          email?: string
          farcaster_username?: string | null
          id?: number
          instagram_username?: string | null
          linkedin_username?: string | null
          username?: string
          wallet_address?: string
          x_username?: string | null
        }
        Relationships: []
      }
      collectibles: {
        Row: {
          chain: string
          collection_id: number
          description: string
          gallery_urls: string[]
          id: number
          location: string | null
          metadata_uri: string | null
          name: string
          price_usd: number
          primary_image_url: string
          quantity: number | null
          quantity_type: Database["public"]["Enums"]["quantity_type"]
        }
        Insert: {
          chain?: string
          collection_id: number
          description: string
          gallery_urls: string[]
          id: number
          location?: string | null
          metadata_uri?: string | null
          name: string
          price_usd: number
          primary_image_url: string
          quantity?: number | null
          quantity_type: Database["public"]["Enums"]["quantity_type"]
        }
        Update: {
          chain?: string
          collection_id?: number
          description?: string
          gallery_urls?: string[]
          id?: number
          location?: string | null
          metadata_uri?: string | null
          name?: string
          price_usd?: number
          primary_image_url?: string
          quantity?: number | null
          quantity_type?: Database["public"]["Enums"]["quantity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "collectibles_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          artist: number
          collection_mint_public_key: string | null
          description: string
          id: number
          merkle_tree_public_key: string | null
          metadata_uri: string | null
          name: string
        }
        Insert: {
          artist: number
          collection_mint_public_key?: string | null
          description: string
          id: number
          merkle_tree_public_key?: string | null
          metadata_uri?: string | null
          name: string
        }
        Update: {
          artist?: number
          collection_mint_public_key?: string | null
          description?: string
          id?: number
          merkle_tree_public_key?: string | null
          metadata_uri?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_artist_fkey"
            columns: ["artist"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          device_id: string | null
          id: number
          nft_id: number | null
          reciever_wallet_address: string | null
          status: string | null
        }
        Insert: {
          device_id?: string | null
          id?: number
          nft_id?: number | null
          reciever_wallet_address?: string | null
          status?: string | null
        }
        Update: {
          device_id?: string | null
          id?: number
          nft_id?: number | null
          reciever_wallet_address?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quantity_type: "limited" | "unlimited" | "single"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
