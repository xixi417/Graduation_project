<template>
  <div class="content-details-page">
    <!-- 加载中状态 -->
    <div class="loading" v-if="isLoading">
      加载中...
    </div>

    <!-- 资源详情主体 -->
    <div class="detail-container" v-else-if="resource">
      <!-- 顶部标题栏 -->
      <div class="detail-header">
        <h1 class="detail-title">
          {{ resource.title }}
          <span class="new-badge" v-if="isAI">新资源</span>
        </h1>
      </div>

      <!-- 内容区域 -->
      <div class="detail-content">
        <!-- 左侧信息区 -->
        <div class="left-section">
          <img :src="resource.imgurl" :alt="resource.title" class="detail-cover" />
          
          <!-- 数据统计卡片 -->
          <div class="stats-card">
            <div class="stat-item">
              <span class="stat-value">{{ resource.difficulty }}</span>
              <span class="stat-label">难度系数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ resource.recommendRat }}</span>
              <span class="stat-label">推荐指数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ resource.page_views }}</span>
              <span class="stat-label">浏览量</span>
            </div>
            <div class="stat-item" v-if="resource.favorites !== undefined">
              <span class="stat-value">{{ resource.favorites ? '已收藏' : '未收藏' }}</span>
              <span class="stat-label">收藏状态</span>
            </div>
          </div>
        </div>

        <!-- 右侧详情区 -->
        <div class="right-section">
          <!-- 资源描述 -->
          <div class="detail-item">
            <h3 class="item-title">资源描述</h3>
            <p class="item-content">{{ resource.description }}</p>
          </div>

          <!-- 难度评级 -->
          <div class="detail-item">
            <h3 class="item-title">难度评级</h3>
            <div class="rating-wrap">
              <span class="star" v-for="i in 5" :key="i" :class="{ filled: i <= Math.floor(resource.difficulty) }">★</span>
              <span class="rating-text">中等 ({{ resource.difficulty }}/5)</span>
            </div>
          </div>

          <!-- 推荐指数 -->
          <div class="detail-item">
            <h3 class="item-title">推荐指数</h3>
            <div class="progress-wrap">
              <div class="progress-bar" :style="{ width: resource.recommendRat }"></div>
              <span class="progress-text">{{ resource.recommendRat }}</span>
            </div>
          </div>

          <!-- 分类信息 -->
          <div class="detail-item">
            <h3 class="item-title">分类信息</h3>
            <div class="category-wrap">
              <div class="category-item">
                <span class="category-label">主分类</span>
                <span class="category-value">{{ getCategoryName(resource.category) }}</span>
              </div>
              <div class="category-item">
                <span class="category-label">子分类</span>
                <span class="category-value">{{ resource.subject }}</span>
              </div>
            </div>
          </div>

          <!-- AI专属：建议子任务（studyPlan） -->
          <div class="detail-item ai-study-plan" v-if="isAI && resource.studyPlan.length">
            <h3 class="item-title">建议子任务</h3>
            <ul class="study-plan-list">
              <li class="plan-item" v-for="(plan, idx) in resource.studyPlan" :key="idx">
                {{ idx + 1 }}. {{ plan }}
              </li>
            </ul>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="btn favorite-btn" :class="{ active: resource.favorites }" @click="toggleFavorite">
              <i class="icon-heart">/</i>
              {{ resource.favorites ? '已收藏' : '收藏' }}
            </button>
            <button class="btn add-task-btn" @click="addToTask">
              <i class="icon-plus">/</i>
              添加到任务
            </button>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="detail-footer">
        <button class="external-link-btn" @click="goToResource">
          <i class="icon-external">/</i>
          前往学习资源
        </button>
      </div>
    </div>

    <!-- 资源不存在 -->
    <div class="empty-tip" v-else>
      未找到对应的学习资源
    </div>
  </div>
</template>

<script setup>
import { descriptionItemProps } from 'element-plus'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAIDetails, getNormalDetails, sendNewStudyPlan, updateFavorite } from './content-details'
const router = useRouter()
const isLoading = ref(true)
const resource = ref(null)
const isAI = ref(false) // 标记是否为AI推荐资源

// 分类名称映射
const categoryMap = ref({
  'basic': '基础学科',
  'computer': '计算机',
  'language': '语言考试',
  'certification': '职业认证',
  'skill': '技能提升'
})


const normalSou = ref({
    id:"",
    title:"",
    description:"",
    url:"",
    imgurl:"",
    category:"",
    subject:"",
    page_views:0,
    updateTime:"",
    difficulty:"",
    recommendRat:"",
    favorites:false
})
const aiSou = ref({
    id:"",
    title:"",
    description:"",
    url:"",
    imgurl:"",
    category:"",
    subject:"",
    matchRate:0,
    estimatedTime:'',
    tags:[],
    provider:"",
    learningOutcomes:[],
    page_views:0,
    difficulty:"",
    recommendRat:"",
    favorites:false,
    studyPlan: []
})

// 双端读取缓存
const getContentCache = () => {
  try {
    let cacheData = ''
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      cacheData = wx.getStorageSync('content_detail_id')
    } else {
      cacheData = localStorage.getItem('content_detail_id')
    }
    return JSON.parse(cacheData) || { id: '', isAI: false }
  } catch (e) {
    console.error('读取缓存失败:', e)
    return { id: '', isAI: false }
  }
}

// 获取分类名称
const getCategoryName = (categoryKey) => {
  return categoryMap.value[categoryKey] || categoryKey
}

// 切换收藏状态
const toggleFavorite = async() => {
  resource.value.favorites = !resource.value.favorites
  const param = {
    userId: getCacheUserId(),
    id: aiSou.value.id || normalSou.value.id
  }
   console.log("收藏成功",param);
  const res = await updateFavorite(param)
  if(res.code == 200)
  {
    console.log(param);
  }
}

// 添加到任务

// 前往学习资源
const goToResource = () => {
  window.open(resource.value.url, '_blank')
}
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
const getTodayDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};
//添加新任务
const addToTask = async() => {
  const param = {
    userId:getCacheUserId(),
    studyPlan:{
        userId:getCacheUserId(),
        planName: aiSou.value.title || normalSou.value.title,
        isExpanded: isExpandedComputed,
        createdTime: getTodayDateKey(),
    },
    subTasks: aiSou.value.studyPlan

  }
  console.log("已添加到任务",param);
  const res = await sendNewStudyPlan(param)
  if(res.code == 200)
  {
    console.log(param);
  }
}

const isExpandedComputed = computed(() => {
  return aiSou.value.studyPlan != null
})
// 初始化：读取缓存+获取资源
onMounted(async () => {
  const cache = getContentCache()
  isAI.value = cache.isAI

  const param ={
    userId:getCacheUserId(),
    id:cache.id,
  }
  if(isAI)
  {
    const aiSouRes = await getAIDetails(param)
    if(aiSouRes.code == 200){
        aiSou.value = aiSouRes.data;
    }
    else{
        const normalRes = await getNormalDetails(param)
        if(normalRes.code == 200)
          normalSou = normalRes.data;
    }
  }
  
  isLoading.value = false
})
</script>

<style scoped>
.content-details-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Microsoft Yahei", sans-serif;
}

.loading {
  text-align: center;
  padding: 50px 0;
  color: #666;
  font-size: 16px;
}

.empty-tip {
  text-align: center;
  padding: 80px 0;
  color: #999;
  font-size: 18px;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: inline-block;
}

.new-badge {
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
  vertical-align: middle;
}

.detail-content {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.left-section {
  width: 300px;
  flex-shrink: 0;
}

.detail-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.stats-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.right-section {
  flex: 1;
}

.detail-item {
  margin-bottom: 25px;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title::before {
  content: "•";
  color: #1890ff;
  font-size: 20px;
}

.item-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.rating-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star {
  font-size: 18px;
  color: #ddd;
}

.star.filled {
  color: #faad14;
}

.rating-text {
  font-size: 14px;
  color: #666;
}

.progress-wrap {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: #52c41a;
  border-radius: 6px;
}

.progress-text {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #333;
}

.category-wrap {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.category-item {
  background: #f5f7fa;
  padding: 8px 15px;
  border-radius: 4px;
}

.category-label {
  font-size: 12px;
  color: #666;
  margin-right: 5px;
}

.category-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.ai-study-plan .study-plan-list {
  padding-left: 20px;
}

.plan-item {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.favorite-btn {
  background: #fff;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.favorite-btn.active {
  background: #fff2f0;
}

.add-task-btn {
  background: #f5f7fa;
  color: #666;
  border: 1px solid #d9d9d9;
}

.detail-footer {
  text-align: right;
}

.external-link-btn {
  padding: 12px 30px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.external-link-btn:hover {
  background: #40a9ff;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .detail-content {
    flex-direction: column;
    gap: 20px;
  }

  .left-section {
    width: 100%;
  }

  .detail-cover {
    height: 150px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .detail-footer {
    text-align: center;
  }

  .external-link-btn {
    margin: 0 auto;
  }
}
</style>