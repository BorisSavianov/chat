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

  onMount(async () => {
    try {
      const roomId = $page.params.roomId;
      
      // Fetch room details and messages
      await chatService.getMessages(roomId);
      
      // Subscribe to messages store
      const unsubscribe = messagesStore.subscribe(value => {
        messages = value;
      });

      return unsubscribe;
    } catch (err) {
      error = 'Failed to load room';
    }
  });

  function sendMessage() {
    if (!messageInput.trim()) return;

    try {
      const roomId = $page.params.roomId;
      chatService.sendMessage(roomId, messageInput);
      messageInput = '';
    } catch (err) {
      error = 'Failed to send message';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
</script>

<div class="flex flex-col h-full">
  {#if error}
    <div class="bg-red-100 text-red-700 p-4">{error}</div>
  {/if}

  <div class="flex-1 overflow-y-auto p-4">
    {#each messages as message}
      <div 
        class="mb-4 {message.sender_id === $authStore.user?.id 
          ? 'text-right' 
          : 'text-left'}"
      >
        <div 
          class="inline-block p-2 rounded {
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
          <div>{message.content}</div>
          <div class="text-xs opacity-50 mt-1">
            {formatDate(message.created_at.toString())}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="p-4 bg-white border-t">
    <form on:submit|preventDefault={sendMessage} class="flex space-x-2">
      <input 
        type="text" 
        bind:value={messageInput}
        placeholder="Type a message..." 
        class="flex-1 p-2 border rounded"
      />
      <button 
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send
      </button>
    </form>
  </div>
</div>