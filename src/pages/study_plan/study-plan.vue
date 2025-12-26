<template>
  <div class="page-container">
    <!-- 任务列表区域 -->
    <div class="task-list">
      <!-- 任务项（循环渲染） -->
      <div 
        v-for="(task, taskIndex) in taskList" 
        :key="task.id || taskIndex" 
        class="task-item"
        
      >
        <!-- 任务头部 -->
        <div class="task-header">
          <!-- 任务名称+铅笔编辑按钮 -->
          <div class="task-title-wrap">
            <button class="task-title-text" @click="handleTaskClick(taskIndex)">{{ task.planName }}</button>
            <button class="edit-btn" @click.stop="openEditModal('task', taskIndex)">
              ✏️
            </button>
          </div>
          <!-- 展开/收起箭头 -->
          <span 
            class="expand-arrow" 
            :class="{ 'expanded': task.isExpanded }"
            @click.stop="toggleSubtask(taskIndex)"
          >
            ▼
          </span>
          <!-- 删除任务按钮（❌） -->
          <button class="delete-btn" @click.stop="handleDeleteTask(task.id, taskIndex)">
            ❌
          </button>
        </div>

        <!-- 子任务区域（展开/收起） -->
        <div class="subtask-container" v-if="task.isExpanded">
          <!-- 子任务列表 -->
          <div 
            v-for="(subtask, subtaskIndex) in task.subtasks" 
            :key="subtask.id || subtaskIndex" 
            class="subtask-item"
           
          >
            <!-- 子任务名称+铅笔编辑按钮 -->
            <div class="subtask-title-wrap">
              <button class="subtask-text"  @click="handleSubTaskClick(taskIndex,subtaskIndex)" >{{ subtask.planName }}</button>
              <button class="edit-btn subtask-edit-btn" @click.stop="openEditModal('subtask', taskIndex, subtaskIndex)">
                ✏️
              </button>
            </div>
            <!-- 删除子任务按钮 -->
            <button class="delete-btn subtask-delete-btn" @click.stop="handleDeleteSubtask(taskIndex, subtaskIndex)">
              ❌
            </button>
          </div>

          <!-- 添加子任务按钮 -->
          <button class="add-subtask-btn" @click.stop="openEditModal('addSubtask', taskIndex)">
            ➕ 点击添加子任务
          </button>
        </div>
      </div>

      <!-- 空任务提示 -->
      <div class="empty-tip" v-if="taskList.length === 0">
        暂无任务，点击下方"新设目标"创建吧~
      </div>
    </div>

    <!-- 新设目标按钮 -->
    <button class="new-plan-btn" @click="navigateToNewPlan">
      新设目标
    </button>

    <!-- 4. 底部常驻Tab栏 -->
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
    <div class="modal-mask" v-if="modalVisible" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <input 
          v-model="modalFormValue" 
          type="text" 
          class="modal-input" 
          placeholder="请输入内容"
          @keyup.enter="submitModalForm"
        >
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
import { 
  House, Flag, Star, Timer, User
} from '@element-plus/icons-vue'

const username = ref('');

// 路由实例
const router = useRouter();

// 激活的底部Tab
const activeTab = ref('计划')

// 任务列表（本地+数据库同步）
const taskList = ref([]);

// 弹窗相关状态
const modalVisible = ref(false); // 弹窗显示状态
const modalType = ref(''); // 弹窗类型：task/subtask/addSubtask/confirm
const modalTargetIndex = ref({ task: 0, subtask: 0 }); // 目标索引
const modalTitle = ref(''); // 弹窗标题
const modalFormValue = ref(''); // 表单输入值
const pendingConfirm = ref({ callback: null }); // 待确认的回调
const oldSubContent = ref(''); // 用于缓存子任务旧值

// 底部Tab列表
const tabList = ref([
  { name: '首页', icon: House, path: '/Home' },
  { name: '计划', icon: Flag, path: '/study_plan/study-plan' },
  { name: '推荐', icon: Star, path: '/content-recommend' },
  { name: '进度', icon: Timer, path: '/progress-record' },
  { name: '个人', icon: User, path: '/personal_center/profile' }
])

// 页面挂载时加载任务
onMounted(async () => {
  await fetchTaskList();
});

// 底部Tab点击跳转+激活状态
const handleTabClick = (item) => {
  activeTab.value = item.name
  router.push(item.path)
}

// 从数据库获取任务列表
const fetchTaskList = async () => {
  try {
    const res = await studyPlanApi.getTaskList(username); 
    taskList.value = res.data || [];
    taskList.value.forEach(task => {
      task.isExpanded = false;
    });
  } catch (err) {
    console.error('获取任务失败：', err);
  }
  
};
const handleTaskClick = (taskIndex) => {
  const task = taskList.value[taskIndex];
  setStorage('currentTask', task);
  setStorage('currentSubtask', null);
  router.push('./study-plan-details');
};
const handleSubTaskClick = (taskIndex, subtaskIndex) => {
  const task = taskList.value[taskIndex];
  const subtask = task.subtasks[subtaskIndex];
  setStorage('currentTask', task);
  
  setStorage('currentSubtask', subtask);
  console.log(task);
  console.log(subtask);
  router.push('./study-plan-details');
};

// 展开/收起子任务（仅箭头触发）
const toggleSubtask = (taskIndex) => {
  taskList.value[taskIndex].isExpanded = !taskList.value[taskIndex].isExpanded;
};
//存储到本地
const setStorage = (key, value) => {
  try {
    // 检测是否为微信小程序环境
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(key, value);
    } else {
      // 网页环境使用localStorage
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('存储失败:', e);
  }
};

// 打开编辑/添加弹窗
const openEditModal = (type, taskIndex, subtaskIndex = 0) => {
  modalType.value = type;
  modalTargetIndex.value = { task: taskIndex, subtask: subtaskIndex };
  modalFormValue.value = '';

  // 设置弹窗标题和初始值
  switch (type) {
    case 'task':
      modalTitle.value = '编辑任务名称';
      modalFormValue.value = taskList.value[taskIndex].title;
      break;
    case 'subtask':
      modalTitle.value = '编辑子任务内容';
      const subtasks = taskList.value[taskIndex].subtasks || [];
      if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
        openConfirmModal('错误', '子任务不存在', () => {});
        return;
      }
      modalFormValue.value = subtasks[subtaskIndex].planName;
      // 缓存旧值
      oldSubContent.value = subtasks[subtaskIndex].planName;
      break;
    case 'addSubtask':
      modalTitle.value = '添加子任务';
      modalFormValue.value = '';
      break;
    case 'confirm':
      // confirm弹窗已经处理
      break;
  }

  if (modalType.value !== 'confirm') {
    modalVisible.value = true;
    // 自动聚焦输入框（需等DOM渲染完成）
    setTimeout(() => {
      document.querySelector('.modal-input')?.focus();
    }, 100);
  }
};


// 打开确认弹窗（替代alert和confirm）
const openConfirmModal = (title, message, callback) => {
  modalType.value = 'confirm';
  modalTitle.value = title;
  modalFormValue.value = message;
  pendingConfirm.value.callback = callback;
  modalVisible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  modalVisible.value = false;
  modalFormValue.value = '';
  pendingConfirm.value.callback = null;
  oldSubContent.value = '';
};

// 提交表单
const submitModalForm = async () => {
  const value = modalFormValue.value.trim();
  
  // 如果是确认弹窗
  if (modalType.value === 'confirm') {
    if (pendingConfirm.value.callback) {
      await pendingConfirm.value.callback();
    }
    closeModal();
    return;
  }

  // 原编辑/添加表单逻辑
  if (!value) {
    // 替换alert：内容不能为空
    openConfirmModal('提示', '内容不能为空', () => {});
    return;
  }

  const { task: taskIdx, subtask: subtaskIdx } = modalTargetIndex.value;
  const currentMainTask = taskList.value[taskIdx];
  
  // 根据类型处理表单提交
  switch (modalType.value) {
    case 'task':
      // 缓存旧值
      const oldTitle = currentMainTask.title;
      // 更新前端数据
      currentMainTask.title = value;
      
      // 同步到服务端
      try {
        await studyPlanApi.updateTask(currentMainTask.id, currentMainTask);
      } catch (err) {
        // 失败回滚
        currentMainTask.title = oldTitle;
        openConfirmModal('错误', '任务名称修改失败：' + (err.msg || '服务器异常'), () => {});
        console.error('同步数据失败：', err);
        return;
      }
      break;
      
    case 'subtask':
      // 更新前端数据
      currentMainTask.subtasks[subtaskIdx].planName = value;
      
      try {
        // 调用子任务更新接口
        await studyPlanApi.updateSubTask(
          currentMainTask.id, 
          currentMainTask.subtasks[subtaskIdx].id, 
          currentMainTask.subtasks[subtaskIdx]
        );
      } catch (err) {
        // 失败回滚
        currentMainTask.subtasks[subtaskIdx].planName = oldSubContent.value;
        openConfirmModal('错误', '子任务同步失败：' + (err.msg || '服务器异常'), () => {});
        console.error('同步数据失败：', err);
        return;
      }
      break; 
      
    case 'addSubtask':
      const newSubtask = {
        id: Date.now(),
        planName: value
      };
      // 更新前端数据
      currentMainTask.subtasks.push(newSubtask);
      
      try {
        // 调用子任务更新接口
        await studyPlanApi.updateSubTask(
          currentMainTask.id, 
          newSubtask.id, 
          newSubtask
        );
      } catch (err) {
        // 失败回滚
        currentMainTask.subtasks.pop();
        openConfirmModal('错误', '子任务添加失败：' + (err.msg || '服务器异常'), () => {});
        console.error('同步数据失败：', err);
        return;
      }
      break;
  }

  // 关闭弹窗
  closeModal();
};

// 删除主任务
const handleDeleteTask = async (taskId, taskIndex) => {
  openConfirmModal('确认删除', '确定删除该任务吗？', async () => {
    try {
      await studyPlanApi.deleteTask(taskId);
      taskList.value.splice(taskIndex, 1);
    } catch (err) {
      console.error('删除任务失败：', err);
    }
  });
};

// 删除子任务
const handleDeleteSubtask = (taskIndex, subtaskIndex) => {
  openConfirmModal('确认删除', '确定删除该子任务吗？', async () => {
    const currentMainTask = taskList.value[taskIndex];
    const targetSubtask = currentMainTask.subtasks[subtaskIndex];
    
    if (!targetSubtask) return;
    
    try {
      await studyPlanApi.deleteSubTask(currentMainTask.id, targetSubtask.id);
      currentMainTask.subtasks.splice(subtaskIndex, 1);
    } catch (err) {
      openConfirmModal('错误', '子任务删除失败：' + (err.msg || '服务器异常'), () => {});
      console.error('删除子任务失败：', err);
    }
  });
};

// 跳转到新目标页面
const navigateToNewPlan = () => {
  router.push('/pages/study_plan/newplan');
};
</script>


<style scoped>
/* 任务列表区域 */
.task-list {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 任务卡片 */
.task-card {
  background-color: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
}


/* 任务头部 */
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
.task-title-text {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
}
/* 任务名称+铅笔容器（保持两个空格距离） */
.task-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px; /* 等价于两个空格的距离 */
}
.task-title-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 通用编辑按钮（铅笔） */
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

/* 展开/收起箭头 */
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

/* 通用删除按钮（叉号） */
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

/* 子任务区域 */
.subtask-container {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 子任务项 */
.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: var(--active-bg);
  border-radius: 8px;
}

/* 子任务名称+铅笔 */
.subtask-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px; /* 两个空格距离 */
}
.subtask-text {
  font-size: 14px;
  color: var(--text-primary);
}

/* 子任务编辑/删除按钮尺寸调整 */
.subtask-edit-btn {
  font-size: 14px;
}
.subtask-delete-btn {
  font-size: 12px;
}

/* 添加子任务按钮 */
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
}
.add-subtask-btn:hover {
  background-color: var(--active-color);
  color: white;
}

/* 空任务提示 */
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* 新设目标按钮 */
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

/* 适配网页端 */
@media (min-width: 768px) {
  .new-plan-btn {
    right: calc(50% - 187px + 20px);
  }
}

/* 弹窗表单样式（基于全局弹窗样式扩展） */
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


</style>