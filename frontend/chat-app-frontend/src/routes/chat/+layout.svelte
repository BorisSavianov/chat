<!-- src/routes/chat/+layout.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, isAuthenticated } from '$lib/stores/store';
  import { authService } from '$lib/services/auth';
  import { chatService } from '$lib/services/chat';

  let loading = true;

onMount(() => {
  authService.checkAuth().finally(() => {
    loading = false;
    if (!$isAuthenticated) {
      goto('/login');
    }
  });
});

  // Logout function
  function handleLogout() {
    authService.logout();
    chatService.disconnect();
    goto('/login');
  }
</script>

{#if loading}
<div>Loading...</div>
{:else}
<div class="flex h-screen">
  <!-- Sidebar -->
  <div class="w-64 bg-gray-800 text-white p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Chat App</h1>
      {#if $authStore.user}
        <p class="text-sm text-gray-400">Welcome, {$authStore.user.username}</p>
      {/if}
    </div>

    <nav class="space-y-2">
      <a 
        href="/chat" 
        class="block p-2 {$page.url.pathname === '/chat' ? 'bg-blue-600' : 'hover:bg-gray-700'} rounded"
      >
        Chat Rooms
      </a>
      <a 
        href="/chat/profile" 
        class="block p-2 {$page.url.pathname === '/chat/profile' ? 'bg-blue-600' : 'hover:bg-gray-700'} rounded"
      >
        Profile
      </a>
      <button 
        on:click={handleLogout}
        class="w-full text-left p-2 hover:bg-red-600 rounded"
      >
        Logout
      </button>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="flex-1 bg-gray-100 overflow-hidden">
    <slot />
  </div>
</div>
{/if}