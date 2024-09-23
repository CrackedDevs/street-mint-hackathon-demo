'use server'

import { createClient } from "@supabase/supabase-js";
import { createFetch } from "./supabaseClient";
import { Database } from "./types/database.types";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function getSupabaseAdmin() {
    return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
        global: {
            fetch: createFetch({
                cache: 'no-store',
            }),
        },
    });
}