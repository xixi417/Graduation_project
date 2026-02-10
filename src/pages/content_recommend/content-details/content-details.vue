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
        <div class="title-wrapper">
          <h1 class="detail-title">
            <button class="back-btn" @click="handleBack">← 返回</button>
            {{ resource.title }}
          </h1>
          <span class="new-badge" v-if="isAI">新资源</span>
        </div>

      </div>

      <!-- 内容区域 -->
      <div class="detail-content">
        <!-- 左侧信息区 -->
        <div class="left-section">
          <h1 class="detail-title">
            {{ resource.title }}
          </h1>
          <img :src="resource.imgurl" :alt="resource.title" class="detail-cover" loading="lazy" />

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
            <p class="item-content">{{ resource.description || '暂无描述信息' }}</p> <!-- 兜底处理 -->
          </div>

          <!-- 难度评级 -->
          <div class="detail-item">
            <h3 class="item-title">难度评级</h3>
            <div class="rating-wrap">
              <span class="star" v-for="i in 5" :key="i"
                :class="{ filled: i <= Math.floor(resource.difficulty) }">★</span>
              <!-- 动态计算难度文字，替代固定的"中等" -->
              <span class="rating-text">
                {{ getDifficultyText(resource.difficulty) }} ({{ resource.difficulty }}/5)
              </span>
            </div>
          </div>

          <!-- 推荐指数 -->
          <div class="detail-item">
            <h3 class="item-title">推荐指数</h3>
            <div class="progress-wrap">
              <div class="progress-bar" :style="{ width: resource.recommendRat }"></div>
              <span class="progress-text">{{ resource.recommendRat || '0%' }}</span> <!-- 兜底处理 -->
            </div>
          </div>

          <!-- 分类信息 -->
          <div class="detail-item">
            <h3 class="item-title">分类信息</h3>
            <div class="category-wrap">
              <div class="category-item">
                <span class="category-label">主分类</span>
                <span class="category-value">{{ getCategoryName(resource.category) || '暂无' }}</span> <!-- 兜底处理 -->
              </div>
              <div class="category-item">
                <span class="category-label">子分类</span>
                <span class="category-value">{{ resource.subject || '暂无' }}</span> <!-- 兜底处理 -->
              </div>
            </div>
          </div>

          <!-- AI专属：建议子任务（studyPlan） -->
          <div class="detail-item ai-study-plan" v-if="isAI && resource.studyPlan.length">
            <h3 class="item-title">建议子任务</h3>
            <ul class="study-plan-list">
              <li class="plan-item" v-for="(plan, idx) in resource.studyPlan" :key="idx">
                {{ idx + 1 }}. {{ plan.title }} (预计时长: {{ plan.estimatedMinutes }} 分钟)
              </li>
            </ul>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="btn favorite-btn" :class="{ active: resource.favorites }" @click="toggleFavorite">
              <!-- 优化图标展示，替换无效的图标写法 -->
              <span class="icon-icon">{{ resource.favorites ? '♥' : '♡' }}</span>
              {{ resource.favorites ? '已收藏' : '收藏' }}
            </button>
            <button class="btn add-task-btn" @click="addToTask">
              <span class="icon-icon">+</span>
              添加到任务
            </button>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="detail-footer">
        <button class="external-link-btn" @click="goToResource">
          <span class="icon-icon">↗</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAIDetails, getNormalDetails, updateFavorites } from './content-details'
import { StorageUtil } from '../../../components/StorageUtil'

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
  id: "",
  title: "",
  description: "",
  url: "",
  imgurl: "",
  category: "",
  subject: "",
  page_views: 0,
  updateTime: "",
  difficulty: "",
  recommendRat: "",
  favorites: false
})
const aiSou = ref({
  id: "",
  title: "",
  description: "",
  url: "",
  imgurl: "",
  category: "",
  subject: "",
  matchRate: 0,
  estimatedTime: '',
  tags: [],
  provider: "",
  learningOutcomes: [],
  page_views: 0,
  difficulty: "",
  recommendRat: "",
  favorites: false,
  studyPlan: []
})


const handleBack = () => {
  StorageUtil.set("to-add-title", null);
  // console.log("返回内容推荐页面",StorageUtil.get("to-add-title"));
  router.push('../content-recommend/content-recommend')
  
}
// 获取分类名称
const getCategoryName = (categoryKey) => {
  return categoryMap.value[categoryKey] || categoryKey
}


const getDifficultyText = (difficulty) => {
  const score = Number(difficulty)
  if (score <= 1) return '简单'
  if (score <= 3) return '中等'
  if (score <= 4) return '较难'
  return '困难'
}

// 切换收藏状态
const toggleFavorites = async () => {
  resource.value.favorites = !resource.value.favorites
  const param = {
      userId: StorageUtil.getRawString('user_userid'),
      id: aiSou.value.id || normalSou.value.id,
      favorites: resource.value.favorites ? 1 : 0
    }
  const res = await updateFavorite(param)
  if (res.code == 200) {
    console.log("收藏参数", param);
  }else {
    console.log("已取消收藏");
  }

  
}

// 前往学习资源
const goToResource = () => {
  window.open(resource.value.url, '_blank')
}

//添加新任务
const addToTask = async () => {
  const title = resource.value.title || " ";
  const param = {
    title: title,
    isSou: isAI.value ? 1 : 0,
    studyPlan: isAI.value ? aiSou.value.studyPlan : [],
  };
  StorageUtil.set("to-add-title", param);


  router.push('../../study_plan/add-plan')

  // console.log("已添加到任务", StorageUtil.get("to-add-title"));

}

onMounted(async () => {
  const cache = StorageUtil.getRawString('content_detail_id')
  // console.log("获取缓存的资源ID和类型", cache);
  isAI.value = cache.isAI

  const param = {
    userId: StorageUtil.getRawString('user_userid'),
    id: cache.id,
  }

  if (isAI.value) {
    const aiSouRes = await getAIDetails(param)
    if (aiSouRes.code === 200) {
      aiSou.value = aiSouRes.data;
      resource.value = aiSou.value;
    } else {
      const normalRes = await getNormalDetails(param)
      if (normalRes.code === 200) {
        normalSou.value = normalRes.data;
        resource.value = normalSou.value;
      }
    }
  } else {
    // 补充非AI资源的获取逻辑
    const normalRes = await getNormalDetails(param)
    if (normalRes.code === 200) {
      normalSou.value = normalRes.data;
      resource.value = normalSou.value; // 给resource赋值
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
  box-sizing: border-box;
  /* 统一盒模型 */
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
  width: 100%;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: inline-block;
  margin: 0;
  /* 重置默认margin */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 10px;
}

.back-btn {
  padding: 4px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  /* 防止按钮被压缩 */
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.back-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f5f9ff;
}

.back-btn:active {
  background-color: #e6f7ff;
}

.new-badge {
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
  flex-shrink: 0;
  /* 不被压缩 */
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  /* 增强适配性 */
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
  border: 1px solid #f0f0f0;
  /* 增加边框提升视觉效果 */
}

.stats-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* 轻微阴影提升层次感 */
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
  min-width: 300px;
  /* 移动端最小宽度 */
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
  margin-top: 0;
  /* 重置默认margin */
}

.item-title::before {
  content: "•";
  color: #1890ff;
  font-size: 20px;
  line-height: 1;
  /* 对齐基线 */
}

.item-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  /* 重置默认margin */
}

.rating-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star {
  font-size: 18px;
  color: #ddd;
  transition: color 0.2s;
  /* 增加过渡动画 */
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
  width: 100%;
  /* 占满容器 */
}

.progress-bar {
  height: 100%;
  background: #52c41a;
  border-radius: 6px;
  transition: width 0.3s ease;
  /* 进度条动画 */
}

.progress-text {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  /* 防止文字换行 */
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
  display: inline-flex;
  /* 紧凑布局 */
  align-items: center;
}

.category-label {
  font-size: 12px;
  color: #666;
  margin-right: 5px;
  font-weight: 500;
}

.category-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.ai-study-plan .study-plan-list {
  padding-left: 20px;
  margin: 0;
  /* 重置默认margin */
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
  transition: all 0.2s;
  /* 按钮过渡动画 */
  outline: none;
  /* 移除焦点轮廓 */
}

.btn:hover {
  opacity: 0.9;
  /*  hover效果 */
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

/* 图标样式统一 */
.icon-icon {
  font-size: 16px;
  line-height: 1;
}

.detail-footer {
  text-align: right;
  margin-top: 20px;
}

.external-link-btn {
  padding: 12px 30px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  transition: background 0.2s;
}

.external-link-btn:hover {
  background: #40a9ff;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .content-details-page {
    padding: 15px;
    /* 减少移动端内边距 */
  }

  .detail-title {
    font-size: 20px;
    gap: 8px;
  }

  .back-btn {
    font-size: 12px;
    padding: 3px 8px;
    height: 28px;
  }

  .new-badge {
    font-size: 10px;
    padding: 1px 6px;
    height: 20px;
  }

  .detail-title {
    font-size: 20px;
  }

  .title-wrapper {
    padding-right: 0;
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
    padding: 12px 20px;
    /* 增大移动端按钮点击区域 */
  }

  .detail-footer {
    text-align: center;
  }

  .external-link-btn {
    margin: 0 auto;
    width: 100%;
    /* 移动端按钮占满宽度 */
    justify-content: center;
  }

  .stats-card {
    grid-template-columns: 1fr 1fr;
    /* 移动端单列展示 */
  }
}

/* 全局样式重置（局部） */
* {
  box-sizing: border-box;
}
</style>