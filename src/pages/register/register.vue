<template>
  <div class="register-page">
    <!-- 注册容器：响应式布局 -->
    <div class="register-container">
      <!-- 左侧图片区域：移动端隐藏，PC端显示 -->
      <div class="left-section">
        <img src="@/assets/vue.svg" alt="Vue图标" class="vue-logo" />
      </div>

      <!-- 右侧注册表单区域：自适应宽度 -->
      <div class="right-section">
        <div class="register-form">
          <!-- 注册标题（移动端显示） -->
          <h2 class="register-title">用户注册</h2>

          <!-- 返回登录链接 -->
          <div class="back-login">
            <router-link to="/register/login" class="link">
              ← 返回登录
            </router-link>
          </div>

          <!-- 注册表单 -->
          <input 
            type="text" 
            class="input-field" 
            placeholder="请输入用户名"
            v-model="form.username"
            maxlength="20"
            @focus="clearError('username')"
          >
          <div v-if="errors.username" class="error-msg">{{ errors.username }}</div>

          <input 
            type="text" 
            class="input-field" 
            placeholder="请输入邮箱/手机号"
            v-model="form.account"
            maxlength="50"
            @focus="clearError('account')"
          >
          <div v-if="errors.account" class="error-msg">{{ errors.account }}</div>

          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'"
              class="input-field" 
              placeholder="请输入密码（6-20位）"
              v-model="form.password"
              maxlength="20"
              @focus="clearError('password')"
            >
            <span 
              class="extra-btn"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </span>
          </div>
          <div v-if="errors.password" class="error-msg">{{ errors.password }}</div>

          <input 
            type="password" 
            class="input-field" 
            placeholder="请确认密码"
            v-model="form.confirmPassword"
            maxlength="20"
            @focus="clearError('confirmPassword')"
          >
          <div v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</div>

          <!-- 注册按钮 -->
          <button 
            class="register-btn" 
            @click="handleRegister" 
            :disabled="!form.username || !form.account || !form.password || !form.confirmPassword || !form.agree || loading"
          >
            <span v-if="!loading">立即注册</span>
            <span v-else class="loading-text">注册中...</span>
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
              已有账户？
              <router-link to="/register/login" class="link">立即登录</router-link>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from './register.js'
import CryptoJS from 'crypto-js'

const router = useRouter()

// 表单数据
const form = reactive({
  username: '',
  account: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 错误信息
const errors = reactive({})
const loading = ref(false)
const showPassword = ref(false)
const showTerms = ref(false)
const showPolicy = ref(false)

// 清除错误信息
const clearError = (field) => {
  if (errors[field]) {
    errors[field] = ''
  }
}

// 表单验证
const validateForm = () => {
  const newErrors = {}
  
  // 用户名验证
  if (!form.username.trim()) {
    newErrors.username = '用户名不能为空'
  } else if (form.username.length < 2) {
    newErrors.username = '用户名至少2个字符'
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(form.username)) {
    newErrors.username = '用户名只能包含中文、英文、数字和下划线'
  }

  // 账号验证（邮箱或手机号）
  if (!form.account.trim()) {
    newErrors.account = '账号不能为空'
  } else {
    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    
   
  }

  // 密码验证
  if (!form.password) {
    newErrors.password = '密码不能为空'
  } else if (form.password.length < 6) {
    newErrors.password = '密码至少6位'
  } else if (form.password.length > 20) {
    newErrors.password = '密码最多20位'
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/.test(form.password)) {
    newErrors.password = '密码需包含字母和数字'
  }

  // 确认密码验证
  if (!form.confirmPassword) {
    newErrors.confirmPassword = '请确认密码'
  } else if (form.password !== form.confirmPassword) {
    newErrors.confirmPassword = '两次输入的密码不一致'
  }

  return newErrors
}

// 注册处理 - 留好与 register.js 的交互接口
const handleRegister = async () => {
  // 1. 表单验证
  const validationErrors = validateForm()
  if (Object.keys(validationErrors).length > 0) {
    Object.assign(errors, validationErrors)
    return
  }

  // 2. 准备注册数据
  const registerData = {
    username: form.username.trim(),
    account: form.account.trim(),
    password: form.password,
    // 可以添加额外字段，如注册时间
    registerTime: new Date().toISOString(),
  }
  
  console.log('注册数据准备完成：', registerData)
  
  // 3. 设置加载状态
  loading.value = true
  
  try {
    // 4. 调用注册接口
    const response = await register(registerData);
    
    // 5. 处理注册结果
    if (response.success) {
      // 注册成功
      console.log('注册成功，用户ID：', response.userId)
      alert('注册成功！即将跳转到登录页面')
      
      // 跳转到登录页面
      setTimeout(() => {
        router.push('/register/login')
      }, 1500)
    } else {
      // 注册失败
      console.error('注册失败：', response.message)
      alert(`注册失败：${response.message}`)
    }
  } catch (error) {
    // 6. 错误处理
    console.error('注册过程发生错误：', error)
    alert('注册失败，请检查网络或稍后重试')
  } finally {
    // 7. 重置加载状态
    loading.value = false
  }
}


  





</script>

<style scoped>
/* 继承登录页面的基础样式 */
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

/* 注册页面容器 */
.register-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

/* 注册容器：响应式布局 */
.register-container {
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
  .register-container {
    flex-direction: column;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
    margin: 20px;
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

/* 右侧注册区域：自适应 */
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
.register-form {
  width: 100%;
  max-width: 320px;
}

/* 注册标题（移动端显示） */
.register-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
  display: none;
}
@media (max-width: 768px) {
  .register-title {
    display: block !important;
  }
}

/* 返回登录链接 */
.back-login {
  margin-bottom: 20px;
  font-size: 14px;
}
.back-login .link {
  color: #409eff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.back-login .link:hover {
  text-decoration: underline;
}

/* 错误信息样式 */
.error-msg {
  font-size: 12px;
  color: #f56c6c;
  margin-top: -8px;
  margin-bottom: 12px;
  min-height: 16px;
}

/* 输入框样式（继承登录页） */
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

/* 密码显示/隐藏按钮 */
.input-group {
  position: relative;
}
.extra-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 0;
  background: none;
  border: none;
  outline: none;
}
.extra-btn:hover {
  color: #3390e7;
}

/* 注册按钮 */
.register-btn {
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
  .register-btn {
    height: 44px !important;
  }
}
.register-btn:hover:not(:disabled) {
  background-color: #3390e7;
}
.register-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
}

/* 加载中状态 */
.loading-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.loading-text::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部协议与链接（继承登录页） */
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
  cursor: pointer;
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
  .register-form {
    max-width: 100%;
  }
  .footer {
    font-size: 12px;
  }
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}
</style>