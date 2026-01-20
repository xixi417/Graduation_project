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
      <span class="error-tip" v-if="showPwdError">旧密码输入错误</span>
      <span class="error-tip" v-if="showNullOldPwd">请输入旧密码</span>
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
        <span class="error-tip" v-if="showNewPwdLenError">
          新密码需为6-16位字符
        </span>
        <span class="error-tip" v-if="showPwdSameError">
          新密码不能与旧密码相同
        </span>
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
        <span class="error-tip" v-if="showPwdNotMatchError">新密码与确认密码不一致</span>
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
    <div>
    <!-- 退出账号按钮 -->
      <button class="exitAccount" @click="showExitModal()">退出账号</button>

    <!-- 弹窗） -->
      <div class="modal-mask" v-if="isModalVisible" @click="hideExitModal()">
        <div class="modal-content" @click.stop>
          <!-- 弹窗提示文本 -->
          <p style="margin: 0 0 20px 0; font-size: 14px; color: var(--text-primary); text-align: center;">
            确定要退出当前账号吗？
          </p>

          <!-- 按钮组（仅取消+确定，复用现有样式） -->
          <div class="modal-btn-group">
            <button class="modal-btn cancel-btn" @click="hideExitModal()">取消</button>
            <button class="modal-btn confirm-btn" @click="handleConfirmExit()">确定</button>
          </div>
        </div>
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
import { getPassword, updatePassword } from './profile.js'
import { StorageUtil } from '../../components/StorageUtil.js'

const router = useRouter()
const route = useRoute()

// 存储KEY定义
const NOTIFICATION_STORAGE_KEY = 'study_app_notification_settings'
const THEME_STORAGE_KEY = 'study_app_dark_mode'
const PWD_STORAGE_KEY = 'study_app_user_pwd' // 模拟密码存储


// 4. 底部Tab
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
// Tab点击跳转
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}



// 返回上一页
const handleBack = () => {
  router.go(-1)
}

// 1. 修改密码相关
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNullOldPwd = ref(false); // 旧密码为空提示状态
const showPwdError = ref(false); // 旧密码错误提示状态
const showNewPwdLenError = ref(false); // 新密码长度错误提示状态
const showPwdNotMatchError = ref(false); // 新密码与确认密码不一致提示
const showPwdSameError = ref(false); // 新密码与旧密码相同提示状态
let initPwd = '';



const userid = ref('');

// 模拟初始密码
const init = async (userid) => {
  if (!userid) { 
    alert('请先输入账号');
    router.push('../register/login')
    return '';
  }
  console.log('正在获取账号信息，账号：', userid);
  try {
    const res = await getPassword(userid);
    if(res.code == 200){
      initPwd = res.data.password; 
      console.log('从接口获取的初始密码：', initPwd);
      return initPwd;
    }
  } catch (error) {
    console.error('获取初始密码失败：', error);
    alert('获取账号信息失败，请重试');
    return '';
  }
};



// 密码提交
const handleChangePwd =async () => {
  showPwdError.value = false; 
  showNewPwdLenError.value = false;
  showPwdNotMatchError.value = false;
  showPwdSameError.value = false;
  showNullOldPwd.value = false;
  // 校验
  if (!oldPassword.value) {
    showNullOldPwd.value = true; 
     document.querySelector('.form-input')?.focus();
    return
  }
   console.log('旧密码错误，输入的旧密码：', oldPassword.value, '正确密码：', initPwd);
  
   if (oldPassword.value !== initPwd) {
    showPwdError.value = true; 
    document.querySelector('.form-input')?.focus();
   
    return;
  }
  if (!newPassword.value || newPassword.value.length < 6 || newPassword.value.length > 16) {
    showNewPwdLenError.value = true;
    document.querySelector('.form-input')?.focus();
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    showPwdNotMatchError.value = true;
    document.querySelector('.form-input')?.focus(); 
    return
  }
  if (oldPassword.value === newPassword.value) {
    showPwdSameError.value = true;
    document.querySelector('.form-input')?.focus();
    return
  }
  const form = {
    userid: userid.value,
    password: ''
  }

  // 保存密码
  try {
   
   form.password = newPassword.value; // 更新登录表单的密码字段
   await updatePassword(form);
    alert('密码修改成功，请重新登录')
    if (typeof wx !== 'undefined' && wx.removeStorageSync) {
      wx.removeStorageSync(PWD_STORAGE_KEY)
    } else {
      localStorage.removeItem(PWD_STORAGE_KEY)
    }
    // 跳转登录页
    router.push('/register/login')
  } catch (e) {
    console.error('保存密码失败:', e)
    alert('密码修改失败，请重试')
  }
 const savedSettings = initNotificationSettings()
  // 将保存的设置应用到响应式对象
  Object.assign(notificationSettings, savedSettings)


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





//消息设置
//打卡提醒
const notificationSettings = reactive({
  checkIn: false, 
  remindTime: '15:54' // 默认提醒时间（上午9点）
});
let remindTime = null;
// 消息通知设置（持久化）
const initNotificationSettings = () => {
  let settings = null
  try {

    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      settings = wx.getStorageSync(NOTIFICATION_STORAGE_KEY)
    } else {
      settings = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      settings = settings ? JSON.parse(settings) : null
    }

    if (notificationSettings.checkIn) {
    ElMessage.success('打卡提醒已开启，将按时为你推送打卡通知');
    
  } else {
    ElMessage.info('打卡提醒已关闭，将不再接收打卡相关通知');
    
  }
  } catch (e) {
    console.error('读取通知设置失败:', e)
  }












  // 默认开启所有通知
  return {
    checkIn: true,
    plan: true,
    progress: true,
    remindTime: '15:54',
    ...settings
  }
}
// 控制弹窗显示/隐藏
const isModalVisible = ref(false);

// 显示弹窗
const showExitModal = () => {
  isModalVisible.value = true;
};

// 隐藏弹窗
const hideExitModal = () => {
  isModalVisible.value = false;
};


const handleConfirmExit = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  // 隐藏弹窗并跳转登录页
  hideExitModal();
  router.replace("/register/login");
};





onMounted(async () => {
  
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    userid.value = wx.getStorageSync('user_userid') || '';
  } else {
    userid.value = localStorage.getItem('user_userid') || '';
  }
  
  // 调用init获取初始密码
  await init(userid.value);

   const savedSettings = initNotificationSettings();
  // 将保存的设置合并到响应式对象中
  Object.assign(notificationSettings, savedSettings);

  // 初始化后根据状态提示
  if (notificationSettings.checkIn) {
    ElMessage.success('打卡提醒已开启，将按时为你推送打卡通知');
  } else {
    ElMessage.info('打卡提醒已关闭，将不再接收打卡相关通知');
  }
});













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