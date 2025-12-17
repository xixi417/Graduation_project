<template>
  <div class="home-container">
    <!-- 1. 走马灯区域（占页面上方1/3） -->
    <div class="carousel-wrapper">
      <el-carousel 
        height="33.33vh" 
        weight="100%"
        indicator-position="bottom" 
        autoplay 
        :interval="3000"
      >
        <!-- 5张轮播图：绑定assets下的p1-p5.png，点击跳转百度 -->
        <el-carousel-item v-for="i in 5" :key="i">
          <a href="https://www.baidu.com" target="_blank" class="carousel-item-link">
            <img :src="getCarouselImage(i)" :alt="`轮播图${i}`" class="carousel-img" />
             <!-- <img src="https://picsum.photos/800/400?random=1" alt="`轮播图${i}`" class="carousel-img"> -->
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
      >
        <!-- SVG 图标：直接用 img 标签引入 -->
        <div class="module-icon">
          <img 
            :src="getSvgIcon(item.svgName)" 
            :alt="item.name" 
            class="module-icon-svg"
          />
        </div>
        <div class="module-name">{{ item.name }}</div>
      </div>
    </div>


    <!-- 3. 底部常驻Tab栏（小程序样式，固定底部） -->
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



// 路由实例（用于页面跳转）
const router = useRouter()

// 激活的底部Tab
const activeTab = ref('首页')

// 功能模块列表（两行两列）
const functionList = ref([
  { name: '学习计划', svgName: 'Plan.svg', path: '/study_plan/study-plan' },
  { name: '内容推荐', svgName: 'Recommend.svg', path: '/content-recommend' },
  { name: '进度记录', svgName: 'Progress.svg', path: '/progress-record' },
  { name: '学习报告', svgName: 'Report.svg', path: '/study-report' }
])

// 底部Tab列表
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/profile' }
])

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




// 功能模块点击跳转
const handleModuleClick = (path) => {
  router.push(path)
}

const svgModules = import.meta.glob('../assets/icon/*.svg', {
  eager: true,
  query: 'url'          
})

console.log('SVG模块:', svgModules);
const getSvgIcon = (svgName) => {
  const key = Object.keys(svgModules).find(k => k.endsWith(`/${svgName}`))
  console.log('获取SVG图标:', svgName, key);
  return key ? svgModules[key].default : getDefaultSvg()
}

// 底部Tab点击跳转+激活状态
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 占位图片（如果图片不存在）
const getPlaceholderImage = () => {
  // 可以使用一个在线占位图，或者base64图片
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+agfCfmoE8L3RleHQ+PC9zdmc+'
}

const getDefaultSvg = () => {
  // 默认SVG图标（蓝色圆形）
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzQwOUVGRiIvPjwvc3ZnPg=='
}

</script>

<style scoped>
/* 全局容器：计算底部Tab高度，避免内容被遮挡 */
/* 全局容器：响应式宽度 */
.home-container {
  /* 移动端默认宽度 300px */
  width: 300px;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 60px;
  margin: 0 auto; /* 居中显示 */
  
  
}
/* 网页端 - 宽度 100% */
  @media (min-width: 768px) {
    .home-container{
      width: 100vh;
      max-width: 1200px; /* 可选：添加最大宽度 */
      margin: 0 auto;
    }
  }
/* 1. 走马灯样式（占页面上方1/3） */
.carousel-wrapper {
  width: 100%;
  height: calc(100vh / 3); /* 页面高度的1/3 */
  min-height: 200px;
  overflow: hidden;
}

.carousel-item-link {
  display: block;
  width: 100%;
  height: 100%;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片自适应，保持比例 */
}
/* 2. 功能模块样式 */
.function-module {
  width: 90%;
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两行两列 */
  gap: 20px;
}
.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background-color: #f5f7fa;
  border-radius: 16px; /* 圆角方框 */
  cursor: pointer;
  transition: background-color 0.3s;
}
.module-item:hover {
  background-color: #e8f4f8;
}
/* 功能模块 SVG 图标样式 */
.module-icon-svg {
  width: 40px; /* 图标大小 */
  height: 40px;
  margin-bottom: 8px;
  /* 单色 SVG 可通过 filter 改色（示例：蓝色），多色 SVG 注释此行 */
  filter: invert(39%) sepia(98%) saturate(1349%) hue-rotate(203deg) brightness(93%) contrast(92%);
}
.module-name {
  font-size: 14px;
  color: #333;
}


/* 3. 底部Tab栏样式（固定底部，常驻显示） */
.tab-bar {
  position: fixed; /* 固定定位，滑动不消失 */
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); /* 顶部阴影，增强层次感 */
  z-index: 999; /* 确保在最上层 */
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 8px; /* 圆角图标容器 */
  transition: background-color 0.3s;
}

.tab-item.active {
  color: #409eff; /* 激活态颜色 */
  background-color: #f0f8ff; /* 激活态背景 */
}

.tab-name {
  font-size: 12px;
  margin-top: 4px;
}
</style>