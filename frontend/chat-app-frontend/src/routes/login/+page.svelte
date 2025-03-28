<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authService } from '$lib/services/auth';
  
  let email = '';
  let password = '';
  let error = '';

  async function handleLogin() {
    // Basic validation
    if (!email || !password) {
      error = 'Email and password are required';
      return;
    }

    try {
      const user = await authService.login(email, password);
      goto('/chat');
    } catch (err: any) {
      error = err.response?.data?.message || 'Login failed';
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center">Login</h2>
    
    {#if error}
      <div class="p-2 text-red-500 bg-red-100 rounded">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block mb-2">Email</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="password" class="block mb-2">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <button 
        type="submit" 
        class="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </form>
    
    <p class="text-center">
      Don't have an account? <a href="/register" class="text-blue-500">Register</a>
    </p>
  </div>
</div>