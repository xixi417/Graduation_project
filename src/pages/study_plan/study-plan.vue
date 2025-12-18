<template>
  <div class="goal-setting-page">
    <!-- 页面标题 -->
    <van-nav-bar title="设置学习目标" left-arrow @click-left="handleBack" />

    <!-- 目标基本信息 -->
    <van-card class="basic-info-card">
      <div slot="title">基本信息</div>
      <van-form @submit="handleSubmit">
        <!-- 目标名称 -->
        <van-field
          v-model="goalForm.name"
          label="目标名称"
          placeholder="例如：3个月掌握Vue3"
          required
        />

        <!-- 学习周期 -->
        <van-field label="学习周期">
          <template #input>
            <van-datetime-picker
              v-model="cycleValue"
              type="daterange"
              title="选择学习周期"
              @confirm="handleCycleConfirm"
            />
            <span class="cycle-text">{{ cycleText }}</span>
          </template>
        </van-field>

        <!-- 每日学习时长 -->
        <van-field label="每日学习时长">
          <template #input>
            <van-slider
              v-model="dailyDuration"
              min="0.5"
              max="8"
              step="0.5"
              @change="handleDurationChange"
            />
            <span class="duration-text">{{ dailyDuration }} 小时/天</span>
          </template>
        </van-field>

        <!-- 具体任务区域 -->
        <div class="task-section">
          <div class="section-title">
            <span>具体任务</span>
            <van-button size="mini" type="primary" @click="addNewTask">
              + 添加任务
            </van-button>
          </div>

          <!-- 自定义任务列表 -->
          <div class="custom-task-list">
            <task-item
              v-for="(task, index) in customTasks"
              :key="index"
              :task="task"
              @delete="deleteCustomTask(index)"
              @update="updateCustomTask(index, $event)"
            />
          </div>

          <!-- 系统推荐任务 -->
          <div v-if="recommendTasks.length" class="recommend-task-section">
            <div class="section-subtitle">系统推荐任务</div>
            <recommend-task
              v-for="(task, index) in recommendTasks"
              :key="index"
              :task="task"
              @select="selectRecommendTask(task)"
              @cancel="cancelRecommendTask(task)"
            />
          </div>

          <!-- 生成推荐任务按钮 -->
          <van-button
            v-if="!recommendTasks.length && customTasks.length"
            size="mini"
            type="default"
            @click="generateRecommendTasks"
            class="generate-btn"
          >
            生成系统推荐任务
          </van-button>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-btn-wrap">
          <van-button type="primary" native-type="submit" block>
            保存学习目标
          </van-button>
        </div>
      </van-form>
    </van-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import TaskItem from './components/TaskItem.vue';
import RecommendTask from './components/RecommendTask.vue';
import { useLearningStore } from '@/store/learning';
import { formatDateRange } from '@/utils/date';

// 状态管理
const learningStore = useLearningStore();

// 页面返回
const handleBack = () => {
  uni.navigateBack(); // 微信小程序返回API
};

// 目标表单数据
const goalForm = ref({
  name: '',
  cycleStart: '',
  cycleEnd: '',
  dailyDuration: 2, // 默认每日2小时
});

// 学习周期选择器值
const cycleValue = ref([]);
const cycleText = ref('请选择学习周期');

// 每日学习时长
const dailyDuration = ref(2);

// 自定义任务列表
const customTasks = ref([
  { content: '', duration: 1, isCompleted: false } // 默认空任务
]);

// 系统推荐任务
const recommendTasks = ref([]);

// 处理周期选择确认
const handleCycleConfirm = (value) => {
  const [start, end] = value;
  goalForm.value.cycleStart = start;
  goalForm.value.cycleEnd = end;
  cycleText.value = formatDateRange(start, end);
};

// 处理时长变化
const handleDurationChange = (value) => {
  dailyDuration.value = value;
  goalForm.value.dailyDuration = value;
};

// 添加新任务
const addNewTask = () => {
  customTasks.value.push({ content: '', duration: 1, isCompleted: false });
};

// 删除自定义任务
const deleteCustomTask = (index) => {
  if (customTasks.value.length <= 1) {
    showToast('至少保留一个任务');
    return;
  }
  customTasks.value.splice(index, 1);
};

// 更新自定义任务
const updateCustomTask = (index, task) => {
  customTasks.value[index] = task;
};

// 生成系统推荐任务（模拟后端逻辑）
const generateRecommendTasks = () => {
  // 模拟系统分析目标生成推荐任务
  const mockRecommendTasks = [
    { content: `掌握${goalForm.value.name.split(' ')[-1]}基础语法`, duration: 2, isSelected: false },
    { content: `完成${goalForm.value.name.split(' ')[-1]}实战案例`, duration: 3, isSelected: false },
    { content: `复盘${goalForm.value.name.split(' ')[-1]}知识点`, duration: 1, isSelected: false },
  ];
  recommendTasks.value = mockRecommendTasks;
  showToast('已生成推荐任务');
};

// 选择推荐任务
const selectRecommendTask = (task) => {
  task.isSelected = true;
  // 添加到自定义任务
  customTasks.value.push({
    content: task.content,
    duration: task.duration,
    isCompleted: false,
    isRecommend: true
  });
};

// 取消推荐任务选择
const cancelRecommendTask = (task) => {
  task.isSelected = false;
  // 从自定义任务中移除
  customTasks.value = customTasks.value.filter(
    item => !(item.content === task.content && item.isRecommend)
  );
};

// 提交表单
const handleSubmit = () => {
  // 表单验证
  if (!goalForm.value.name) {
    showToast('请输入目标名称');
    return;
  }
  if (!goalForm.value.cycleStart || !goalForm.value.cycleEnd) {
    showToast('请选择学习周期');
    return;
  }
  if (!customTasks.value.some(task => task.content.trim())) {
    showToast('请至少填写一个任务内容');
    return;
  }

  // 整理目标数据
  const goalData = {
    id: Date.now(), // 临时ID
    name: goalForm.value.name,
    cycle: {
      start: goalForm.value.cycleStart,
      end: goalForm.value.cycleEnd
    },
    dailyDuration: goalForm.value.dailyDuration,
    tasks: customTasks.value.filter(task => task.content.trim()),
    status: 'inProgress' // 进行中
  };

  // 保存到状态管理
  learningStore.addLearningGoal(goalData);
  
  showToast('目标保存成功');
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};

onMounted(() => {
  // 初始化：如果有编辑的目标，加载数据
  const editGoal = learningStore.currentEditGoal;
  if (editGoal) {
    goalForm.value = {
      name: editGoal.name,
      cycleStart: editGoal.cycle.start,
      cycleEnd: editGoal.cycle.end,
      dailyDuration: editGoal.dailyDuration
    };
    cycleValue.value = [editGoal.cycle.start, editGoal.cycle.end];
    cycleText.value = formatDateRange(editGoal.cycle.start, editGoal.cycle.end);
    dailyDuration.value = editGoal.dailyDuration;
    customTasks.value = editGoal.tasks;
  }
});
</script>

<style scoped>
.goal-setting-page {
  padding: 10px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.basic-info-card {
  background: #fff;
  border-radius: 8px;
}

.cycle-text, .duration-text {
  margin-left: 10px;
  color: #333;
}

.task-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.custom-task-list, .recommend-task-list {
  margin-bottom: 15px;
}

.generate-btn {
  margin-top: 10px;
}

.submit-btn-wrap {
  margin-top: 20px;
}
</style>