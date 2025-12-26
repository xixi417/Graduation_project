<template>
  <div class="page-container">
    <!-- 1. 用户信息顶部区域 -->
    <div class="user-info-wrapper">
      <!-- 头像+基本信息 -->
      <div class="user-base-info">
        <div class="avatar-wrapper" @click="handleAvatarEdit">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar" />
          <div class="avatar-edit-mask">
            <span class="edit-icon">✏️</span>
          </div>
        </div>
        <div class="user-text-info">
          <div class="user-name-row">
            <span class="user-nickname">{{ userInfo.nickname }}</span>
            <span class="edit-btn" @click="handleNicknameEdit">编辑</span>
          </div>
          <div class="user-signature" @click="handleSignatureEdit">
            {{ userInfo.signature || "暂无个性签名" }}
          </div>
        </div>
      </div>

      <!-- 账号管理入口 -->
      <div class="username-manage" @click="handleusernameManage">
        <span class="manage-text">账号管理</span>
        <span class="arrow-icon">→</span>
      </div>
    </div>

    <!-- 2. 学习目标区域 -->
    <div class="study-goals-wrapper">
      <div class="goals-title">我的学习目标</div>

      <!-- 进行中目标 -->
      <div class="goal-section">
        <div class="section-title">进行中</div>
        <div 
          class="goal-item" 
          v-for="goal in ongoingGoals" 
          :key="goal.id"
          @click="handleGoalClick(goal)"
        >
          <span class="goal-title">{{ goal.title }}</span>
          <span class="goal-status ongoing">进行中</span>
        </div>
        <div class="empty-tip" v-if="ongoingGoals.length === 0">暂无进行中的学习目标</div>
      </div>

      <!-- 已暂停目标 -->
      <div class="goal-section">
        <div class="section-title">已暂停</div>
        <div 
          class="goal-item" 
          v-for="goal in pausedGoals" 
          :key="goal.id"
          @click="handleGoalClick(goal)"
        >
          <span class="goal-title">{{ goal.title }}</span>
          <span class="goal-status paused">已暂停</span>
        </div>
        <div class="empty-tip" v-if="pausedGoals.length === 0">暂无已暂停的学习目标</div>
      </div>

      <!-- 已完成目标 -->
      <div class="goal-section">
        <div class="section-title">已完成</div>
        <div 
          class="goal-item" 
          v-for="goal in completedGoals" 
          :key="goal.id"
          @click="handleGoalClick(goal)"
        >
          <span class="goal-title">{{ goal.title }}</span>
          <span class="goal-status completed">已完成</span>
        </div>
        <div class="empty-tip" v-if="completedGoals.length === 0">暂无已完成的学习目标</div>
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

    <!-- 4. 编辑信息弹窗 -->
    <div class="modal-mask" v-if="isModalOpen" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-title">{{ modalType === 'nickname' ? '修改昵称' : '修改个性签名' }}</div>
        <input 
          v-if="modalType === 'nickname'"
          type="text" 
          v-model="tempNickname" 
          class="modal-input"
          placeholder="请输入新昵称"
          maxlength="16"
        />
        <textarea 
          v-if="modalType === 'signature'"
          v-model="tempSignature" 
          class="modal-textarea"
          placeholder="请输入个性签名"
          maxlength="50"
          rows="3"
        ></textarea>
        <div class="modal-btn-group">
          <button class="modal-cancel" @click="closeModal">取消</button>
          <button class="modal-confirm" @click="confirmEdit">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 引入Element Plus图标
import { House, Flag, Star, Timer, User } from '@element-plus/icons-vue'
import { useTheme } from '../global/useTheme'          
const router = useRouter()
const route = useRoute()

const { isDarkMode } = useTheme()

// 定义存储KEY（统一标识）
const USER_INFO_STORAGE_KEY = 'study_app_user_info'

// 初始化用户信息（优先读取本地存储，无则用默认值）
const initUserInfo = () => {
  // 区分网页端/小程序端的存储读取方式
  let storedInfo = null
  try {
    // 微信小程序环境
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      storedInfo = wx.getStorageSync(USER_INFO_STORAGE_KEY)
    } 
    // 网页端环境
    else {
      storedInfo = localStorage.getItem(USER_INFO_STORAGE_KEY)
      storedInfo = storedInfo ? JSON.parse(storedInfo) : null
    }
  } catch (e) {
    console.error('读取用户信息失败:', e)
    storedInfo = null
  }

  // 默认值
  const defaultInfo = {
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzNSIgZmlsbD0iIzgwODA4MCIvPjxwYXRoIGQ9Ik00MCA1NUM1MS4wNDU3IDU1IDYwIDQ2LjA0NTcgNjAgMzVWNDVWNTVWMzVWNTVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    nickname: '学习小达人',
    signature: '每天进步一点点，坚持就是胜利～'
  }

  // 合并：有存储数据则覆盖默认值，无则用默认值
  return { ...defaultInfo, ...storedInfo }
}

// 响应式用户信息
const userInfo = reactive(initUserInfo())

// 保存用户信息到本地存储
const saveUserInfoToStorage = () => {
  try {
    // 微信小程序
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(USER_INFO_STORAGE_KEY, {
        avatar: userInfo.avatar,
        nickname: userInfo.nickname,
        signature: userInfo.signature
      })
    } 
    // 网页端
    else {
      localStorage.setItem(
        USER_INFO_STORAGE_KEY,
        JSON.stringify({
          avatar: userInfo.avatar,
          nickname: userInfo.nickname,
          signature: userInfo.signature
        })
      )
    }
  } catch (e) {
    console.error('保存用户信息失败:', e)
  }
}

// 底部Tab列表（与首页保持一致）
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/profile' }
])

// 激活的底部Tab（默认选中"个人"）
const activeTab = ref('个人')

// 页面挂载前初始化激活的Tab
onBeforeMount(() => {
  // 根据当前路由匹配激活的Tab
  const currentPath = route.path
  const matchedTab = tabList.value.find(item => item.path === currentPath)
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
})

// 页面挂载时执行
onMounted(() => {
  console.log('当前用户信息:', userInfo)
})

// 学习目标数据（模拟）
const ongoingGoals = ref([
  { id: 1, title: 'Python零基础入门', status: 'ongoing' },
  { id: 2, title: '每天背50个英语单词', status: 'ongoing' }
])
const pausedGoals = ref([
  { id: 3, title: '数据分析实战课程', status: 'paused' }
])
const completedGoals = ref([
  { id: 4, title: 'HTML/CSS基础学习', status: 'completed' },
  { id: 5, title: 'JavaScript入门到精通', status: 'completed' }
])

// 弹窗相关
const isModalOpen = ref(false)
const modalType = ref('') // nickname / signature
const tempNickname = ref('')
const tempSignature = ref('')

// 编辑头像（实际项目中可对接文件上传）
const handleAvatarEdit = () => {
  alert('请选择新头像（实际项目中对接文件上传功能）')
  // 示例：上传后更新头像并保存
  // userInfo.avatar = '新头像URL'
  // saveUserInfoToStorage()
}

// 编辑昵称
const handleNicknameEdit = () => {
  modalType.value = 'nickname'
  tempNickname.value = userInfo.nickname
  isModalOpen.value = true
}

// 编辑个性签名
const handleSignatureEdit = () => {
  modalType.value = 'signature'
  tempSignature.value = userInfo.signature || ''
  isModalOpen.value = true
}

// 账号管理
const handleusernameManage = () => {
  router.push('/personal_center/accountMan')
}

// 学习目标点击
const handleGoalClick = (goal) => {
  router.push(`/study_plan/detail/${goal.id}`)
}

// 底部Tab点击跳转+激活状态
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false
  tempNickname.value = ''
  tempSignature.value = ''
}

// 确认编辑
const confirmEdit = () => {
  if (modalType.value === 'nickname') {
    if (!tempNickname.value.trim()) {
      alert('昵称不能为空')
      return
    }
    userInfo.nickname = tempNickname.value.trim()
  } else if (modalType.value === 'signature') {
    userInfo.signature = tempSignature.value.trim()
  }
  // 编辑后立即保存到本地存储
  saveUserInfoToStorage()
  isModalOpen.value = false
  alert('修改成功！')
}
</script>

<style scoped>
/* 全局容器：预留底部Tab高度，避免内容被遮挡 */


/* 1. 用户信息区域 */
.user-info-wrapper {
  background-color: #fff;
  padding: 20px 15px;
  margin-bottom: 15px;
}

.user-base-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #E0E0E0;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-edit-mask {
  opacity: 1;
}

.edit-icon {
  color: #fff;
  font-size: 12px;
}

.user-text-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.user-nickname {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.edit-btn {
  font-size: 12px;
  color: #409EFF;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #ECF5FF;
}

.user-signature {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  max-width: 250px;
  cursor: pointer;
}

.user-signature:hover {
  color: #409EFF;
}

.username-manage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #EEEEEE;
  cursor: pointer;
}

.manage-text {
  font-size: 14px;
  color: #333;
}

.arrow-icon {
  font-size: 12px;
  color: #999;
}

.username-manage:hover {
  color: #409EFF;
}

/* 2. 学习目标区域 */
.study-goals-wrapper {
  background-color: #fff;
  margin: 0 15px;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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

.paused {
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


/* 4. 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; 
}

.modal-content {
  width: 80%;
  max-width: 300px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
}

.modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.modal-input, .modal-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
}

.modal-textarea {
  resize: none;
}

.modal-btn-group {
  display: flex;
  gap: 10px;
}

.modal-cancel, .modal-confirm {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.modal-cancel {
  background-color: #F5F5F5;
  color: #666;
}

.modal-confirm {
  background-color: #409EFF;
  color: #fff;
}

.modal-confirm:hover {
  background-color: #337ECC;
}

.modal-cancel:hover {
  background-color: #E0E0E0;
}


</style>