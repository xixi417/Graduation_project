<template>
  <div class="page-container">
    <!-- 1. 顶部导航栏（仅网页端显示右侧搜索栏） -->
    <div class="top-nav">
      <div class="nav-buttons">
        <button
          v-for="navItem in topNavList"
          :key="navItem.label"
          :class="['top-nav-btn', activeTopNav === navItem.label ? 'active' : '']"
          @click="handleTopNavClick(navItem.label)"
        >
          {{ navItem.label }}
        </button>

        <!-- 网页端搜索栏（仅大屏显示） -->
        <div class="search-wrap pc-search">
          <div class="search-input-box">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入标题/简介/标签进行搜索"
              prefix-icon="Search"
              @input="handleSearch"
              @clear="handleSearch"
            ></el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端搜索栏（仅小屏显示，在导航栏下方） -->
    <div class="search-wrap mobile-search">
      <div class="search-input-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入标题/简介/标签进行搜索"
          prefix-icon="Search"
          @input="handleSearch"
          @clear="handleSearch"
        ></el-input>
      </div>
    </div>

    <!-- 滚动容器（监听滚动触底） -->
    <div class="scroll-container" @scroll="handleScroll">
      <!-- 2. 二级分类区域 -->
      <div class="sub-category-wrap" v-if="currentSubCategory.length > 0">
        <div class="sub-category-label">{{ activeTopNav }}：</div>
        <div class="sub-category-list">
          <button
            v-for="subItem in currentSubCategory"
            :key="subItem"
            :class="['sub-category-btn', activeSubItem === subItem ? 'active' : '']"
            @click="handleSubItemClick(subItem)"
          >
            {{ subItem }}
          </button>
        </div>
      </div>

      <!-- 3. 筛选栏 -->
      <div class="filter-bar">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-btn', filter.active ? 'active' : '']"
          @click="handleFilterChange(filter.id)"
        >
          {{ filter.name }}
        </button>
      </div>

      <!-- 4. 推荐内容列表 -->
      <div class="recommendation-grid">
        <div
          class="content-card"
          v-for="item in filteredContentList"
          :key="item.id"
          @click="handleContentClick(item.id)"
        >
          <div class="content-image">
            <img :src="item.imageUrl" :alt="item.title" />
            <span v-if="item.isNew" class="new-badge">新</span>
          </div>
          <div class="content-info">
            <h3 class="content-title">{{ item.title }}</h3>
            <p class="content-desc">{{ item.description }}</p>
            <div class="content-meta">
              <span class="meta-item">{{ item.category }}</span>
              <span class="meta-item">{{ item.viewCount }} 浏览</span>
            </div>
          </div>
        </div>

        <!-- 搜索无结果提示 -->
        <div class="empty-tip" v-if="filteredContentList.length === 0">
          未找到匹配“{{ searchKeyword }}”的内容，请更换关键词重试
        </div>

        <!-- 加载中提示（下滑加载时显示） -->
        <div class="loading-tip" v-if="isLoading && hasMore">
          正在加载更多...
        </div>

        <!-- 无更多内容提示 -->
        <div class="no-more-tip" v-if="!hasMore && filteredContentList.length > 0">
          已加载全部内容
        </div>
      </div>
    </div>

    <!-- 底部常驻Tab栏 -->
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House, Flag, Star, Timer, User, Search } from '@element-plus/icons-vue'
import { ElInput } from 'element-plus'
import { getAllSourse } from './content-recommend'


const router = useRouter()

// 顶部导航列表
const topNavList = ref([
  { label: '基础学科' },
  { label: '计算机' },
  { label: '语言考试' },
  { label: '职业认证' },
  { label: '技能提升' },
  { label: '智能推荐' }
])

// 二级分类映射
const subCategoryMap = ref({
  '基础学科': ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治'],
  '计算机': ['前端', '后端', '数据', '其他'],
  '语言考试': ['四级', '六级', '考研英语', '雅思', '托福', '日语N1/N2'],
  '职业认证': ['教师资格证', '会计初级', 'PMP', 'CPA', '法考'],
  '技能提升': ['办公软件', '演讲表达', '写作技巧', '时间管理'],
  '智能推荐': []
})

// 状态管理
const activeTopNav = ref('基础学科')
const activeSubItem = ref('')
const searchKeyword = ref('')
const filters = ref([
  { id: 'all', name: '全部', active: true },
  { id: 'hot', name: '热门', active: false },
  { id: 'new', name: '最新', active: false },
  { id: 'followed', name: '已关注', active: false }
])

// 内容加载相关
const recommendedContent = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const hasMore = ref(true)
const isLoading = ref(false) // 加载状态锁，防止重复请求

// 底部Tab栏
const activeTab = ref('推荐')
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content_recommend/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/personal_center/profile' }
])

// 筛选后的内容列表
const filteredContentList = computed(() => {
  let list = [...recommendedContent.value]

  // 筛选逻辑
  const activeFilter = filters.value.find(f => f.active)
  if (activeFilter.id === 'hot') {
    list = list.sort((a, b) => b.viewCount - a.viewCount)
  } else if (activeFilter.id === 'new') {
    list = list.sort((a, b) => b.id - a.id)
  } else if (activeFilter.id === 'followed') {
    list = list.filter(item => item.viewCount > 5000)
  }

  // 搜索逻辑
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(keyword)
      const matchDesc = item.description.toLowerCase().includes(keyword)
      const matchTag = item.category.toLowerCase().includes(keyword)
      return matchTitle || matchDesc || matchTag
    })
  }

  return list
})

// 二级分类联动
const currentSubCategory = computed(() => {
  const subList = subCategoryMap.value[activeTopNav.value] || []
  if (subList.length > 0 && !activeSubItem.value) {
    activeSubItem.value = subList[0]
  }
  return subList
})

// 导航点击事件
const handleTopNavClick = (label) => {
  activeTopNav.value = label
  activeSubItem.value = ''
  refreshContentByCategory()
}

const handleSubItemClick = (item) => {
  activeSubItem.value = item
  refreshContentByCategory()
}

// 搜索事件
const handleSearch = () => {
  console.log('搜索关键词：', searchKeyword.value)
}

// 筛选切换事件
const handleFilterChange = (filterId) => {
  filters.value = filters.value.map(filter => ({
    ...filter,
    active: filter.id === filterId
  }))
  currentPage.value = 1
  recommendedContent.value = []
  hasMore.value = true
  loadRecommendedContent()
}

// 加载内容（新增加载锁）
const loadRecommendedContent = async () => {
  if (isLoading.value) return // 防止重复加载
  isLoading.value = true

  try {
    const res = await getAllSourse();
    if (res.code === 200) {
      const newContent =  res.data
        .filter(item => !recommendedContent.value.some(existing => existing.id === item.id)).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imgurl,
        category: item.subject,
        viewCount: item.page_views || Math.floor(Math.random() * 10000), // 模拟浏览量
        isNew: item.id > recommendedContent.value.length // 简单判断是否为新内容
      }));

      // 处理分页加载逻辑
      if (currentPage.value === 1) {
        recommendedContent.value = newContent;
      } else {
        recommendedContent.value = [...recommendedContent.value, ...newContent];
      }

      // 判断是否还有更多内容（这里假设每次返回5条数据作为示例）
      if (newContent.length < 5) {
        hasMore.value = false;
      } else {
        currentPage.value++;
      }
    } else {
      console.error('获取资源失败:', res.msg);
    }
  } catch (error) {
    console.error('请求资源时发生错误:', error);
  } finally {
    isLoading.value = false; // 释放加载锁
  }
}

// 滚动触底监听（核心：下滑加载）
const handleScroll = (e) => {
  const container = e.target
  // 计算滚动容器的滚动距离（触底判断）
  const isBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50 // 提前50px触发加载
  if (isBottom && hasMore.value && !isLoading.value) {
    loadRecommendedContent() // 触底自动加载
  }
}

// 刷新分类内容
const refreshContentByCategory = () => {
  currentPage.value = 1
  recommendedContent.value = []
  hasMore.value = true
  loadRecommendedContent()
}

// 内容点击事件
const handleContentClick = (contentId) => {
  router.push(`/content/${contentId}`)
}

// Tab栏点击事件
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 初始化加载
onMounted(() => {
  loadRecommendedContent()
})
</script>

<style scoped>


/* 顶部导航栏样式 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 8px 0;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  min-height: 56px;
  position: relative; /* 网页端相对定位，移动端改为fixed */
  z-index: 999; /* 提升层级，避免被滚动内容覆盖 */
  width: 100%;
}
.nav-buttons {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;
  flex: 2; /* 左侧2/3（仅网页端生效） */
  padding: 0 10px;
  -webkit-overflow-scrolling: touch;
  gap: 10px;
  height: 56px;
  position: static;
  background-color: transparent;
  width: 100%; /* 移动端占满宽度 */
}
.nav-buttons::-webkit-scrollbar {
  display: none;
}
.top-nav-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  position: relative;
}
.top-nav-btn.active {
  color: #1890ff;
  font-weight: 500;
}
.top-nav-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background-color: #1890ff;
  border-radius: 1px;
}

/* 搜索功能样式 - 基础通用 */
.search-wrap {
  box-sizing: border-box;
}
.search-input-box {
  width: 100%;
}
:deep(.el-input) {
  --el-input-height: 40px;
}
:deep(.el-input__inner) {
  border-radius: 20px;
  padding-left: 40px;
  border: 1px solid #e8e8e8;
}
:deep(.el-input__prefix) {
  left: 12px;
  color: #999;
}

/* 网页端搜索栏（右侧1/3） */
.pc-search {
  padding: 6px 16px;
  min-width: 280px;
  flex: 1; /* 右侧1/3 */
  max-width: 33.333%;
  display: block;
}

/* 移动端搜索栏（导航栏下方，核心修复） */
.mobile-search {
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: none; /* 默认隐藏，移动端显示 */
  height: 56px; /* 固定高度，与导航栏一致 */
  width: 100%; /* 强制占满宽度 */
  position: relative; /* 确保在文档流中 */
  z-index: 999; /* 与导航栏同层级，高于内容区 */
}

/* 滚动容器*/
.scroll-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: none !important;
  will-change: auto !important;
  width: 100%;
  position: relative;
  z-index: 1; 
  overscroll-behavior-y: contain; 
  height: calc(100vh - 112px); 
}

/* 二级分类样式 */
.sub-category-wrap {
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.sub-category-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: inline-block;
}
.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sub-category-btn {
  padding: 6px 14px;
  background-color: #f5f7fa;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sub-category-btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background-color: #fff;
  margin: 0 0 10px 0;
  border-radius: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-bar::-webkit-scrollbar {
  display: none;
}
.filter-btn {
  padding: 6px 16px;
  background-color: #f5f7fa;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}
.filter-btn.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

/* 内容列表样式 */
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 0 20px;
  min-height: 300px;
}
.content-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.content-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}
.content-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.content-card:hover .content-image img {
  transform: scale(1.05);
}
.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.content-info {
  padding: 16px;
}
.content-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
 
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
  font-weight: 500;
}
.content-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
 
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
  line-height: 1.5;
}
.content-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 空状态/加载状态提示 */
.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
}
.loading-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}
.no-more-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}



/* 响应式调整（核心修复：移动端布局） */
/* 网页端（大屏）：默认样式，pc-search显示，mobile-search隐藏 */
@media (min-width: 768px) {
  .scroll-container {
    padding-top: 56px !important; /* 避开顶部导航栏 */
    height: calc(100vh - 56px); /* 网页端无需减去Tab栏高度 */
  }
  
}

/* 移动端（小屏）：核心修复搜索栏显示问题 */
@media (max-width: 767px) {
  /* 隐藏网页端搜索栏 */
  .pc-search {
    display: none !important;
  }
  /* 显示移动端独立搜索栏（强制显示+层级） */
  .mobile-search {
    display: block !important;
    position: fixed !important; /* 新增：fixed定位，紧跟导航栏下方 */
    top: 56px !important; /* 导航栏高度，精准定位在下方 */
    left: 0 !important;
    right: 0 !important;
    z-index: 999 !important; /* 与导航栏同层级，高于内容 */
  }
  /* 移动端导航栏fixed定位 */
  .top-nav {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 999 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    flex-direction: row;
  }
  
  .nav-buttons {
    height: 56px;
    gap: 8px; 
    width: 100%;
    flex: none;
  }
  .top-nav-btn {
    font-size: 14px; 
    padding: 6px 12px;
  }
  .top-nav-btn.active::after {
    width: 20px; 
  }
  /* 滚动容器避开导航栏+搜索栏（精准间距） */
  .scroll-container {
    padding-top: 112px !important; /* 56(导航) + 56(搜索)，精准避开 */
    margin-top: 0 !important;
    height: calc(100vh - 112px) !important; /* 屏幕高度 - 导航栏 - 搜索栏 - Tab栏 */
  }
  .recommendation-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  .content-image {
    height: 100px;
    z-index: 1 !important;
  }
  .content-info {
    padding: 12px;
  }
  .content-title {
    font-size: 14px;
    height: 34px;
  }
  .content-desc {
    display: none;
  }
}
</style>