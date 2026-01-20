<template>
  <div class="page-container">
    <!-- 1. 走马灯区域 -->
    <div class="carousel-wrapper">
      <el-carousel height="33.33vh" width="100%" indicator-position="bottom" autoplay :interval="3000">
        <el-carousel-item v-for="i in 5" :key="i">
          <a href="https://www.baidu.com" target="_blank" class="carousel-item-link">
            <img :src="getCarouselImage(i)" :alt="`轮播图${i}`" class="carousel-img" />
          </a>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 2. 功能模块区域 -->
    <div class="function-module">
      <div class="module-item" v-for="item in functionList" :key="item.name" @click="handleModuleClick(item.path)"
        :style="{ backgroundColor: item.bgColor }">

        <div class="module-icon">
          <img :src="getSvgIcon(item.svgName)" :alt="item.name" class="module-icon-svg"
            :style="{ filter: item.iconFilter }" />
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

      <!-- 待办任务折叠模块 -->
      <div class="study-goals-wrapper">
        <div class="goals-title" @click="isGoalsOpen = !isGoalsOpen">
            待办任务
            <span class="toggle-icon">{{ isGoalsOpen ? '▲' : '▼' }}</span>
        </div>

        <!-- 进行中目标 -->
        <div class="goal-section" v-show="isGoalsOpen">
          <div class="section-title">进行中</div>
          <div class="goal-item" v-for="goal in InProgressGoals" :key="goal.id">
            <span class="goal-title">{{ goal.planName }}</span>
            <span class="goal-status ongoing">进行中</span>
          </div>
          <div class="empty-tip" v-if="InProgressGoals.length === 0">暂无进行中的学习目标</div>
        </div>

        <!-- 未开始目标 -->
        <div class="goal-section" v-show="isGoalsOpen" >
          <div class="section-title">未开始</div>
          <div class="goal-item" v-for="goal in notStartGoals" :key="goal.id">
            <span class="goal-title">{{ goal.planName }}</span>
            <span class="goal-status not-start">未开始</span>
          </div>
          <div class="empty-tip" v-if="notStartGoals.length === 0">暂无未开始的学习目标</div>
        </div>
      </div>
    </div>

    <!-- 4. 底部常驻Tab栏 -->
    <div class="tab-bar">
      <div class="tab-item" v-for="item in tabList" :key="item.name" :class="{ active: activeTab === item.name }"
        @click="handleTabClick(item)">
        <component :is="item.icon" size="24" />
        <div class="tab-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// 引入Element Plus图标（按需选择适配模块的图标）
import {
  House, Flag, Star, Timer, User
} from '@element-plus/icons-vue'
// 引入Element Plus组件（走马灯）
import { ElCarousel, ElCarouselItem } from 'element-plus'
import {   getInProgress, getNotStarted,} from '../pages/personal_center/profile'
import { get } from 'vant/lib/utils'

onMounted(async () => {
  fetchTaskList();
})

// 学习目标数据
const InProgressGoals = ref([])
const notStartGoals = ref([])
// const completedGoals = ref([])
const isGoalsOpen = ref(false)

// 路由实例（用于页面跳转）
const router = useRouter()

// 激活的底部Tab
const activeTab = ref('首页')


const getuserIdFromStorage = () => {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      return wx.getStorageSync('user_userid')
    } else {
      return localStorage.getItem('user_userid')
    }
  } catch (e) {
    console.error('获取用户ID失败:', e)
    return null
  }
}
const fetchTaskList = async () => {
  const userId = getuserIdFromStorage()
  if (!userId) {
    console.warn('【获取任务列表】用户ID为空，无法请求接口');
    InProgressGoals.value = [];
    notStartGoals.value = [];
    // completedGoals.value = [];
    return;
  }
  const param = {
    userId
  }

  try {
    // 1. 串行调用进行中接口
    const inProgressRes = await getInProgress({ param });
    InProgressGoals.value = (inProgressRes.code === 200 && Array.isArray(inProgressRes.data)) ? inProgressRes.data : [];
    console.log("value", InProgressGoals.value);
    // 2. 串行调用暂停接口
    const notStartRes = await getNotStarted({ param });
    notStartGoals.value = (notStartRes.code === 200 && Array.isArray(notStartRes.data)) ? notStartRes.data : [];

    // // 3. 串行调用已完成接口
    // const completedRes = await getCompleted({ param });
    // completedGoals.value = (completedRes.code === 200 && Array.isArray(completedRes.data)) ? completedRes.data : [];

    console.log('【任务列表获取完成】进行中/暂停/已完成任务均已更新');
  } catch (err) {
    console.error('【获取任务列表】整体请求失败', err);
    InProgress.value = [];
    notStartGoals.value = [];
    // completedGoals.value = [];
  }
};




// 折叠面板状态
const isCollapseOpen = ref(false)

const getCacheUserId = () => {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      return wx.getStorageSync('user_userid') || '';
    }
    return localStorage.getItem('user_userid') || '';
  } catch (err) {
    console.error('【缓存操作】获取用户ID缓存失败：', err);
    return '';
  }
};
const getProgressPath = () => {
  const userId = getCacheUserId()
   console.log(userId)
  return userId == "admin"
    ? '/content_recommend/content-admin/content-admin' 
    : '/content_recommend/content-recommend/content-recommend'
   
}


// 功能模块列表
const functionList = ref([
  {
    name: '学习计划',
    svgName: 'Plan.svg',
    path: '/study_plan/study-plan/study-plan',
    bgColor: '#4CBF99', // 绿底
    iconFilter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)' // 白色图标
  },
  {
    name: '内容推荐',
    svgName: 'Recommend.svg',
    path: getProgressPath(),
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
  { name: '计划', icon: Flag, path: '/study_plan/study-plan/study-plan' },
  { name: '推荐', icon: Star, path: getProgressPath() },
  { name: '进度', icon: Timer, path: "" },
  { name: '个人', icon: User, path: '/personal_center/profile' }
])


// 获取轮播图
const getCarouselImage = (index) => {
  try {
    const images = import.meta.glob('../assets/p*.webp', { eager: true })
    const imageKey = Object.keys(images).find(key => key.includes(`p${index}.webp`))
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
  router.push('/daka')
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
  width: calc(100% - 20px);
  /* 左右各留10px边距 */
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  /* 减小间距防止溢出 */
  padding: 0 10px;
  /* 内边距替代外边距 */
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
  overflow: hidden;
  /* 防止内容溢出 */
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
  width: calc(100% - 20px);
  /* 与function-module保持一致 */
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

/* 学习目标区域 */
.study-goals-wrapper {
  width: 100%;
  background-color: #fff;
  margin: 0 0;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.goals-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EEEEEE;
}

.goal-section {
  margin-bottom: 20px;
}

.goal-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
  padding-left: 5px;
  border-left: 3px solid #4CBF99;
}

.goal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  border-radius: 8px;
  background-color: #F9F9F9;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.goal-item:hover {
  background-color: #F0F8FF;
}

.goal-title {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.ongoing {
  color: #4CBF99;
  background-color: #E8F5E9;
}

.not-start {
  color: #FF9F48;
  background-color: #FFF3E0;
}

.completed {
  color: #9C27B0;
  background-color: #F3E5F5;
}

.empty-tip {
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 15px 0;
}


/* 移动端额外优化 */
@media (max-width: 375px) {

  /* 针对小屏幕手机 */
  .carousel-wrapper {
    height: 180px;
    /* 减小高度 */
    min-height: 180px;
  }

  .function-module {
    gap: 12px;
    /* 进一步减小间距 */
  }

  .module-item {
    height: 100px;
    /* 减小高度 */
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