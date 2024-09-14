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
          chain: string | null
          collection_id: number
          created_at: string
          description: string
          gallery_urls: string[]
          id: number
          location: string | null
          metadata_uri: string | null
          name: string
          nfc_public_key: string | null
          price_usd: number
          primary_image_url: string
          quantity: number | null
          quantity_type: Database["public"]["Enums"]["quantity_type"]
        }
        Insert: {
          chain?: string | null
          collection_id: number
          created_at?: string
          description: string
          gallery_urls: string[]
          id?: number
          location?: string | null
          metadata_uri?: string | null
          name: string
          nfc_public_key?: string | null
          price_usd: number
          primary_image_url: string
          quantity?: number | null
          quantity_type: Database["public"]["Enums"]["quantity_type"]
        }
        Update: {
          chain?: string | null
          collection_id?: number
          created_at?: string
          description?: string
          gallery_urls?: string[]
          id?: number
          location?: string | null
          metadata_uri?: string | null
          name?: string
          nfc_public_key?: string | null
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
      nfc_taps: {
        Row: {
          created_at: string | null
          id: number
          random_number: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          random_number: string
        }
        Update: {
          created_at?: string | null
          id?: number
          random_number?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          collectible_id: number | null
          collection_id: number | null
          created_at: string | null
          device_id: string | null
          id: string
          max_supply: number | null
          mint_address: string | null
          mint_signature: string | null
          nft_type: string | null
          price_sol: number | null
          price_usd: number | null
          quantity: number | null
          status: string | null
          transaction_signature: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          collectible_id?: number | null
          collection_id?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          max_supply?: number | null
          mint_address?: string | null
          mint_signature?: string | null
          nft_type?: string | null
          price_sol?: number | null
          price_usd?: number | null
          quantity?: number | null
          status?: string | null
          transaction_signature?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          collectible_id?: number | null
          collection_id?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          max_supply?: number | null
          mint_address?: string | null
          mint_signature?: string | null
          nft_type?: string | null
          price_sol?: number | null
          price_usd?: number | null
          quantity?: number | null
          status?: string | null
          transaction_signature?: string | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "collectibles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_nft_availability: {
        Args: {
          p_collectible_id: number
        }
        Returns: boolean
      }
      create_order_and_record_attempt: {
        Args: {
          p_wallet_address: string
          p_collectible_id: number
          p_device_id: string
          p_transaction_signature: string
        }
        Returns: Json
      }
      is_mint_allowed: {
        Args: {
          p_wallet_address: string
          p_collectible_id: number
          p_device_id: string
        }
        Returns: boolean
      }
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
