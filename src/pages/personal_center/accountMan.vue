<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <span class="back-icon" @click="handleBack">←</span>
      <span class="page-title">账号管理</span>
    </div>

    <!-- 1. 修改密码模块 -->
    <div class="module-card">
      <div class="module-title">修改密码</div>
      <div class="form-item">
        <label class="form-label">旧密码</label>
        <input 
          type="password" 
          v-model="oldPassword" 
          class="form-input"
          placeholder="请输入当前密码"
        />
      </div>
      <div class="form-item">
        <label class="form-label">新密码</label>
        <input 
          type="password" 
          v-model="newPassword" 
          class="form-input"
          placeholder="请输入6-16位新密码"
          maxlength="16"
        />
      </div>
      <div class="form-item">
        <label class="form-label">确认新密码</label>
        <input 
          type="password" 
          v-model="confirmPassword" 
          class="form-input"
          placeholder="请再次输入新密码"
          maxlength="16"
        />
      </div>
      <button class="submit-btn" @click="handleChangePwd">确认修改</button>
    </div>

    <!-- 2. 消息通知设置模块 -->
    <div class="module-card">
      <div class="module-title">消息通知设置</div>
      <div class="setting-item">
        <span class="setting-label">打卡提醒</span>
        <el-switch 
          v-model="notificationSettings.checkIn" 
          @change="handleNotificationChange"
          active-color="#4CBF99"
          inactive-color="#E0E0E0"
        />
      </div>
      <div class="setting-item">
        <span class="setting-label">学习计划提醒</span>
        <el-switch 
          v-model="notificationSettings.plan" 
          @change="handleNotificationChange"
          active-color="#4CBF99"
          inactive-color="#E0E0E0"
        />
      </div>
      <div class="setting-item">
        <span class="setting-label">进度落后提醒</span>
        <el-switch 
          v-model="notificationSettings.progress" 
          @change="handleNotificationChange"
          active-color="#4CBF99"
          inactive-color="#E0E0E0"
        />
      </div>
    </div>


    <!-- 底部Tab栏 -->
    <div class="tab-bar">
      <div 
        class="tab-item" 
        v-for="item in tabList" 
        :key="item.name"
        :class="{ active: activeTab === item.name }"
        @click="handleTabClick(item)"
      >
        <component :is="item.icon" size="24" />
        <div class="tab-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElSwitch } from 'element-plus'
import { House, Flag, Star, Timer, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 存储KEY定义
const NOTIFICATION_STORAGE_KEY = 'study_app_notification_settings'
const THEME_STORAGE_KEY = 'study_app_dark_mode'
const PWD_STORAGE_KEY = 'study_app_user_pwd' // 模拟密码存储（实际项目需后端交互）

// 1. 修改密码相关
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 模拟初始密码（实际项目从后端获取）
const initPwd = localStorage.getItem(PWD_STORAGE_KEY) || '123456'

// 2. 消息通知设置（持久化）
const initNotificationSettings = () => {
  let settings = null
  try {
    // 兼容小程序/网页端
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      settings = wx.getStorageSync(NOTIFICATION_STORAGE_KEY)
    } else {
      settings = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      settings = settings ? JSON.parse(settings) : null
    }
  } catch (e) {
    console.error('读取通知设置失败:', e)
  }
  // 默认开启所有通知
  return {
    checkIn: true,
    plan: true,
    progress: true,
    ...settings
  }
}
const notificationSettings = reactive(initNotificationSettings())

// 3. 主题模式切换（持久化）
const isDarkMode = ref(false)
const initThemeMode = () => {
  try {
    let mode = false
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      mode = wx.getStorageSync(THEME_STORAGE_KEY)
    } else {
      mode = localStorage.getItem(THEME_STORAGE_KEY) === 'true'
    }
    isDarkMode.value = mode
    // 应用主题
    applyTheme(mode)
  } catch (e) {
    console.error('读取主题设置失败:', e)
  }
}

// 4. 底部Tab
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/profile' }
])
const activeTab = ref('个人')

// 初始化
onMounted(() => {
  // 初始化主题
  initThemeMode()
  // 匹配当前Tab
  const currentPath = route.path
  const matchedTab = tabList.value.find(item => item.path === currentPath)
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
})

// 监听主题变化
watch(isDarkMode, (newVal) => {
  applyTheme(newVal)
  // 保存到本地
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(THEME_STORAGE_KEY, newVal)
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, newVal)
    }
  } catch (e) {
    console.error('保存主题设置失败:', e)
  }
})

// 应用主题样式
const applyTheme = (isDark) => {
  const html = document.documentElement
  if (isDark) {
    html.classList.add('dark-mode')
  } else {
    html.classList.remove('dark-mode')
  }
}

// 返回上一页
const handleBack = () => {
  router.go(-1)
}

// 修改密码提交
const handleChangePwd = () => {
  // 校验
  if (!oldPassword.value) {
    alert('请输入旧密码')
    return
  }
  if (oldPassword.value !== initPwd) {
    alert('旧密码输入错误')
    return
  }
  if (!newPassword.value || newPassword.value.length < 6 || newPassword.value.length > 16) {
    alert('请输入6-16位新密码')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的新密码不一致')
    return
  }
  if (oldPassword.value === newPassword.value) {
    alert('新密码不能与旧密码相同')
    return
  }

  // 模拟保存密码（实际项目调用后端接口）
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(PWD_STORAGE_KEY, newPassword.value)
    } else {
      localStorage.setItem(PWD_STORAGE_KEY, newPassword.value)
    }
    alert('密码修改成功！请重新登录')
    // 清空输入框
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    // 可跳转到登录页
    // router.push('/login')
  } catch (e) {
    console.error('保存密码失败:', e)
    alert('密码修改失败，请重试')
  }
}

// 通知设置变更
const handleNotificationChange = () => {
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(NOTIFICATION_STORAGE_KEY, { ...notificationSettings })
    } else {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationSettings))
    }
    alert('通知设置已保存')
  } catch (e) {
    console.error('保存通知设置失败:', e)
    alert('通知设置保存失败，请重试')
  }
}

// 主题切换ss
const handleThemeChange = () => {
  // 由watch自动处理保存和应用
  alert(`已切换为${isDarkMode.value ? '深色模式' : '浅色模式'}`)
}

// Tab点击跳转
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}
</script>

<style scoped>


/* 深色模式适配 */
.dark-mode {
  --bg-color: #181818;
  --card-bg: #282828;
  --text-color: #FFFFFF;
  --text-secondary: #CCCCCC;
  --border-color: #383838;
}



/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 15px;
}

.dark-mode .page-header {
  background-color: var(--card-bg, #282828);
  color: var(--text-color, #FFFFFF);
}

.back-icon {
  font-size: 18px;
  cursor: pointer;
  margin-right: 10px;
  color: #333;
}

.dark-mode .back-icon {
  color: var(--text-color, #FFFFFF);
}

.page-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dark-mode .page-title {
  color: var(--text-color, #FFFFFF);
}

/* 模块卡片 */
.module-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin: 0 15px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.dark-mode .module-card {
  background-color: var(--card-bg, #282828);
  color: var(--text-color, #FFFFFF);
}

.module-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EEEEEE;
}

.dark-mode .module-title {
  color: var(--text-color, #FFFFFF);
  border-bottom-color: var(--border-color, #383838);
}

/* 表单样式 */
.form-item {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.dark-mode .form-label {
  color: var(--text-secondary, #CCCCCC);
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  background-color: #FAFAFA;
}

.dark-mode .form-input {
  border-color: var(--border-color, #383838);
  background-color: var(--bg-color, #181818);
  color: var(--text-color, #FFFFFF);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CBF99;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3A9E78;
}

/* 设置项样式 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #EEEEEE;
}

.dark-mode .setting-item {
  border-bottom-color: var(--border-color, #383838);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #333;
}

.dark-mode .setting-label {
  color: var(--text-color, #FFFFFF);
}

/* 主题切换样式 */
.theme-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.theme-label {
  font-size: 14px;
  color: #333;
}

.dark-mode .theme-label {
  color: var(--text-color, #FFFFFF);
}

</style>
