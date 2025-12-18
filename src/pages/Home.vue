<template>
  <div class="page-container">
    <!-- 1. 走马灯区域（占页面上方1/3） -->
    <div class="carousel-wrapper">
      <el-carousel 
        height="33.33vh" 
        width="100%"
        indicator-position="bottom" 
        autoplay 
        :interval="3000"
      >
        <!-- 5张轮播图：绑定assets下的p1-p5.png，点击跳转百度 -->
        <el-carousel-item v-for="i in 5" :key="i">
          <a href="https://www.baidu.com" target="_blank" class="carousel-item-link">
            <img :src="getCarouselImage(i)" :alt="`轮播图${i}`" class="carousel-img" />
          </a>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 2. 功能模块区域（SVG 图标） -->
    <div class="function-module">
      <div 
        class="module-item" 
        v-for="item in functionList" 
        :key="item.name"
        @click="handleModuleClick(item.path)"
        :style="{ backgroundColor: item.bgColor }"
      >
        <!-- SVG 图标：直接用 img 标签引入 -->
        <div class="module-icon">
          <img 
            :src="getSvgIcon(item.svgName)" 
            :alt="item.name" 
            class="module-icon-svg"
            :style="{ filter: item.iconFilter }"
          />
        </div>
        <div class="module-name">{{ item.name }}</div>
      </div>
    </div>

    <!-- 3. 打卡+待办/提醒模块 -->
    <div class="interactive-module">
      <!-- 今日打卡按钮 -->
      <button class="check-in-btn" @click="handleCheckIn">
        <span class="check-in-icon">✅</span>
        今日打卡
      </button>

      <!-- 待办任务/学习提醒折叠模块 -->
      <div class="collapse-module">
        <div class="collapse-header" @click="toggleCollapse">
          <span class="collapse-title">待办任务 / 学习提醒</span>
          <span class="collapse-arrow" :class="{ rotate: isCollapseOpen }">▼</span>
        </div>
        <div class="collapse-content" v-show="isCollapseOpen">
          <!-- 预留交互口，暂时为空 -->
          <div class="empty-tip">暂无待办任务/学习提醒，快去添加吧～</div>
        </div>
      </div>
    </div>

    <!-- 4. 底部常驻Tab栏 -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入Element Plus图标（按需选择适配模块的图标）
import { 
  House, Flag, Star, Timer, User
} from '@element-plus/icons-vue'
// 引入Element Plus组件（走马灯）
import { ElCarousel, ElCarouselItem } from 'element-plus'
import { useTheme } from './global/useTheme'

// 主题切换
const { isDarkMode } = useTheme()

// 路由实例（用于页面跳转）
const router = useRouter()

// 激活的底部Tab
const activeTab = ref('首页')

// 折叠面板状态
const isCollapseOpen = ref(false)

// 功能模块列表（两行两列，增加背景色和图标滤镜）
const functionList = ref([
  { 
    name: '学习计划', 
    svgName: 'Plan.svg', 
    path: '/study_plan/study-plan',
    bgColor: '#4CBF99', // 绿底
    iconFilter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)' // 白色图标
  },
  { 
    name: '内容推荐', 
    svgName: 'Recommend.svg', 
    path: '/content-recommend',
    bgColor: '#FF9F48', // 橙底
    iconFilter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)' // 白色图标
  },
  { 
    name: '进度记录', 
    svgName: 'Progress.svg', 
    path: '/progress-record',
    bgColor: '#E0F2F7', // 浅蓝底
    iconFilter: 'invert(39%) sepia(98%) saturate(1349%) hue-rotate(203deg) brightness(93%) contrast(92%)' // 蓝色图标
  },
  { 
    name: '学习报告', 
    svgName: 'Report.svg', 
    path: '/study-report',
    bgColor: '#F3E5F5', // 浅紫底
    iconFilter: 'invert(44%) sepia(8%) saturate(2365%) hue-rotate(236deg) brightness(97%) contrast(90%)' // 紫色图标
  }
])

// 底部Tab列表
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/personal_center/profile' }
])

// 获取轮播图
const getCarouselImage = (index) => {
  try {
    const images = import.meta.glob('../assets/p*.png', { eager: true })
    const imageKey = Object.keys(images).find(key => key.includes(`p${index}.png`))
    return imageKey ? images[imageKey].default : getPlaceholderImage()
  } catch (error) {
    console.error('轮播图加载失败:', error)
    return getPlaceholderImage()
  }
}

// 获取SVG图标
const getSvgIcon = (svgName) => {
  const svgModules = import.meta.glob('../assets/icon/*.svg', {
    eager: true,
    query: 'url'          
  })
  const key = Object.keys(svgModules).find(k => k.endsWith(`/${svgName}`))
  return key ? svgModules[key].default : getDefaultSvg()
}

// 功能模块点击跳转
const handleModuleClick = (path) => {
  router.push(path)
}

// 底部Tab点击跳转+激活状态
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 今日打卡跳转
const handleCheckIn = () => {
  router.push('/study_plan/daka')
}

// 折叠面板切换
const toggleCollapse = () => {
  isCollapseOpen.value = !isCollapseOpen.value
}

// 占位图片
const getPlaceholderImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+agfCfmoE8L3RleHQ+PC9zdmc+'
}

// 默认SVG图标
const getDefaultSvg = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzQwOUVGRiIvPjwvc3ZnPg=='
}
</script>
<style scoped>
/* 主页特定样式 */
.carousel-wrapper {
  width: 100%;
  height: calc(100vh / 3);
  min-height: 200px;
  overflow: hidden;
  position: relative;
}

.carousel-item-link {
  display: block;
  width: 100%;
  height: 100%;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 功能模块 - 修复：使用百分比而不是固定宽度 */
.function-module {
  width: calc(100% - 20px); /* 左右各留10px边距 */
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px; /* 减小间距防止溢出 */
  padding: 0 10px; /* 内边距替代外边距 */
  box-sizing: border-box;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  background-color: var(--bg-card);
  overflow: hidden; /* 防止内容溢出 */
}

.module-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.module-icon-svg {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.module-name {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

/* 覆盖第三/第四个模块的文字颜色 */
.function-module :nth-child(3) .module-name,
.function-module :nth-child(4) .module-name {
  color: var(--text-primary);
}

/* 交互模块 - 修复：使用百分比 */
.interactive-module {
  width: calc(100% - 20px); /* 与function-module保持一致 */
  margin: 0 auto 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 10px;
  box-sizing: border-box;
}

.check-in-btn {
  width: 100%;
  height: 50px;
  background-color: #FF9F48;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 159, 72, 0.3);
}

.check-in-btn:hover {
  background-color: #e88f3c;
  transform: translateY(-2px);
}

.collapse-module {
  width: 100%;
  background-color: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.collapse-header {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  cursor: pointer;
  color: var(--text-primary);
}

.collapse-arrow {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: transform 0.3s ease;
}

.collapse-arrow.rotate {
  transform: rotate(180deg);
}

.collapse-content {
  padding: 20px 15px;
  border-top: 1px solid var(--border-color);
}

.empty-tip {
  font-size: 13px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 10px 0;
}

/* 移动端额外优化 */
@media (max-width: 375px) { /* 针对小屏幕手机 */
  .carousel-wrapper {
    height: 180px; /* 减小高度 */
    min-height: 180px;
  }
  
  .function-module {
    gap: 12px; /* 进一步减小间距 */
  }
  
  .module-item {
    height: 100px; /* 减小高度 */
  }
  
  .module-icon-svg {
    width: 32px;
    height: 32px;
  }
  
  .module-name {
    font-size: 12px;
  }
}
</style>