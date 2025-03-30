<script>
  import { goto } from "$app/navigation";
  
  function navigateToChat() {
    goto("/chat");
  }
</script>

<title>ChatApp</title>
<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div class="text-center max-w-2xl p-8 bg-white rounded-2xl shadow-lg">
    <h1 class="text-4xl font-bold text-blue-600">Welcome to ChatApp</h1>
    <p class="mt-4 text-gray-600 text-lg">
      Connect with your friends and colleagues in real-time. 
      Our chat app is secure, fast, and reliable. Join a chat room and start messaging instantly!
    </p>
    <button 
      on:click={navigateToChat}
      class="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-lg shadow-md hover:bg-blue-600 transition"
    >
      Get Started
    </button>
  </div>
</div>
