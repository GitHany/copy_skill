---
layout: no-layout
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

onMounted(() => {
  router.go('/commands')
})
</script>

<template>
  <div class="home-redirect">
    <div class="loader">
      <div class="loader-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 17l6-6-6-6M12 19h8"/>
        </svg>
      </div>
      <h1>Copy Skill</h1>
      <p>正在加载命令参考文档...</p>
    </div>
  </div>
</template>

<style scoped>
.home-redirect {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c0c0f;
  color: #f4f4f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.loader {
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.loader-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0c0c0f;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #f4f4f5, #a1a1aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  font-size: 14px;
  color: #71717a;
}
</style>
