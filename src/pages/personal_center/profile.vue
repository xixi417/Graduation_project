<template>
  <div class="page-container">
    <!-- 1. 用户信息顶部区域 -->
    <div class="user-info-wrapper">

      <!-- 头像+基本信息 -->
      <div class="user-base-info">
        <div class="avatar-wrapper" @click="handleAvatarEdit">
          <!-- 头像展示：云存储URL / 默认头像 -->
          <img :src="userInfo.avatar || defaultAvatar" alt="用户头像" class="user-avatar" />
          <div class="avatar-edit-mask">
            <span class="edit-icon">✏️</span>
          </div>

          <!-- H5端隐藏的文件选择框（小程序端编译时会被忽略） -->
          <input v-if="isH5Env" ref="avatarInput" type="file" accept="image/jpeg,image/png,image/gif"
            style="display: none" @change="handleH5FileSelect" />
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

      <div class="userid-manage" @click="handleuseridManage">
        <span class="manage-text">账号管理</span>
        <span class="arrow-icon">→</span>
      </div>
    </div>

    <!-- 2. 我的收藏 -->
    <div class="study-goals-wrapper">
      <div class="goals-title">我的收藏</div>

      <!-- 收藏 -->
      <div class="goal-section">
        <div class="section-title">收藏</div>
        <div class="goal-item" v-for="goal in favoriteList" :key="goal.id">
          <span class="goal-title">{{ goal.title }}</span>
        </div>
        <div class="empty-tip" v-if="favoriteList.length === 0">暂无收藏</div>
      </div>

    </div>

    <!-- 3. 底部常驻Tab栏（小程序样式，固定底部） -->
    <div class="tab-bar">
      <div class="tab-item" v-for="item in tabList" :key="item.name" :class="{ active: activeTab === item.name }"
        @click="handleTabClick(item)">
        <component :is="item.icon" size="24" />
        <div class="tab-name">{{ item.name }}</div>
      </div>
    </div>

    <!-- 4. 编辑信息弹窗 -->
    <div class="modal-mask" v-if="isModalOpen" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-title">{{ modalType === 'nickname' ? '修改昵称' : '修改个性签名' }}</div>
        <input v-if="modalType === 'nickname'" type="text" v-model="tempNickname" class="modal-input"
          placeholder="请输入新昵称" maxlength="16" />
        <textarea v-if="modalType === 'signature'" v-model="tempSignature" class="modal-textarea" placeholder="请输入个性签名"
          maxlength="50" rows="3"></textarea>
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
import { House, Flag, Star, Timer, User } from '@element-plus/icons-vue'
import { getUserInfo,getFavoriteList,
  uploadAvatarH5
} from './profile'
import { StorageUtil } from '../../components/StorageUtil'

//路由相关
const router = useRouter()
const route = useRoute()
const avatarInput = ref(null); 
const isH5Env = ref(false)

// 学习目标数据
const favoriteList = ref([])


// 弹窗相关
const isModalOpen = ref(false)
const modalType = ref('')
const tempNickname = ref('')
const tempSignature = ref('')


// 定义存储KEY（统一标识）
const USER_INFO_STORAGE_KEY = 'study_app_user_info'

const getProgressPath = () => {
  const userId = StorageUtil.get('user_userid')
   console.log(userId)
  return userId == "admin"
    ? '/content_recommend/content-admin/content-admin' 
    : '/content_recommend/content-recommend/content-recommend'
   
}

// 底部Tab列表
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan/study-plan' },
  { name: '推荐', icon: Star, path: getProgressPath() },
  { name: '进度', icon: Timer, path: "" },
  { name: '个人', icon: User, path: '/personal_center/profile' }
])

// 激活的底部Tab 
const activeTab = ref('个人')


// 初始化用户信息（优先读取本地存储，无则从接口获得数据）
const initUserInfo = () => {
  let storedInfo = null
  try {
    storedInfo = StorageUtil.get(USER_INFO_STORAGE_KEY);
    
    if (storedInfo && typeof storedInfo === 'object') {
      console.log('有效存储数据:', storedInfo)
    } else {
      console.warn('存储数据格式无效，将使用默认值')
      storedInfo = null
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

  const result = { ...defaultInfo, ...storedInfo }
  console.log('初始用户信息:', result)
  return result
}

// 响应式用户信息
const userInfo = reactive(initUserInfo())

// 保存用户信息到本地存储
const saveUserInfoToStorage = () => {
  try {
    // 准备要存储的数据
    const dataToStore = {
      avatar: userInfo.avatar,
      nickname: userInfo.nickname,
      signature: userInfo.signature
    }
    console.log(" dataToStore",dataToStore.avatar)

    console.log('准备存储的数据:', dataToStore)

    StorageUtil.set(USER_INFO_STORAGE_KEY, dataToStore)
    console.log('已保存用户信息到本地存储')
  } catch (e) {
    console.error('保存用户信息失败:', e)
  }
}



// 页面挂载前初始化激活的Tab
onBeforeMount(() => {
  const currentPath = route.path
  const matchedTab = tabList.value.find(item => item.path === currentPath)
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
})





//头像
const handleAvatarEdit = () => {
  if (isH5Env.value) {
    // H5端：触发本地文件选择
    avatarInput.value?.click();
  } else {
    // 小程序端：调用相册/相机
    handleMiniProgramImageSelect();
  }
};
//网页端
const handleH5FileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 1. 文件格式/大小校验
  const validateRes = validateFile(file)
  if (!validateRes.valid) {
    alert(validateRes.msg)
    e.target.value = '' // 清空选择，避免重复选同一文件无触发
    return
  }
  console.log(file);

  try {
    // 2. 构建FormData（兼容文件+用户ID）
    const formData = new FormData()
    formData.append('avatar', file) // 头像文件
    formData.append('userId', StorageUtil.get('user_userid'))

    // 3. 调用H5端上传接口
    const uploadRes = await uploadAvatarH5(formData)
    if (uploadRes.code === 200 && uploadRes.data?.avatarUrl) {
      // 4. 更新本地用户信息
      userInfo.avatar = uploadRes.data.avatarUrl
      // 5. 保存到本地缓存
      saveUserInfoToStorage()
      console.log("本地新存储图片成功",userInfo.avatar)
      alert('头像上传成功！')
    } else {
      alert(`上传失败：${uploadRes.message || '服务器错误'}`)
    }
  } catch (err) {
    console.error('H5头像上传失败:', err)
    alert('头像上传失败，请检查网络后重试')
  } finally {
    e.target.value = '' // 清空文件选择框，避免重复上传
  }
};

//网页端校验
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, msg: '仅支持JPG/PNG/GIF格式的头像' };
  }
  if (file.size > maxSize) {
    return { valid: false, msg: '头像大小不能超过2MB' };
  }
  return { valid: true, msg: '' };
};
//小程序端
const handleMiniProgramImageSelect = () => {


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
const handleuseridManage = () => {
  router.push('/personal_center/accountMan')
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
const confirmEdit = async () => {
  if (modalType.value === 'nickname') {
    if (!tempNickname.value.trim()) {
      alert('昵称不能为空')
      return
    }
    userInfo.nickname = tempNickname.value.trim()
  } else if (modalType.value === 'signature') {
    userInfo.signature = tempSignature.value.trim()
  }
  try {
    const response = await sendNewInfo({
      username: userInfo.nickname,
      bio: userInfo.signature,
      avatarUrl: userInfo.avatar
    })
    if (response.code === 200) {
      saveUserInfoToStorage()  // 保存到本地存储
      isModalOpen.value = false
      alert('修改成功！')
    } else {
      alert(`修改失败：${response.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('发送用户信息失败：', error)
    alert('网络错误，修改失败')
  }

}


const fetchTaskList = async () => {
  const userId = StorageUtil.get('user_userid')
  if (!userId) {
    console.warn('【获取任务列表】用户ID为空，无法请求接口');
    favoriteList.value = [];
     
    return;
  }
  const param = {
    userId
  }

  try {
    // 1. 串行调用进行中接口
    const favoriteRes = await getFavoriteList({ param });
    favoriteList.value = (favoriteRes.code === 200 && Array.isArray(favoriteRes.data)) ? favoriteRes.data : [];
    console.log("value", favoriteList.value);
    
    console.log('【任务列表获取完成】已更新');
  } catch (err) {
    console.error('【获取任务列表】整体请求失败', err);
    favoriteList.value = [];
     
  }
};



// 页面挂载时执行
onMounted(async () => {
  console.log('初始用户信息:', userInfo)

  // 获取并同步用户信息
  const userId = StorageUtil.get('user_userid')
  if (userId) {
    console.log('找到用户ID:', userId)
    const res = await getUserInfo(userId)
    console.log('从接口获取的用户信息:', res)

    if (res && res.code === 200 && res.data) {
      const detailedInfo = res.data
      //赋值
      userInfo.avatar = detailedInfo.avatarUrl || userInfo.avatar
      userInfo.nickname = detailedInfo.username || userInfo.nickname
      userInfo.signature = detailedInfo.bio || userInfo.signature

      // 保存更新后的数据到本地存储
      saveUserInfoToStorage()
      console.log('已更新用户信息:', userInfo)
    }
  } else {
    console.log('未找到用户ID，使用当前存储信息')
  }

  //判断运行环境
  if (typeof uni !== 'undefined') {
    const systemInfo = uni.getSystemInfoSync();
    isH5Env.value = systemInfo.platform === 'h5';
  } else {
    isH5Env.value = true;
  }
  await fetchTaskList();


})






</script>
<style scoped>
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
  background-color: rgba(0, 0, 0, 0.5);
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

.userid-manage {
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

.userid-manage:hover {
  color: #409EFF;
}

/* 2. 学习目标区域 */
.study-goals-wrapper {
  background-color: #fff;
  margin: 0 15px;
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
  background-color: rgba(0, 0, 0, 0.5);
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

.modal-input,
.modal-textarea {
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

.modal-cancel,
.modal-confirm {
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