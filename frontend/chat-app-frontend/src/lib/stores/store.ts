// src/lib/stores/store.ts
import { writable, derived } from "svelte/store";
import type { Writable } from "svelte/store";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Room {
  id: string;
  name: string;
  is_private: boolean;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: Date;
  username?: string;
}

export interface AuthStore {
  user: User | null;
  token: string | null;
}

// Authentication store
export const authStore: Writable<AuthStore> = writable({
  user: null,
  token: null,
});

// Rooms store
export const roomsStore: Writable<Room[]> = writable([]);

// Current selected room
export const currentRoomStore: Writable<Room | null> = writable(null);

// Messages store
export const messagesStore: Writable<Message[]> = writable([]);

// Is user authenticated?
export const isAuthenticated = derived(
  authStore,
  ($authStore) => !!$authStore.token
);
