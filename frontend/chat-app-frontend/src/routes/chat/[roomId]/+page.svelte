<!-- src/routes/chat/room/[roomId]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { chatService } from '$lib/services/chat';
  import { authStore, messagesStore, currentRoomStore } from '$lib/stores/store';
  import type { Message } from '$lib/stores/store';

  let messageInput = '';
  let messages: Message[] = [];
  let error = '';
  let uploading = false;
  let selectedFile: File | null = null;
  let previewUrl: string | null = null;
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  onMount(async () => {
    try {
      const roomId = $page.params.roomId;

      // Save room ID to local storage for auto-reconnect
      localStorage.setItem("current_room", roomId);

      // Fetch room details and messages
      await chatService.getMessages(roomId);

      // Ensure WebSocket is connected
      const socket = await chatService.connectSocket();
      
      // Always rejoin the room after refresh
      socket.emit("join-room", roomId);
      currentRoomStore.set({ id: roomId } as any);

      // Subscribe to message updates
      const unsubscribe = messagesStore.subscribe(value => {
        messages = value;
      });

      return unsubscribe;
    } catch (err) {
      error = 'Failed to load room';
    }
  });

  async function sendMessage() {
    if ((!messageInput.trim() && !selectedFile) || uploading) return;

    try {
      const roomId = $page.params.roomId;
      
      // If there's an image, upload it first
      let fileId = null;
      if (selectedFile) {
        uploading = true;
        try {
          const fileData = await chatService.uploadImage(selectedFile);
          fileId = fileData.id;
        } catch (err) {
          error = 'Failed to upload image';
          uploading = false;
          return;
        } finally {
          uploading = false;
        }
      }
      
      // Send the message with or without file ID
      chatService.sendMessage(roomId, messageInput, fileId);
      
      // Reset form
      messageInput = '';
      selectedFile = null;
      previewUrl = null;
    } catch (err) {
      error = 'Failed to send message';
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      selectedFile = null;
      previewUrl = null;
      return;
    }
    
    const file = target.files[0];
    // Check if file is an image
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      error = 'Only image files are allowed (JPEG, PNG, GIF)';
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      error = 'File size exceeds 5MB limit';
      return;
    }
    
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
  }

  function clearSelectedFile() {
    selectedFile = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
</script>

<title>Chat</title>
<div class="flex flex-col h-full">
  {#if error}
    <div class="bg-red-100 text-red-700 p-4 mb-2">{error}</div>
  {/if}

  <div class="flex-1 overflow-y-auto p-4">
    {#each messages as message}
      <div 
        class="mb-4 {message.sender_id === $authStore.user?.id 
          ? 'text-right' 
          : 'text-left'}"
      >
        <div 
          class="inline-block p-2 rounded max-w-xs md:max-w-md {
            message.sender_id === $authStore.user?.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }"
        >
          {#if message.sender_id !== $authStore.user?.id}
            <div class="text-xs text-gray-600 mb-1">
              {message.username}
            </div>
          {/if}
          
          <!-- Image message -->
          {#if message.message_type === 'image' && message.fileUrl}
            <img 
              src="{API_URL}{message.fileUrl}" 
              alt="Image message" 
              class="max-w-full rounded mb-1"
            />
          {/if}
          
          <!-- Text content -->
          {#if message.content}
            <div>{message.content}</div>
          {/if}
          
          <div class="text-xs opacity-50 mt-1">
            {formatDate(message.created_at.toString())}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="p-4 bg-white border-t">
    <!-- Image preview if selected -->
    {#if previewUrl}
      <div class="mb-2 relative inline-block">
        <img src={previewUrl} alt="Preview" class="h-24 rounded" />
        <button 
          class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          on:click={clearSelectedFile}
        >
          ×
        </button>
      </div>
    {/if}
    
    <form on:submit|preventDefault={sendMessage} class="flex space-x-2">
      <input 
        type="text" 
        bind:value={messageInput}
        placeholder="Type a message..." 
        class="flex-1 p-2 border rounded"
      />
      
      <div class="relative">
        <input 
          type="file" 
          id="file-upload" 
          on:change={handleFileSelect}
          accept="image/*"
          class="hidden"
        />
        <label 
          for="file-upload" 
          class="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
      </div>
      
      <button 
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={uploading}
      >
        {#if uploading}
          Sending...
        {:else}
          Send
        {/if}
      </button>
    </form>
  </div>
</div>