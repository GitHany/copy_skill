---
layout: no-layout
title: 测试页面
---

<script setup>
import { ref } from 'vue'

const testClick = () => {
  alert('点击成功！')
}
</script>

<template>
  <div style="padding: 40px;">
    <h1>测试页面</h1>
    <button @click="testClick" style="padding: 20px; font-size: 18px; cursor: pointer;">
      点击测试
    </button>
  </div>
</template>
