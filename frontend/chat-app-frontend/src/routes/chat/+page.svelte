<!-- src/routes/chat/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { chatService } from '$lib/services/chat';
  import type { Room } from '$lib/stores/store';
  import { roomsStore, currentRoomStore } from '$lib/stores/store';
  import { goto } from '$app/navigation';

  let newRoomName = '';
  let error = '';

  onMount(async () => {
    try {
      await chatService.getRooms();
      await chatService.connectSocket();
    } catch (err) {
      error = 'Failed to load rooms';
    }
  });

  async function createRoom() {
    if (!newRoomName) {
      error = 'Room name is required';
      return;
    }

    try {
      await chatService.createRoom(newRoomName);
      newRoomName = '';
      error = '';
    } catch (err) {
      error = 'Failed to create room';
    }
  }

  async function joinRoom(room: Room) {
    try {
       let tempAdd = await chatService.joinRoom(room.id);
       currentRoomStore.set(room);
       goto('chat/' + tempAdd)
    } catch (err) {
      error = 'Failed to join room';
    }
  }
</script>

<title>Chat rooms</title>
<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Chat Rooms</h1>

  {#if error}
    <div class="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
  {/if}

  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-2">Create New Room</h2>
    <div class="flex space-x-2">
      <input 
        type="text" 
        bind:value={newRoomName} 
        placeholder="Room name" 
        class="flex-1 p-2 border rounded"
      />
      <button 
        on:click={createRoom}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Room
      </button>
    </div>
  </div>

  <div>
    <h2 class="text-lg font-semibold mb-4">Available Rooms</h2>
    {#if $roomsStore.length === 0}
      <p class="text-gray-500">No rooms available</p>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $roomsStore as room}
        <div class="bg-white shadow rounded p-4">
          <h3 class="font-bold mb-2">{room.name}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {room.is_private ? 'Private Room' : 'Public Room'}
          </p>
          <button 
            on:click={() => joinRoom(room)}
            class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Join Room
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>