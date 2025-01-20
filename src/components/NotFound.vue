<!-- src/components/NotFound.vue -->
<template>
    <div>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <router-link to="/">Go back to Home</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound'
  }
  </script>
  
  <style scoped>
  h1 {
    color: #f00;
  }
  </style>