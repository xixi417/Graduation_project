<template>
  <div class="login-page">
    <!-- 登录容器：响应式布局 -->
    <div class="login-container">
      <!-- 左侧图片区域：移动端隐藏，PC端显示 -->
      <div class="left-section">
        <img src="@/assets/vue.svg" alt="Vue图标" class="vue-logo" />
      </div>

      <!-- 右侧登录表单区域：自适应宽度 -->
      <div class="right-section">
        <div class="login-form">
          <!-- 登录标题（移动端显示） -->
          <h2 class="login-title">系统登录</h2>

          <!-- 账号输入框 -->
          <input 
            type="text" 
            class="input-field" 
            placeholder="账号名/邮箱/手机号"
            v-model="form.account"
            maxlength="50"
          >

          <!-- 密码输入框 -->
          <div class="input-group">
            <input 
              type="password"
              class="input-field" 
              placeholder="请输入登录密码"
              v-model="form.password"
              maxlength="20"
            >
          </div>

          <!-- 登录按钮 -->
          <button class="login-btn" @click="handleLogin" :disabled="!form.account || !form.password || !form.agree">
            登录
          </button>

          <!-- 协议与其他操作 -->
          <div class="footer">
            <label class="agreement">
              <input type="checkbox" v-model="form.agree" />
              已阅读并同意
              <a href="#" class="link" @click.prevent="showTerms = true">服务协议</a>、
              <a href="#" class="link" @click.prevent="showPolicy = true">隐私政策</a>
            </label>
            <div class="other-links">
              <router-link to="/register/register" class="link">免费注册</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 协议弹窗 -->
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>用户服务协议</h3>
          <button class="modal-close" @click="showTerms = false">×</button>
        </div>
        <div class="modal-body">
          <div class="terms-content">
            <p>欢迎使用本系统服务！请仔细阅读以下协议内容：</p>
            <h4>一、总则</h4>
            <p>1.1 用户在使用本系统服务前，应当仔细阅读本协议，并同意遵守本协议及所有平台规则后方可成为正式用户。</p>
            <p>1.2 本协议内容包括协议正文及所有本系统已经发布的各类规则、声明、通知等。</p>
            
            <h4>二、注册与账户</h4>
            <p>2.1 注册者资格：注册用户须具有法定的相应权利能力和行为能力。</p>
            <p>2.2 账户安全：用户应妥善保管账户信息，不得将账户转让、出售或出借给他人使用。</p>
            
            <h4>三、服务使用规范</h4>
            <p>3.1 用户承诺遵守法律法规、社会主义制度、国家利益、公民合法权益、公共秩序、社会道德风尚和信息真实性等七条底线。</p>
            <p>3.2 用户不得利用本系统从事任何违法违规活动。</p>
            
            <p>本协议最终解释权归本系统所有。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <div v-if="showPolicy" class="modal-overlay" @click.self="showPolicy = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>隐私政策</h3>
          <button class="modal-close" @click="showPolicy = false">×</button>
        </div>
        <div class="modal-body">
          <div class="terms-content">
            <p>我们非常重视您的隐私保护，特此制定本隐私政策：</p>
            
            <h4>一、信息收集</h4>
            <p>1.1 在您注册账户时，我们会收集您的用户名、邮箱/手机号等必要信息。</p>
            <p>1.2 为提供更好的服务，我们可能会收集您使用服务时的设备信息、操作日志等信息。</p>
            
            <h4>二、信息使用</h4>
            <p>2.1 您的个人信息将用于：创建账户、提供服务、安全保障等。</p>
            <p>2.2 我们承诺不会将您的个人信息出售给任何第三方。</p>
            
            <h4>三、信息安全</h4>
            <p>3.1 我们采取合理的技术手段保护您的个人信息安全。</p>
            <p>3.2 您的密码会进行加密存储，我们无法直接查看您的密码。</p>
            
            <h4>四、信息共享</h4>
            <p>4.1 除法律法规要求或您明确同意外，我们不会共享您的个人信息。</p>
            <p>4.2 我们可能会在去标识化处理后，将信息用于统计分析。</p>
            
            <p>如您对本政策有任何疑问，请联系我们。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from './login.js'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js';

// 表单数据
const form = ref({
  account: '',
  password: '',
  agree: false
})

const showTerms = ref(false)
const showPolicy = ref(false)
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  if (!form.value.account || !form.value.password || !form.value.agree) {
    if (!form.value.account) alert('请输入账号名/邮箱/手机号')
    else if (!form.value.password) alert('请输入登录密码')
    else if (!form.value.agree) alert('请同意服务协议和隐私政策')
    return
  }
  
  loading.value = true
 // router.push('/Home')
  const hashedPassword = CryptoJS.SHA256(form.value.password).toString();
  try{
    const response = await login({
      account: form.value.account,
      password: form.value.password,
      timestamp: Date.now()
    })

    if(response.success){
      alert('登录成功！')
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        // 小程序环境
        wx.setStorageSync('user_account', form.value.account);
      } else {
        // 浏览器环境
        localStorage.setItem('user_account', form.value.account);
      }
      router.push('/Home')
    } else {
      alert(`登录失败：${response.message}`)
    }
  }catch(error){
    alert(`登录异常：${error.message}`)
  }finally{
    loading.value = false
}

}









</script>

<style scoped>
/* 全局重置：消除默认边距和滚动条 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面容器：全屏居中 */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

/* 登录容器：响应式布局 */
.login-container {
  width: 100%;
  max-width: 800px;
  height: 500px;
  min-height: 400px;
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
/* 移动端适配：垂直布局 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    height: auto;
    max-height: 90vh;
  }
}

/* 左侧图片区域：PC端显示，移动端隐藏 */
.left-section {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}
@media (max-width: 768px) {
  .left-section {
    display: none !important;
  }
}
.vue-logo {
  width: 80%;
  height: auto;
  object-fit: contain;
}

/* 右侧登录区域：自适应 */
.right-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
@media (max-width: 768px) {
  .right-section {
    width: 100%;
    padding: 30px 20px !important;
  }
}
.login-form {
  width: 100%;
  max-width: 320px;
}

/* 登录标题（移动端显示） */
.login-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  display: none;
}
@media (max-width: 768px) {
  .login-title {
    display: block !important;
  }
}

/* 输入框样式 */
.input-field {
  width: 100%;
  height: 46px;
  margin-bottom: 18px;
  padding: 0 15px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}
@media (max-width: 768px) {
  .input-field {
    height: 44px !important;
  }
}
.input-field:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
.input-field::placeholder {
  color: #999;
}

/* 输入框组 */
.input-group {
  position: relative;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 46px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin: 20px 0;
  transition: background-color 0.2s;
}
@media (max-width: 768px) {
  .login-btn {
    height: 44px !important;
  }
}
.login-btn:hover {
  background-color: #3390e7;
}
.login-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
}

/* 底部协议与链接 */
.footer {
  font-size: 13px;
  color: #666;
}
.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  line-height: 1.4;
}
.agreement input {
  margin-right: 6px;
  width: 14px;
  height: 14px;
}
.link {
  color: #409eff;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.other-links {
  text-align: right;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}
.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
}
.terms-content {
  line-height: 1.6;
  color: #555;
}
.terms-content h4 {
  margin: 15px 0 8px;
  color: #333;
  font-size: 15px;
}
.terms-content p {
  margin-bottom: 10px;
  font-size: 14px;
}
/* 适配极小屏手机 */
@media (max-width: 375px) {
  .login-form {
    max-width: 100%;
  }
  .footer {
    font-size: 12px;
  }
}
</style>