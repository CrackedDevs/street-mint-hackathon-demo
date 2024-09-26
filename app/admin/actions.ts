"use server";

import {
  getAllCollections,
  getCollectionsByArtistId,
} from "@/lib/supabaseClient";

export async function loginAdmin(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const fetchedCollections = await getAllCollections();
    return { success: true, collections: fetchedCollections };
  } else {
    return { success: false, collections: [] };
  }
}
