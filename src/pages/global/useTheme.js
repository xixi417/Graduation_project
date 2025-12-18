import { ref, watch, onMounted } from 'vue'

// 主题存储KEY
const THEME_STORAGE_KEY = 'study_app_dark_mode'

export function useTheme() {
  // 全局主题状态（响应式）
  const isDarkMode = ref(false)

  // 初始化主题（页面加载时执行）
  const initTheme = () => {
    try {
      // 兼容小程序/网页端
      let mode = false
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        mode = wx.getStorageSync(THEME_STORAGE_KEY)
      } else {
        mode = localStorage.getItem(THEME_STORAGE_KEY) === 'true'
      }
      isDarkMode.value = mode
      applyTheme(mode)
    } catch (e) {
      console.error('初始化主题失败:', e)
    }
  }

  // 应用主题到全局
  const applyTheme = (isDark) => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark-mode')
    } else {
      html.classList.remove('dark-mode')
    }
  }

  // 切换主题（外部调用）
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
  }

  // 监听主题变化，自动保存+应用
  watch(isDarkMode, (newVal) => {
    applyTheme(newVal)
    // 保存到本地存储
    try {
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync(THEME_STORAGE_KEY, newVal)
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, newVal)
      }
    } catch (e) {
      console.error('保存主题失败:', e)
    }
  }, { immediate: true })

  // 页面挂载时初始化
  onMounted(() => {
    initTheme()
  })

  return {
    isDarkMode,
    toggleTheme,
    initTheme
  }
}