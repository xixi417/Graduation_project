
<template>
  <div></div>
</template>

<script setup>

// 一进来就跳到登录页
import { useRouter } from 'vue-router'
useRouter().replace('/register/login')
</script>