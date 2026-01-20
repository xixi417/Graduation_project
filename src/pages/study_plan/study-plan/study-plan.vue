<template>
  <div class="page-container">
    <!-- 页面头部（包含手动刷新按钮） -->
    <div class="page-header">
      <h2 class="page-title">我的学习计划</h2>
      <button class="refresh-btn" @click="handleManualRefresh">🔄 刷新</button>
    </div>

    <!-- 任务列表区域 -->
    <div class="task-list">
      <!-- 任务项（循环渲染，用ID映射） -->
      <div 
        v-for="task in taskList" 
        :key="task.id" 
        class="task-item"
      >
        <!-- 任务头部 -->
        <div class="task-header">
          <div class="task-title-wrap">
            <button class="task-title-text" @click="handleTaskClick(task.id)">{{ task.planName }}</button>
            <button class="edit-btn" @click.stop="openEditModal('task', task.id)">✏️</button>
          </div>
          <span 
            class="expand-arrow" 
            :class="{ 'expanded': task.isExpanded }"
            @click.stop="toggleSubtaskExpand(task.id)"
          >
            ▼
          </span>
          
          <span class="task-status">{{ taskStatusMap[task.status]  }}</span>
          
          <button class="delete-btn" @click.stop="deleteMainTask(task.id)">❌</button>
        </div>

        <!-- 子任务区域 -->
        <div class="subtask-container" v-if="task.isExpanded">
          <div 
            v-for="subtask in task.subtasks" 
            :key="subtask.id" 
            class="subtask-item"
          >
            <div class="subtask-title-wrap">
              <button class="subtask-text" @click="handleSubTaskClick(task.id, subtask.id)">
                {{ subtask.planName }}
                
              </button>
              <button class="edit-btn subtask-edit-btn" @click.stop="openEditModal('subtask', task.id, subtask.id)">✏️</button>
            </div>
            <span class="subtask-status">{{ taskStatusMap[subtask.status]  }}</span>
            <button class="delete-btn subtask-delete-btn" @click.stop="deleteSubTask(task.id, subtask.id)">❌</button>
          </div>

          <button class="add-subtask-btn" @click.stop="openEditModal('addSubtask', task.id)">➕ 点击添加子任务</button>
        </div>
      </div>

      <div class="empty-tip" v-if="taskList.length === 0">
        暂无任务，点击下方"新设目标"创建吧~
      </div>
    </div>

    <!-- 新设目标按钮 -->
    <button class="new-plan-btn" @click="navigateToNewPlan">新设目标</button>

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


    <!-- 编辑/添加表单弹窗 -->
    <div class="modal-mask" v-if="isModalOpen" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <input 
          v-model="currentForm.planName" 
          type="text" 
          class="modal-input" 
          :placeholder="modalPlaceholder"
          @keyup.enter="submitModalForm"
          @input="handlePlanNameChange"
        >
        
        <!-- 主任务灵活设置项 -->
        <div v-if="modalType === 'task'" class="flexible-settings">
          <h4 class="settings-title">灵活设置</h4>
          <div class="settings-item">
            <label>每周学习天数：</label>
            <input 
              v-model.number="currentForm.flexibleSettings.learningDaysPerWeek" 
              type="number" 
              min="1" 
              max="7"
              class="settings-input"
            >
          </div>
          <div class="settings-item">
            <label>每日最少分钟：</label>
            <input 
              v-model.number="currentForm.flexibleSettings.minDailyMinutes" 
              type="number" 
              min="0"
              class="settings-input"
            >
          </div>
          <div class="settings-item">
            <label>每日最多分钟：</label>
            <input 
              v-model.number="currentForm.flexibleSettings.maxDailyMinutes" 
              type="number" 
              min="0"
              class="settings-input"
            >
          </div>
        </div>
        
        <!-- 子任务目标时长 -->
        <div v-if="modalType === 'subtask' || modalType === 'addSubtask'" class="subtask-settings">
          <div class="settings-item">
            <label>目标时长（分钟）：</label>
            <input 
              v-model.number="currentForm.targetMinutes" 
              type="number" 
              min="0"
              class="settings-input"
            >
          </div>
          
          <!-- AI推荐时长（仅添加子任务时显示） -->
          <div v-if="modalType === 'addSubtask' && aiRecommendMinutes !== null" class="ai-recommendation">
            <span>AI推荐总时长：{{ aiRecommendMinutes }}分钟</span><br>
            <span>AI推荐每日时长：{{ aiRecommendedDailyMinutes }}分钟</span><br>
            <span>前置知识：{{ aiPrerequisites.join('、') }}</span>
          </div>
        </div>

        <div class="modal-btn-group">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button class="modal-btn confirm-btn" @click="submitModalForm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as studyPlanApi from './study-plan';
import { House, Flag, Star, Timer, User } from '@element-plus/icons-vue'
import { StorageUtil } from '../../../components/StorageUtil'

// 响应式变量
const planStatus = ref("");
const router = useRouter();
const taskList = ref([]);
const isModalOpen = ref(false);
const modalType = ref('');
const modalTitle = ref('');
const modalPlaceholder = ref('');
const modalTargetIds = ref({
  taskId: '',
  subtaskId: ''
});
const aiRecommendMinutes = ref(null); // AI推荐总时长
const aiRecommendedDailyMinutes = ref(null); // AI推荐每日时长
const aiPrerequisites = ref([]); // AI推荐前置知识

const currentForm = ref({
  id: '',
  planName: '',
  preId: '',
  status: 'not_started',
  targetMinutes: null, // 子任务目标时长
  flexibleSettings: {  // 主任务灵活设置
    learningDaysPerWeek: null,
    minDailyMinutes: null,
    maxDailyMinutes: null
  }
});

const taskStatusMap = {
  'not_started': '未开始',
  'in_progress': '进行中',
  'completed': '已完成',
  'paused': '暂停中',
  'abandoned': '已放弃'
}





const getProgressPath = () => {
  const userId = StorageUtil.getRawString('user_userid')
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
const activeTab = ref('计划');




// 底部Tab点击跳转+激活状态
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 辅助方法（通过ID查找）
const findTaskById = (taskId) => {
  return taskList.value.find(task => task.id === taskId) || null;
};

const findSubtaskById = (taskId, subtaskId) => {
  const task = findTaskById(taskId);
  if (!task || !task.subtasks) return null;
  return task.subtasks.find(subtask => subtask.id === subtaskId) || null;
};

const findTaskIndexById = (taskId) => {
  return taskList.value.findIndex(task => task.id === taskId);
};

const findSubtaskIndexById = (taskId, subtaskId) => {
  const task = findTaskById(taskId);
  if (!task || !task.subtasks) return -1;
  return task.subtasks.findIndex(subtask => subtask.id === subtaskId);
};

// 数据拉取
const fetchTaskList = async () => {
  try {
    const userId = StorageUtil.getRawString('user_userid');
    const params = { userId };
    console.log('【API调用】getTaskList，参数：', params);
    const response = await studyPlanApi.getTaskList(params);
    console.log('【API返回】getTaskList：', response);

    if (response.code === 200 && Array.isArray(response.data)) {
      taskList.value = response.data.map(task => ({
        ...task,
        isExpanded: task.isExpanded || false,
        status: task.status || "not_started",
        subtasks: (task.subtasks || []).map(subtask => ({  
          ...subtask,
          status: subtask.status || "not_started",
          targetHours:subtask.targetHours || 0
        })),
        flexibleSettings: task.flexibleSettings || {
          learningDaysPerWeek: null,
          minDailyMinutes: null,
          maxDailyMinutes: null
        }
      })
    );
      //setStorage('study_plan_taskList', taskList.value);
      console.log('【数据同步】后端数据拉取成功，本地列表已更新');
    } else {
      console.error('获取任务列表失败:', response?.msg || '接口返回非成功状态');
      taskList.value = [];
    }
  } catch (err) {
    console.error('获取任务列表异常:', err);
    taskList.value = [];
  }
};

// 手动刷新方法
const handleManualRefresh = async () => {
  console.log('【用户操作】触发手动刷新，拉取后端最新数据');
  await fetchTaskList();
  // alert('刷新成功，已同步后端最新数据');
};


// 防抖函数
const debounce = (func, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// 任务名称变化时获取AI推荐
const handlePlanNameChange = debounce(async () => {
  if (modalType.value !== 'addSubtask') return;
  
  const planName = currentForm.value.planName?.trim();
  if (!planName) {
    // 清空推荐数据
    aiRecommendMinutes.value = null;
    aiRecommendedDailyMinutes.value = null;
    aiPrerequisites.value = [];
    return;
  }

  try {
    const params = {
      taskId: modalTargetIds.value.taskId,
      subplanName: planName,
      userId: StorageUtil.getRawString('user_userid')
    };
    console.log('【API调用】getAiSubtaskRecommendations，参数：', params);
    const response = await studyPlanApi.getAiSubtaskRecommendations(params);
    console.log('【API返回】getAiSubtaskRecommendations：', response);
    
    if (response.code === 200) {
      // 解析API返回的推荐数据
      aiRecommendMinutes.value = response.data?.ai_recommended_minutes || null;
      aiRecommendedDailyMinutes.value = response.data?.ai_recommended_daily_minutes || null;
      // 处理前置知识数组
      if (response.data?.ai_prerequisites) {
        try {
          aiPrerequisites.value = JSON.parse(response.data.ai_prerequisites);
        } catch (e) {
          aiPrerequisites.value = [response.data.ai_prerequisites];
        }
      } else {
        aiPrerequisites.value = [];
      }
    } else {
      // 接口返回非成功状态，清空推荐
      aiRecommendMinutes.value = null;
      aiRecommendedDailyMinutes.value = null;
      aiPrerequisites.value = [];
    }
  } catch (err) {
    console.error('获取AI推荐时长失败:', err);
    // 异常时清空推荐
    aiRecommendMinutes.value = null;
    aiRecommendedDailyMinutes.value = null;
    aiPrerequisites.value = [];
  }
});

// 弹窗操作
const openEditModal = (type, taskId, subtaskId = '') => {
  modalType.value = type;
  modalTargetIds.value = { taskId, subtaskId };
  isModalOpen.value = true;
  // 重置AI推荐数据
  aiRecommendMinutes.value = null;
  aiRecommendedDailyMinutes.value = null;
  aiPrerequisites.value = [];

  const currentTask = findTaskById(taskId);
  currentForm.value = {
    id: '',
    planName: '',
    preId: currentTask?.id || '',
    status: 'not_started',
    targetMinutes: null,
    flexibleSettings: {
      learningDaysPerWeek: null,
      minDailyMinutes: null,
      maxDailyMinutes: null
    }
  };

  switch (type) {
    case 'task':
      if (!currentTask) {
        console.error('主任务不存在，无法编辑');
        closeModal();
        return;
      }
      modalTitle.value = '编辑主任务';
      modalPlaceholder.value = '请输入主任务名称';
      currentForm.value = {
        ...currentTask,
        preId: '',
        flexibleSettings: currentTask.flexibleSettings || {
          learningDaysPerWeek: null,
          minDailyMinutes: null,
          maxDailyMinutes: null
        }
      };
      break;
    case 'subtask':
      const currentSubtask = findSubtaskById(taskId, subtaskId);
      if (!currentTask || !currentSubtask) {
        console.error('主任务或子任务不存在，无法编辑');
        closeModal();
        return;
      }
      modalTitle.value = '编辑子任务';
      modalPlaceholder.value = '请输入子任务名称';
      currentForm.value = {
        ...currentSubtask,
        preId: currentTask.id,
        targetMinutes: currentSubtask.targetMinutes || null
      };
      break;
    case 'addSubtask':
      if (!currentTask) {
        console.error('主任务不存在，无法添加子任务');
        closeModal();
        return;
      }
      modalTitle.value = '添加子任务';
      modalPlaceholder.value = '请输入子任务名称';
      currentForm.value = {
        id: Date.now().toString(),
        planName: '',
        preId: currentTask.id,
        status: 'not_started',
        targetMinutes: null
      };
      break;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  modalType.value = '';
  modalTargetIds.value = { taskId: '', subtaskId: '' };
  currentForm.value = {
    id: '',
    planName: '',
    preId: '',
    status: 'not_started',
    targetMinutes: null,
    flexibleSettings: {
      learningDaysPerWeek: null,
      minDailyMinutes: null,
      maxDailyMinutes: null
    }
  };
  // 清空AI推荐数据
  aiRecommendMinutes.value = null;
  aiRecommendedDailyMinutes.value = null;
  aiPrerequisites.value = [];
};

// 表单提交
const submitModalForm = async () => {
  try {
    const { taskId, subtaskId } = modalTargetIds.value;
    const currentTask = findTaskById(taskId);
    if (!currentTask) {
      console.error('当前操作的主任务不存在');
      closeModal();
      return;
    }

    // 表单验证
    const planName = currentForm.value.planName?.trim() || '';
    if (!planName) {
      console.warn('【表单验证】任务名称不能为空，且不可仅输入空格');
      return;
    }
    currentForm.value.planName = planName;

    const userId = StorageUtil.getRawString('user_userid');
    let apiRes = null;

    switch (modalType.value) {
      case 'task':
        const updateTaskParams = {
          id: currentForm.value.id,
          planName: currentForm.value.planName,
          status: currentForm.value.status,
          userId,
          flexibleSettings: currentForm.value.flexibleSettings
        };
        console.log('【API调用】updateTask，参数：', updateTaskParams);
        apiRes = await studyPlanApi.updateTask(updateTaskParams);
        console.log('【API返回】updateTask：', apiRes);

        if (apiRes.code === 200) {
          const taskIndex = findTaskIndexById(taskId);
          if (taskIndex > -1) {
            taskList.value[taskIndex] = {
              ...taskList.value[taskIndex],
              planName,
              flexibleSettings: currentForm.value.flexibleSettings
            };
            StorageUtil.set('study_plan_taskList', taskList.value);
            // console.log('ces',StorageUtil.get('study_plan_taskList'));
          }
          console.log('【本地更新】主任务编辑成功');
        } else {
          console.error('编辑主任务失败:', apiRes?.msg);
        }
        break;

      case 'subtask':
        const updateSubParams = {
          id: currentForm.value.id,
          taskId: currentTask.id,
          preId: currentForm.value.preId,
          planName: currentForm.value.planName,
          status: currentForm.value.status,
          userId,
          targetMinutes: currentForm.value.targetMinutes
        };
        console.log('【API调用】updateSubTask，参数：', updateSubParams);
        apiRes = await studyPlanApi.updateSubTask(updateSubParams);
        console.log('【API返回】updateSubTask：', apiRes);

        if (apiRes.code === 200) {
          const subtaskIndex = findSubtaskIndexById(taskId, subtaskId);
          if (subtaskIndex > -1) {
            taskList.value[findTaskIndexById(taskId)].subtasks[subtaskIndex] = {
              ...taskList.value[findTaskIndexById(taskId)].subtasks[subtaskIndex],
              planName,
              targetMinutes: currentForm.value.targetMinutes
            };
            StorageUtil.set('study_plan_taskList', taskList.value);
          }
          console.log('【本地更新】子任务编辑成功');
        } else {
          console.error('编辑子任务失败:', apiRes?.msg);
        }
        break;

      case 'addSubtask':
        const addSubParams = {
          ...currentForm.value,
          userId,
          taskId: currentTask.id,
          targetMinutes: currentForm.value.targetMinutes
        };
        console.log('【API调用】addNewSubplan，参数：', addSubParams);
        apiRes = await studyPlanApi.addNewSubplan(addSubParams);
        console.log('【API返回】addNewSubplan：', apiRes);

        if (apiRes.code === 200) {
          const newSubtask = apiRes.data || currentForm.value;
          taskList.value[findTaskIndexById(taskId)].subtasks.push(newSubtask);
          StorageUtil.set('study_plan_taskList', taskList.value);
          console.log('【本地更新】子任务添加成功');
        } else {
          console.error('添加子任务失败:', apiRes?.msg);
        }
        break;
    }

    closeModal();
  } catch (err) {
    console.error('表单提交失败:', err);
    closeModal();
  }
};

// 其他事件处理
const handleTaskClick = (taskId) => {
  const currentTask = findTaskById(taskId);
  if (currentTask) {
    StorageUtil.set('study_plan_currentTask', currentTask);
    
    StorageUtil.set('study_plan_currentSubTask',null)

    router.push('../study-plan-details/study-plan-details');
  }
  // console.log("subtaskObj不为空",getStorage('study_plan_currentSubTask'));
};

const handleSubTaskClick = (taskId, subtaskId) => {
  const currentSubtask = findSubtaskById(taskId, subtaskId);
  if (currentSubtask) {
    StorageUtil.set('study_plan_currentSubTask', currentSubtask);
    StorageUtil.set('study_plan_currentTask',null);
    router.push('../study-plan-details/study-plan-details');
  }
};

const toggleSubtaskExpand = (taskId) => {
  const taskIndex = findTaskIndexById(taskId);
  if (taskIndex > -1) {
    taskList.value[taskIndex].isExpanded = !taskList.value[taskIndex].isExpanded;
    StorageUtil.set('study_plan_taskList', taskList.value);
  }
};

const deleteMainTask = async (taskId) => {
  if (!confirm('确定要删除这个主任务吗？删除后将同时删除其子任务！')) return;
  
  try {
    const currentTask = findTaskById(taskId);
    if (!currentTask) {
      console.error('主任务不存在，无法删除');
      return;
    }

    const deleteTaskParams = {
      taskId: currentTask.id,
      userId: StorageUtil.get('user_userid')
    };
    console.log('【API调用】deleteTask，参数：', deleteTaskParams);
    const res = await studyPlanApi.deleteTask(deleteTaskParams);
    console.log('【API返回】deleteTask：', res);

    if (res.code === 200) {
      const taskIndex = findTaskIndexById(taskId);
      if (taskIndex > -1) {
        taskList.value.splice(taskIndex, 1);
        StorageUtil.set('study_plan_taskList', taskList.value);
      }
      console.log('【本地更新】主任务删除成功');
    } else {
      console.error('删除主任务失败:', res?.msg);
    }
  } catch (err) {
    console.error('删除主任务异常:', err);
  }
};

const deleteSubTask = async (taskId, subtaskId) => {
  if (!confirm('确定要删除这个子任务吗？')) return;
  
  try {
    const currentTask = findTaskById(taskId);
    const currentSubtask = findSubtaskById(taskId, subtaskId);
    if (!currentTask || !currentSubtask) {
      console.error('主任务或子任务不存在，无法删除');
      return;
    }

    const deleteSubParams = {
      taskId: currentTask.id,
      subTaskId: currentSubtask.id,
      userId: StorageUtil.get('user_userid')
    };
    console.log('【API调用】deleteSubTask，参数：', deleteSubParams);
    const res = await studyPlanApi.deleteSubTask(deleteSubParams);
    console.log('【API返回】deleteSubTask：', res);

    if (res.code === 200) {
      const subtaskIndex = findSubtaskIndexById(taskId, subtaskId);
      if (subtaskIndex > -1) {
        taskList.value[findTaskIndexById(taskId)].subtasks.splice(subtaskIndex, 1);
        StorageUtil.set('study_plan_taskList', taskList.value);
      }
      console.log('【本地更新】子任务删除成功');
    } else {
      console.error('删除子任务失败:', res?.msg);
    }
  } catch (err) {
    console.error('删除子任务异常:', err);
  }
};

const navigateToNewPlan = () => {
  router.push('.././add-plan');
};

// 页面初始化时拉取数据
onMounted(async () => {
  await fetchTaskList();
});
</script>

<style scoped>
/* 原有样式保持不变 */
:root {
  --border-color: #e5e7eb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --active-color: #4cbfa3;
  --active-bg: #f0fdfa;
  --bg-primary: #f9fafb;
}

/* 页面头部样式 */
.page-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  padding: 8px 12px;
  background-color: var(--active-bg);
  color: var(--active-color);
  border: 1px solid var(--active-color);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: var(--active-color);
  color: white;
}

.task-list {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 60px; /* 避开底部Tab栏 */
}

.task-header {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  cursor: default; 
  color : var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) ;
}

.task-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.edit-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  padding: 2px;
}

.edit-btn:hover {
  color: var(--active-color);
}

.expand-arrow {
  font-size: 14px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  cursor: pointer;
  margin: 0 8px;
}

.expand-arrow.expanded {
  transform: rotate(180deg);
  color: var(--active-color);
}

.delete-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  padding: 2px;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.subtask-container {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: var(--active-bg);
  border-radius: 8px;
}

.subtask-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtask-text {
  font-size: 14px;
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.subtask-edit-btn {
  font-size: 14px;
}

.subtask-delete-btn {
  font-size: 12px;
}

.add-subtask-btn {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: var(--active-bg);
  border: 1px dashed var(--active-color);
  border-radius: 8px;
  color: var(--active-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.add-subtask-btn:hover {
  background-color: var(--active-color);
  color: white;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: var(--text-tertiary);
  font-size: 14px;
}

.new-plan-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  padding: 12px 24px;
  background-color: var(--active-color);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(76, 191, 153, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 191, 153, 0.4);
}

@media (min-width: 768px) {
  .new-plan-btn {
    right: calc(50% - 187px + 20px);
  }
}

.modal-mask {
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
}

.modal-content {
  width: 80%;
  max-width: 400px;
  background: white;
  padding: 24px;
  border-radius: 12px;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 20px;
  outline: none;
}

.modal-input:focus {
  border-color: var(--active-color);
  box-shadow: 0 0 0 2px rgba(76, 191, 153, 0.2);
}

.modal-btn-group {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.confirm-btn {
  background: var(--active-color);
  color: white;
}
.flexible-settings, .subtask-settings {
  margin: 16px 0;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.settings-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
  font-weight: 500;
}

.settings-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.settings-item label {
  font-size: 14px;
  color: #1f2937;
  width: 120px;
}

.settings-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.ai-recommendation {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  padding-left: 120px;
}
.task-status, .subtask-status {
  font-size: 10px;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0fdfa;
  color: #4cbfa3;
}

</style>