// src/lib/services/chat.ts
import axios from 'axios';
import io from 'socket.io-client';
import { authStore, roomsStore, messagesStore, currentRoomStore } from '../stores/store';
import type { Message, Room } from '../stores/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
let socket: any;

export const chatService = {
	async connectSocket() {
		const token = localStorage.getItem('chat_token');
		if (!token) throw new Error('No authentication token');

		if (socket) {
			console.log('Socket already connected');
			return socket;
		}

		socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
			auth: { token },
			reconnection: true, // Auto-reconnect
			reconnectionAttempts: 5, // Try 5 times
			reconnectionDelay: 1000 // Delay between reconnects
		});

		socket.on('connect', async () => {
			console.log('Socket reconnected');

			// Automatically rejoin the last room
			const currentRoom = localStorage.getItem('current_room');
			if (currentRoom) {
				socket.emit('join-room', currentRoom);
				currentRoomStore.set({ id: currentRoom } as any);
			}
		});

		socket.on('new-message', (message: Message) => {
			messagesStore.update((messages) => [...messages, message]);
		});

		return socket;
	},
	async getRooms() {
		try {
			const token = localStorage.getItem('chat_token');
			const response = await axios.get<Room[]>(`${API_URL}/chat/rooms`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			roomsStore.set(response.data);
			return response.data;
		} catch (error) {
			console.error('Error fetching rooms:', error);
			throw error;
		}
	},

	async createRoom(name: string, isPrivate = false) {
		try {
			const token = localStorage.getItem('chat_token');
			const response = await axios.post<Room>(
				`${API_URL}/chat/rooms`,
				{ name, isPrivate },
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			roomsStore.update((rooms) => [...rooms, response.data]);
			return response.data;
		} catch (error) {
			console.error('Error creating room:', error);
			throw error;
		}
	},

	async joinRoom(roomId: string) {
		try {
			const token = localStorage.getItem('chat_token');
			await axios.post(
				`${API_URL}/chat/rooms/${roomId}/join`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// Join socket room
			socket?.emit('join-room', roomId);
			currentRoomStore.set({ id: roomId } as any);
			return roomId;
		} catch (error) {
			console.error('Error joining room:', error);
			throw error;
		}
	},

	async getMessages(roomId: string, limit = 50) {
		try {
			const token = localStorage.getItem('chat_token');
			const response = await axios.get<Message[]>(`${API_URL}/chat/rooms/${roomId}/messages`, {
				params: { limit },
				headers: { Authorization: `Bearer ${token}` }
			});

			messagesStore.set(response.data);
			return response.data;
		} catch (error) {
			console.error('Error fetching messages:', error);
			throw error;
		}
	},

	sendMessage(roomId: string, content: string, fileId: string | null = null) {
		socket?.emit('send-message', { roomId, content, fileId });
	},

	async uploadImage(file: File) {
		try {
			const token = localStorage.getItem('chat_token');
			const formData = new FormData();
			formData.append('file', file);

			const response = await axios.post(`${API_URL}/files/upload`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data'
				}
			});

			return response.data;
		} catch (error) {
			console.error('Error uploading image:', error);
			throw error;
		}
	},

	disconnect() {
		socket?.disconnect();
	}
};
