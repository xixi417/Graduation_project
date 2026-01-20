<template>
  <div class="page-container">
    <!-- 步骤导航 -->
    <div class="steps-nav">
      <!-- 返回 -->
      <button class="back-btn" @click="handleBack">
        <i class="icon-back">←</i> 返回
      </button>

      <div v-for="(step, idx) in steps" :key="idx" :class="['step-item', currentStep === idx + 1 ? 'active' : '']">
        <span class="step-num">{{ idx + 1 }}</span>
        <span class="step-text">{{ step }}</span>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-card">
      <!-- 第1步：基础信息 -->
      <div v-if="currentStep === 1">
        <h2 class="step-title">第1步：基础信息输入</h2>

        <!-- 计划名称 -->
        <div class="form-item">
          <label class="form-label">计划名称 <span class="required">*</span></label>
          <input v-model="formData.planName" type="text" class="form-input" placeholder="输入计划名称（如：Vue3实战项目攻坚计划）">
        </div>

        <!-- 学习内容描述 -->
        <div class="form-item">
          <label class="form-label">学习内容描述</label>
          <textarea v-model="formData.notes" class="form-textarea" placeholder="详细描述学习内容、目标成果、参考资源等"></textarea>
        </div>

        <!-- 已有基础（供AI参考，非FormData核心提交字段） -->
        <div class="form-item">
          <label class="form-label">已有基础（AI推荐参考）</label>
          <textarea v-model="aiReference.existingBase" class="form-textarea"
            placeholder="描述你的前置知识，填写越详细AI推荐越精准"></textarea>
        </div>

        <!-- AI智能规划按钮 -->
        <button class="ai-btn" @click="handleAiPlan" :disabled="aiLoading">
          <i class="icon-robot"></i> {{ aiLoading ? 'AI规划中...' : 'AI智能规划' }}
        </button>
      </div>

      <!-- 第2步：目标设定（总目标分钟数+小时换算） -->
      <div v-if="currentStep === 2">
        <h2 class="step-title">第2步：目标设定</h2>
        <div class="form-item">
          <label class="form-label">总目标分钟数 <span class="required">*</span></label>
          <div class="input-with-tip">
            <input v-model.number="formData.targetMinutes" type="number" min="1" class="form-input"
              placeholder="输入总学习分钟数（如：1800）">
            <span class="input-tip">
              换算为：{{ (formData.targetMinutes || 0) / 60 | numberFormat(1) }} 小时
            </span>
          </div>
        </div>
      </div>

      <!-- 第3步：弹性设置 -->
      <div v-if="currentStep === 3">
        <h2 class="step-title">第3步：弹性设置</h2>
        <div class="form-item">
          <label class="form-label">每周学习几天</label>
          <input v-model.number="formData.flexibleSettings.learningDaysPerWeek" type="number" min="1" max="7"
            class="form-input" placeholder="默认5天">
        </div>
        <div class="form-item">
          <label class="form-label">每日最少分钟</label>
          <input v-model.number="formData.flexibleSettings.minDailyMinutes" type="number" min="1" class="form-input"
            placeholder="默认30分钟">
        </div>
        <div class="form-item">
          <label class="form-label">每日最多分钟</label>
          <input v-model.number="formData.flexibleSettings.maxDailyMinutes" type="number" min="1" class="form-input"
            placeholder="默认480分钟（8小时）">
        </div>
      </div>

      <!-- 第4步：推荐子任务 -->
      <div v-if="currentStep === 4">
        <h2 class="step-title">第4步：子任务设置</h2>
        <div class="sub-task-list">
          <div v-for="(task, idx) in formData.recommendedSubTasks" :key="idx" class="sub-task-item">
            <div class="form-item">
              <label class="form-label">子任务 {{ idx + 1 }}</label>
              <input v-model="task.title" type="text" class="form-input" placeholder="子任务标题">
            </div>
            <div class="form-item">
              <label class="form-label">预估分钟数</label>
              <input v-model.number="task.estimatedMinutes" type="number" min="1" class="form-input"
                placeholder="输入子任务预估时长">
            </div>
            <button class="del-sub-task-btn" @click="formData.recommendedSubTasks.splice(idx, 1)">删除</button>
          </div>
          <button class="add-sub-task-btn" @click="addSubTask">新增子任务</button>
        </div>
      </div>

      <!-- 第5步：提醒设置 -->
      <div v-if="currentStep === 5">
        <h2 class="step-title">第5步：提醒设置</h2>
        <div class="form-item">
          <label class="form-label">提醒时间</label>
          <input v-model="formData.reminderTime" type="time" class="form-input" placeholder="默认19:00">
        </div>
      </div>

      <!-- 第6步：完成创建（最后一步） -->
      <div v-if="currentStep === 6">
        <h2 class="step-title">第6步：完成创建</h2>
        <div class="summary-card">
          <h3>计划信息汇总</h3>
          <p>计划名称：{{ formData.planName }}</p>
          <p>总目标时长：{{ formData.targetMinutes }} 分钟（{{ (formData.targetMinutes || 0) / 60 | numberFormat(1) }} 小时）</p>
          <p>每周学习：{{ formData.flexibleSettings.learningDaysPerWeek }} 天</p>
          <p>每日学习范围：{{ formData.flexibleSettings.minDailyMinutes }} - {{ formData.flexibleSettings.maxDailyMinutes }} 分钟
          </p>
          <p>提醒时间：{{ formData.reminderTime }}</p>
          <p>子任务数量：{{ formData.recommendedSubTasks.length }} 个</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="btn-group">
      <button class="btn prev-btn" @click="prevStep" :disabled="currentStep === 1">
        上一步
      </button>
      <button class="btn next-btn" @click="nextStep" :disabled="!canNext">
        {{ currentStep === 6 ? '创建任务' : '下一步' }}
      </button>
      <button class="btn skip-btn" @click="skipStep" v-if="currentStep !== 6">
        跳过/默认值
      </button>
    </div>

    <!-- AI规划弹窗（内容从后端获取，非写死） -->
    <teleport to="body">
      <div class="modal-mask" v-if="aiModalVisible" @click="closeAiModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>AI专属学习计划</h3>
            <button class="close-btn" @click="closeAiModal">×</button>
          </div>
          <div class="modal-body" v-if="!aiModalLoading">
            <p class="modal-intro">根据你的提交信息，AI为你生成以下专属学习计划：</p>

            <!-- 核心信息展示（与FormData字段对应） -->
            <div class="analysis-card">
              <h4>核心计划信息</h4>
              <ul>
                <li>计划名称：{{ aiPlanData.planName }}</li>
                <li>总目标时长：{{ aiPlanData.targetMinutes }} 分钟（{{ (aiPlanData.targetMinutes || 0) / 60 | numberFormat(1) }}
                  小时）</li>
                <li>每周学习：{{ aiPlanData.flexibleSettings.learningDaysPerWeek }} 天</li>
                <li>每日学习范围：{{ aiPlanData.flexibleSettings.minDailyMinutes }} - {{
                  aiPlanData.flexibleSettings.maxDailyMinutes }} 分钟</li>
                <li>提醒时间：{{ aiPlanData.reminderTime }}</li>
              </ul>
            </div>

            <!-- 学习内容描述 -->
            <div class="suggest-card">
              <h4>学习内容详细描述</h4>
              <p>{{ aiPlanData.notes || '无详细描述' }}</p>
            </div>

            <!-- 推荐子任务 -->
            <div class="sub-task-modal-card">
              <h4>推荐子任务</h4>
              <div v-if="aiPlanData.recommendedSubTasks.length > 0" class="modal-sub-task-list">
                <div v-for="(task, idx) in aiPlanData.recommendedSubTasks" :key="idx" class="modal-sub-task-item">
                  <p>{{ idx + 1 }}. {{ task.title }}（预估{{ task.estimatedMinutes }}分钟）</p>
                </div>
              </div>
              <p v-else class="no-sub-task">暂无推荐子任务</p>
            </div>
          </div>

          <!-- 弹窗加载状态 -->
          <div class="modal-loading" v-if="aiModalLoading">
            <p>正在加载AI规划内容，请稍候...</p>
            <div class="loading-spinner"></div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn cancel-btn" @click="closeAiModal" :disabled="aiModalLoading">手动调整</button>
            <button class="modal-btn confirm-btn" @click="applyAiPlan" :disabled="aiModalLoading">采用推荐</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 自定义提示弹窗 -->
    <teleport to="body">
      <div class="custom-alert-mask" v-if="alertVisible" @click="closeAlert">
        <div class="custom-alert-content" @click.stop>
          <div class="custom-alert-header">
            <h3>{{ alertTitle }}</h3>
          </div>
          <div class="custom-alert-body">
            <p>{{ alertMessage }}</p>
          </div>
          <div class="custom-alert-footer">
            <button class="custom-alert-btn" @click="handleAlertConfirm">确认</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// 引入后端请求函数（需根据你的项目封装调整，此处为示例）
import { getAiCom, sendTask } from './study-plan/study-plan'; // 假设api/plan中封装了后端GET/POST请求
import { useRouter } from 'vue-router';
import { StorageUtil } from '../../components/StorageUtil.js';

const router = useRouter();
// 步骤管理
const steps = [
  '基础信息', '目标设定', '弹性设置',
  '子任务设置', '提醒设置', '完成创建'
];
const currentStep = ref(1);

// 核心表单数据
const formData = ref({
  // 基础信息
  planName: '',
  notes: '',
  // 目标设定
  targetMinutes: null,
  // 弹性设置（嵌套对象）
  flexibleSettings: {
    learningDaysPerWeek: null,
    minDailyMinutes: null,
    maxDailyMinutes: null
  },
  // 推荐子任务
  recommendedSubTasks: [],
  // 提醒设置
  reminderTime: ''
});

// AI参考信息
const aiReference = ref({
  existingBase: ''
});

// AI相关状态管理
const aiLoading = ref(false); // AI按钮加载状态
const aiModalVisible = ref(false); // AI弹窗显示状态
const aiModalLoading = ref(false); // AI弹窗内容加载状态
const aiPlanData = ref({}); // 存储后端返回的AI规划数据（与formData结构完全一致）

// 自定义弹窗状态
const alertVisible = ref(false);
const alertTitle = ref('提示');
const alertMessage = ref('');
const alertCallback = ref(null); // 弹窗确认后的回调函数

// 格式化数字过滤器（保留n位小数）
const numberFormat = (value, decimalPlaces) => {
  if (isNaN(value)) return '0.0';
  return Number(value).toFixed(decimalPlaces);
};

// 新增子任务方法
const addSubTask = () => {
  formData.value.recommendedSubTasks.push({
    title: '',
    estimatedMinutes: null
  });
};

// 显示自定义弹窗
const showAlert = (message, title = '提示', callback = null) => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertCallback.value = callback;
  alertVisible.value = true;
};

// 关闭自定义弹窗
const closeAlert = () => {
  alertVisible.value = false;
  alertTitle.value = '提示';
  alertMessage.value = '';
  alertCallback.value = null;
};

// 确认自定义弹窗
const handleAlertConfirm = () => {
  if (typeof alertCallback.value === 'function') {
    alertCallback.value();
  }
  closeAlert();
};

const handleAiPlan = async () => {
  if (!formData.value.planName) {
    showAlert('请先填写计划名称，以便AI生成更精准的规划', '提示');
    return;
  }

  try {
    aiLoading.value = true;

    const submitParams = {
      ...formData.value,
      existingBase: aiReference.value.existingBase
    };
    console.log(submitParams);
    const res = await getAiCom(submitParams);
    if (res.code === 200) {
      aiPlanData.value = res.data;
      aiModalVisible.value = true;
    } else {
      showAlert('AI规划生成失败：' + res.msg, '错误');
    }
  } catch (error) {
    console.error('AI规划请求异常：', error);
    showAlert('AI规划请求失败，请稍后重试', '错误');
  } finally {
    aiLoading.value = false;
  }
};

// 关闭AI弹窗
const closeAiModal = () => {
  aiModalVisible.value = false;
  aiPlanData.value = {}; 
};

// 应用AI推荐
const applyAiPlan = () => {
  formData.value = JSON.parse(JSON.stringify(aiPlanData.value));
  currentStep.value = 6;
  aiModalVisible.value = false;
};

// 步骤切换方法
const nextStep = async () => {
  if (currentStep.value < 6) {
    currentStep.value++;
  } else {
    console.log('最终提交的formData：', formData.value);
    const param = {
      userId: StorageUtil.getRawString('user_userid'),
      planName: formData.value.planName,
      notes: formData.value.notes,
      targetMinutes: formData.value.targetMinutes,
      flexibleSettings: formData.value.flexibleSettings,
      recommendedSubTasks: formData.value.recommendedSubTasks,
      reminderTime: formData.value.reminderTime
    }
    try {
      const res = await sendTask(param);
      if (res.code == 200) {
        showAlert("创建成功", "成功", () => {
          router.push('./study-plan/study-plan');
        });
      }
      else {
        showAlert("创建失败，请重试", "错误");
      }
    } catch (error) {
      console.error('创建失败', error);
      showAlert("创建失败，请稍后重试", "错误");
    }
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const skipStep = () => {
  // 跳过当前步骤，填充默认值
  if (currentStep.value === 1 && !formData.value.planName) {
    formData.value.planName = '未命名学习计划';
  }
  if (currentStep.value === 2 && !formData.value.targetMinutes) {
    formData.value.targetMinutes = 1800;
  }
  if (currentStep.value === 3) {
    formData.value.flexibleSettings = {
      learningDaysPerWeek: 5,
      minDailyMinutes: 30,
      maxDailyMinutes: 480
    };
    if (currentStep.value === 5) {
      formData.value.reminderTime = '19:00';
    }
  }
  nextStep();
};

// 下一步按钮禁用逻辑
const canNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!formData.value.planName;
    case 2:
      return !!formData.value.targetMinutes && formData.value.targetMinutes > 0;
    default:
      return true;
  }
});
//返回
const handleBack = () => {
  StorageUtil.set('to-add-title', null);
  router.push('./study-plan/study-plan');
};

onMounted ( () => {
  // 检查是否有预填充的计划名称
  let param = null;
  
  try {
    param = StorageUtil.get('to-add-title');
    // console.log("些",param);
    // let param = JSON.parse(paramStr);
    if (param.title) {
      formData.value.planName = param.title;
    }
    if (param.isSou === 1 && param.studyPlan && Array.isArray(param.studyPlan)) {

      formData.value.recommendedSubTasks = param.studyPlan;
    }
    console.log("预填充计划名称：", formData.value.recommendedSubTasks);
  } catch (e) {
    console.error('获取预填充计划名称失败:', e);
  }

});


</script>

<style scoped>
/* 基础布局 */
.add-plan-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 步骤导航 */
.steps-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.step-item.active {
  color: #3498db;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.step-item.active .step-num {
  background: #3498db;
  color: white;
}

.step-text {
  font-size: 14px;
  white-space: nowrap;
}

/* 返回按钮样式 */
.back-btn {
  background: none;
  border: none;
  color: #3498db;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  margin-right: 10px;
}

.back-btn:hover {
  color: #2980b9;
  text-decoration: underline;
}

.icon-back {
  font-size: 16px;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;
}

.step-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.input-with-tip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-tip {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

/* AI按钮 */
.ai-btn {
  background: linear-gradient(135deg, #6c63ff, #f56565);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 10px;
  opacity: 1;
  transition: opacity 0.3s;
}

.ai-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.icon-robot {
  font-size: 16px;
}

/* 子任务样式 */
.sub-task-list {
  margin-top: 20px;
}

.sub-task-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
}

.del-sub-task-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.add-sub-task-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.prev-btn {
  background: #eee;
  color: #666;
}

.prev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: #3498db;
  color: white;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.skip-btn {
  background: #f5f5f5;
  color: #666;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.modal-intro {
  margin-bottom: 16px;
  color: #333;
}

.analysis-card,
.suggest-card,
.sub-task-modal-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.analysis-card h4,
.suggest-card h4,
.sub-task-modal-card h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
}

.analysis-card ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
}

.analysis-card li {
  margin-bottom: 8px;
}

.modal-sub-task-list {
  color: #555;
}

.modal-sub-task-item {
  margin-bottom: 6px;
  padding-left: 12px;
  border-left: 2px solid #3498db;
}

.no-sub-task {
  color: #666;
  text-align: center;
  padding: 8px 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  background: #eee;
  color: #666;
}

.confirm-btn {
  background: #3498db;
  color: white;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 弹窗加载样式 */
.modal-loading {
  text-align: center;
  padding: 20px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #eee;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 16px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 汇总卡片 */
.summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  color: #333;
}

.summary-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #2c3e50;
}

.summary-card p {
  margin: 8px 0;
}

/* 自定义提示弹窗样式 */
.custom-alert-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.custom-alert-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
}

.custom-alert-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.custom-alert-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.custom-alert-body {
  margin-bottom: 20px;
}

.custom-alert-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.custom-alert-footer {
  text-align: center;
}

.custom-alert-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
}

.custom-alert-btn:hover {
  background: #2980b9;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .steps-nav {
    gap: 12px;
  }

  .step-text {
    font-size: 12px;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .ai-btn {
    width: 100%;
    justify-content: center;
  }

  .input-with-tip {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .del-sub-task-btn {
    top: 8px;
    right: 8px;
    padding: 2px 6px;
  }

  .custom-alert-content {
    width: 85%;
  }
}
</style>