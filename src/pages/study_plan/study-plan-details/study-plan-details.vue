<template>
  <div class="study-plan-details">
    <!-- 顶部导航栏 -->
    <header class="plan-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">← 返回</button>
        <h1 class="plan-title">
          <span class="title-text">{{ planName }}</span>
          <span class="status-tag running">{{ taskStatusMap[planStatus] }}</span>
        </h1>
      </div>
      <div class="header-right">
        <span class="total-target">总目标：{{ formattedTotalTargetTime }}</span>
      </div>
    </header>

    <!-- 上半部分：计划概览与核心控制 -->
    <section class="plan-core">
      <!-- 计时器：仅子任务显示 -->
      <div class="timer-wrapper" v-if="!mainTaskObj && subTaskObj">
        <div class="timer-container" @click="!isTimerRunning && startTimer()">
          <div class="timer-circle">
            <div class="timer-display" v-if="!isTimerRunning">
              <span>▶️</span> {{ totalSeconds > 0 ? '继续学习' : '开始学习' }}
            </div>
            <div class="timer-display" v-else>
              {{ formattedCurrentTime }}
            </div>
            <div class="timer-buttons" v-if="isTimerRunning">
              <button class="timer-btn pause-btn" @click.stop="pauseTimer()">
                ⏸️ 暂停
              </button>
              <button class="timer-btn stop-btn" @click.stop="stopAndSaveTimer()">
                ⏹️ 结束并保存
              </button>
            </div>
          </div>
        </div>
        <button class="quick-note-btn" @click="showNoteModal = true">
          📝 添加笔记
        </button>
      </div>

      <!-- 学习数据摘要：区分主任务/子任务 -->
      <div class="study-summary">
        <!-- 子任务：显示本次学习、今日累计、剩余目标（秒级精度） -->
        <template v-if="!mainTaskObj && subTaskObj">
          <div class="summary-item">
            <p class="summary-label">本次学习</p>
            <p class="summary-value">{{ formattedCurrentTime }}</p>
          </div>
          <div class="summary-item">
            <p class="summary-label">今日累计</p>
            <p class="summary-value">{{ formattedTodayAccumulatedTime }}</p>
          </div>
          <div class="summary-item">
            <p class="summary-label">剩余目标</p>
            <p class="summary-value">{{ formattedRemainingTime }}</p>
          </div>
        </template>

        <!-- 主任务：隐藏自身统计，只显示子任务汇总 -->
        <div class="main-task-summary-wrapper" v-if="mainTaskObj && !subTaskObj">
          <h3 class="main-summary-title">子任务汇总数据</h3>
          <div class="main-summary-content">
            <div class="summary-item main-summary-item">
              <p class="summary-label">子任务今日累计</p>
              <p class="summary-value">{{ formattedSubtasksToday }}</p>
            </div>
            <div class="summary-item main-summary-item">
              <p class="summary-label">子任务剩余目标</p>
              <p class="summary-value">{{ formattedSubtasksRemaining }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 下半部分：计划详情配置与管理 -->
    <section class="plan-details-tabs">
      <div class="tabs-header">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'time-arrange' }"
          @click="activeTab = 'time-arrange'"
          v-if="!mainTaskObj && subTaskObj"
        >
          📅 时间安排
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'task-breakdown' }"
          @click="activeTab = 'task-breakdown'"
        >
          🎯 任务分解
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'study-record' }"
          @click="activeTab = 'study-record'"
        >
          📊 学习记录与分析
        </button>
      </div>

      <div class="tabs-content">
        <div class="tab-panel" v-if="activeTab === 'time-arrange' && !mainTaskObj && subTaskObj">
          <div class="arrange-module">
            <h3 class="module-title">单次目标时长</h3>
            <div class="duration-buttons">
              <button 
                class="duration-btn" 
                :class="{ selected: singleTargetDuration === 25 * 60 }"
                @click="singleTargetDuration = 25 * 60"
              >
                25分钟
              </button>
              <button 
                class="duration-btn" 
                :class="{ selected: singleTargetDuration === 45 * 60 }"
                @click="singleTargetDuration = 45 * 60"
              >
                45分钟
              </button>
              <button 
                class="duration-btn" 
                :class="{ selected: singleTargetDuration === 60 * 60 }"
                @click="singleTargetDuration = 60 * 60"
              >
                60分钟
              </button>
              <button 
                class="duration-btn" 
                :class="{ selected: singleTargetDuration === 90 * 60 }"
                @click="singleTargetDuration = 90 * 60"
              >
                90分钟
              </button>
              <button class="duration-btn custom-btn" @click="showCustomDuration = true">
                自定义
              </button>
            </div>
          </div>
        </div>

        <div class="tab-panel" v-if="activeTab === 'task-breakdown'">
          <div class="task-list">
            <div class="task-item" v-for="(task, index) in taskList" :key="index" v-if="taskList && taskList.length >0 ">
              <input type="checkbox" v-model="task.completed" class="task-checkbox">
              <span class="task-name">{{ task.name }}</span>
              <span class="task-budget">(已学：{{ formatSecondsToHMS(task.accumulatedSeconds) }})</span>
            </div>
            <div class="empty-record" v-else>
              暂时没有子任务哦
            </div> 
          </div>
          
          <button class="add-task-btn" @click="addNewTask()" v-if="mainTaskObj && !subTaskObj">+ 添加子任务</button>
        </div>

        <div class="tab-panel" v-if="activeTab === 'study-record'">
          <div class="record-module">
            <h3 class="module-title">今日学习记录</h3>
            <div class="record-list" v-if="todayStudyRecords.length > 0">
              <div class="record-item" v-for="(record, index) in todayStudyRecords" :key="index">
                <span class="record-date">{{ record.createTime }}</span>
                <span class="record-duration">{{ formatSecondsToHMS(record.effectiveSeconds) }}</span>
                <span class="record-tasks">{{ record.completedTasks }}</span>
              </div>
            </div>
            <div class="empty-record" v-else>
              今日暂无学习记录，开始你的第一次学习吧！
            </div>
          </div>

          <div class="record-module">
            <h3 class="module-title">进度可视化</h3>
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${progressPercent}%`, backgroundColor: progressPercent >= 80 ? '#4caf50' : '#2196f3' }"
                ></div>
              </div>
              <span class="progress-text" v-if="!mainTaskObj && subTaskObj">
                {{ progressPercent }}% ({{ formatSecondsToHMS(totalAccumulatedSeconds) }}/{{ formattedTotalTargetTime }})
              </span>
              <span class="progress-text" v-if="mainTaskObj && !subTaskObj">
                {{ subtasksProgressPercent }}% ({{ formatSecondsToHMS(subtasksSummary.totalSubtasksTotalSeconds) }}/{{ formattedTotalTargetTime }})
              </span>
            </div>

            <div class="calendar-heatmap">
              <div class="heatmap-header">学习热图（近30天）</div>
              <div class="heatmap-days" v-if="totalStudyRecords.length > 0">
                <div 
                  class="heatmap-block" 
                  v-for="i in 30" 
                  :key="i"
                  :style="{ backgroundColor: getHeatmapColor(i) }"
                  @mouseover="showHeatmapTip = true; heatmapTipText = `2025-12-${i < 10 ? '0' + i : i}：${formatSecondsToHMS(Math.floor(Math.random() * 7200) + 3600)}`"
                  @mouseout="showHeatmapTip = false"
                ></div>
              </div>
              <div class="empty-heatmap" v-else>
                暂无学习数据，热图未生成
              </div>
              <div class="heatmap-tip" v-show="showHeatmapTip">{{ heatmapTipText }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 各类弹窗 -->
    <div class="modal-mask" v-if="showNoteModal" @click="showNoteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">添加学习笔记</h3>
        <textarea 
          class="note-input" 
          v-model="currentNote"
          placeholder="记录本次学习的想法、疑问或收获..."
        ></textarea>
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="showNoteModal = false">取消</button>
          <button class="modal-btn confirm-btn" @click="saveNote()">保存</button>
        </div>
      </div>
    </div>

    <div class="modal-mask" v-if="showCustomDuration" @click="showCustomDuration = false">
      <div class="modal-content custom-modal" @click.stop>
        <h3 class="modal-title">设置单次目标时长</h3>
        <input 
          type="number" 
          class="duration-input" 
          v-model="customDuration"
          min="1"
          max="180"
          placeholder="请输入1-180分钟"
        >
        <div class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="showCustomDuration = false">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmCustomDuration()">确认</button>
        </div>
      </div>
    </div>

    <div class="modal-mask" v-if="showCompleteModal" @click="handleCloseCompleteModal()">
      <div class="modal-content complete-modal" @click.stop :class="{ animate: showCompleteModal }">
        <div class="complete-icon">🎉</div>
        <h3 class="complete-title">恭喜完成今日学习！</h3>
        <p class="complete-desc">已达到单次目标时长 {{ formatSecondsToHMS(singleTargetDuration) }}，继续保持哦！</p>
        <button class="modal-btn confirm-btn" @click="handleCloseCompleteModal()">确认</button>
      </div>
    </div>

    <div class="smart-tip" v-if="showSmartTip" :style="{ transform: showSmartTip ? 'translateY(0)' : 'translateY(-100%)' }">
      {{ smartTipText }}
      <button class="tip-close-btn" @click="showSmartTip = false">×</button>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { sendDayStu } from './study-plan-details.js';
import { useRouter } from 'vue-router';
import { StorageUtil } from '../../../components/StorageUtil';

// 路由实例
const router = useRouter();

// 任务状态映射字典
const taskStatusMap = {
  'not_started': '未开始',
  'in_progress': '进行中',
  'completed': '已完成',
  'paused': '暂停中',
  'abandoned': '已放弃'
};

/**
 * 格式化秒数为 "X时X分X秒"
 * @param {number} seconds 总秒数
 * @returns {string} 格式化后的时间字符串
 */
const formatSecondsToHMS = (seconds) => {
  if (!seconds || seconds <= 0) return '0时0分0秒';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}时${m}分${s}秒`;
};

/**
 * 转换小时为秒数（兼容原有小时字段）
 * @param {number} hours 小时数
 * @returns {number} 总秒数
 */
const hoursToSeconds = (hours) => {
  return Math.floor(Number(hours) * 3600);
};

/**
 * 转换秒数为小时（保留2位小数，兼容原有接口）
 * @param {number} seconds 总秒数
 * @returns {number} 小时数
 */
const secondsToHours = (seconds) => {
  return parseFloat((seconds / 3600).toFixed(2));
};

/**
 * 获取计划名称和任务核心信息
 * 区分小程序/网页端存储，兼容主任务/子任务场景
 * @returns {Object} 包含计划名称、状态、主/子任务对象
 */
const getPlanInfo = () => {
  try {
    let planName = '';
    let subTaskObj = null;
    let mainTaskObj = null;
    let planStatus = '';
    
    // 小程序环境存储读取
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      subTaskObj = wx.getStorageSync('study_plan_currentSubTask');
      mainTaskObj = wx.getStorageSync('study_plan_currentTask');
      planName = subTaskObj?.planName || mainTaskObj?.planName || '';
      planStatus = subTaskObj?.status || mainTaskObj.status || '';
    } 
    // 网页端localStorage读取
    else {
      const subTaskStr = localStorage.getItem('study_plan_currentSubTask');
      const mainTaskStr = localStorage.getItem('study_plan_currentTask');
      
      if (subTaskStr) {
        try {
          subTaskObj = JSON.parse(subTaskStr);
          planName = subTaskObj?.planName || '';
          planStatus = subTaskObj?.status || '';
        } catch (parseError) {
          console.error('解析子任务JSON失败:', parseError);
        }
      }
      
      if (!planName && mainTaskStr) {
        try {
          mainTaskObj = JSON.parse(mainTaskStr);
          planName = mainTaskObj?.planName || '';
          planStatus = mainTaskObj?.status || '';
        } catch (parseError) {
          console.error('解析主任务JSON失败:', parseError);
        }
      }
    }

    return { planName, planStatus, subTaskObj, mainTaskObj };
    
  } catch (e) {
    console.error('获取计划基础信息失败:', e);
    return { planName: '', planStatus: '', subTaskObj: null, mainTaskObj: null };
  }
};

// 初始化计划基础信息
const { 
  planName: planNameRef, 
  planStatus: planStatusRef, 
  subTaskObj, 
  mainTaskObj 
} = getPlanInfo();
const planName = ref(planNameRef);
const planStatus = ref(planStatusRef);

/**
 * 获取今日日期键（标准化格式：yyyy-mm-dd）
 * @returns {string} 今日日期字符串
 */
const getTodayDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * 生成存储键（区分主/子任务）
 * @param {string} taskId 任务ID（主任务ID/子任务ID）
 * @param {boolean} isSubTask 是否为子任务
 * @param {string} parentTaskPreId 子任务关联的主任务PreId
 * @returns {Object} 今日/总数据存储键
 */
const getStorageKeys = (taskId, isSubTask = false, parentTaskPreId = '') => {
  const todayDate = getTodayDateKey();
  if (isSubTask && parentTaskPreId) {
    return {
      todayKey: `study_today_sub_${taskId}_pre_${parentTaskPreId}_${todayDate}`,
      totalKey: `study_total_sub_${taskId}_pre_${parentTaskPreId}`
    };
  }
  return {
    todayKey: `study_today_main_${taskId}_${todayDate}`,
    totalKey: `study_total_main_${taskId}`
  };
};

// 计划核心数据响应式定义（全部改为秒级）
const totalTargetSeconds = ref(hoursToSeconds(mainTaskObj?.targetHours || subTaskObj?.targetHours || 0)); // 总目标时长（秒）
const todayAccumulatedSeconds = ref(0); // 今日累计学习时长（秒）
const totalAccumulatedSeconds = ref(0); // 总累计学习时长（秒）

// 格式化总目标时间（X时X分X秒）
const formattedTotalTargetTime = computed(() => {
  return formatSecondsToHMS(totalTargetSeconds.value);
});

/**
 * 获取任务关联ID（核心关联字段语义化）
 * @returns {Object} 主任务ID、子任务ID、子任务关联的主任务PreId
 */
const getTaskRelationIds = () => {
  const mainTaskId = mainTaskObj?.id || mainTaskObj?.preId || null;
  const subTaskId = subTaskObj?.id || null;
  const subTaskRelateParentPreId = subTaskObj?.preId || null;
  return { mainTaskId, subTaskId, subTaskRelateParentPreId };
};

// 主任务子任务汇总数据（秒级）
const subtasksSummary = ref({
  totalSubtasksTodaySeconds: 0, // 所有子任务今日累计总和（秒）
  totalSubtasksTotalSeconds: 0, // 所有子任务总累计总和（秒）
  totalSubtasksRemainingSeconds: 0 // 所有子任务剩余目标总和（秒）
});

/**
 * 计算主任务关联的所有子任务数据总和（秒级）
 * @returns {Object} 子任务汇总数据
 */
const calculateSubtasksSummary = () => {
  if (!mainTaskObj || !Array.isArray(mainTaskObj.subtasks) || mainTaskObj.subtasks.length === 0) {
    return { 
      totalSubtasksTodaySeconds: 0, 
      totalSubtasksTotalSeconds: 0, 
      totalSubtasksRemainingSeconds: 0 
    };
  }

  let totalTodaySeconds = 0;
  let totalTotalSeconds = 0;
  let totalTargetSeconds = 0;
  const todayDate = getTodayDateKey();
  const mainTaskId = mainTaskObj?.id || mainTaskObj?.preId;

  mainTaskObj.subtasks.forEach(subtask => {
    const subtaskId = subtask.id;
    const subtaskPreId = subtask.preId || mainTaskId;
    
    // 1. 获取子任务今日数据（秒级）
    const { todayKey } = getStorageKeys(subtaskId, true, subtaskPreId);
    const subtaskTodayData = StorageUtil.get(todayKey, { todaySeconds: 0 });
    totalTodaySeconds += parseInt(subtaskTodayData.todaySeconds || 0);

    // 2. 获取子任务总数据（秒级）
    const { totalKey } = getStorageKeys(subtaskId, true, subtaskPreId);
    const subtaskTotalData = StorageUtil.get(totalKey, { totalSeconds: 0, targetSeconds: hoursToSeconds(subtask.targetHours) || 0 });
    totalTotalSeconds += parseInt(subtaskTotalData.totalSeconds || 0);
    totalTargetSeconds += parseInt(subtaskTotalData.targetSeconds || hoursToSeconds(subtask.targetHours) || 0);
  });

  // 3. 计算剩余目标（秒级）
  const finalTargetSeconds = hoursToSeconds(mainTaskObj?.targetHours) || totalTargetSeconds;
  const totalRemainingSeconds = Math.max(0, finalTargetSeconds - totalTotalSeconds);

  return {
    totalSubtasksTodaySeconds: totalTodaySeconds,
    totalSubtasksTotalSeconds: totalTotalSeconds,
    totalSubtasksRemainingSeconds: totalRemainingSeconds
  };
};

/**
 * 更新主任务子任务汇总数据（秒级）
 */
const updateSubtasksSummary = () => {
  if (mainTaskObj && !subTaskObj) {
    const summary = calculateSubtasksSummary();
    subtasksSummary.value = summary;
    todayAccumulatedSeconds.value = summary.totalSubtasksTodaySeconds;
    totalAccumulatedSeconds.value = summary.totalSubtasksTotalSeconds;
  }
};

// 时间格式化计算属性（秒级精度）
const formattedCurrentTime = computed(() => {
  return formatSecondsToHMS(totalSeconds.value);
});

// 子任务今日累计时长格式化（X时X分X秒）
const formattedTodayAccumulatedTime = computed(() => {
  return formatSecondsToHMS(todayAccumulatedSeconds.value);
});

// 子任务剩余目标时长格式化（X时X分X秒）
const formattedRemainingTime = computed(() => {
  const remainingSeconds = Math.max(0, totalTargetSeconds.value - totalAccumulatedSeconds.value);
  return formatSecondsToHMS(remainingSeconds);
});

// 主任务子任务今日累计时长格式化（X时X分X秒）
const formattedSubtasksToday = computed(() => {
  return formatSecondsToHMS(subtasksSummary.value.totalSubtasksTodaySeconds);
});

// 主任务子任务剩余目标时长格式化（X时X分X秒）
const formattedSubtasksRemaining = computed(() => {
  return formatSecondsToHMS(subtasksSummary.value.totalSubtasksRemainingSeconds);
});

// 进度百分比计算（秒级）
const progressPercent = computed(() => {
  if (mainTaskObj && !subTaskObj) {
    return subtasksProgressPercent.value;
  }
  if (totalTargetSeconds.value === 0) return 0;
  const percent = (totalAccumulatedSeconds.value / totalTargetSeconds.value) * 100;
  return percent > 100 ? 100 : percent.toFixed(2);
});

// 主任务子任务汇总进度百分比（秒级）
const subtasksProgressPercent = computed(() => {
  const targetSeconds = hoursToSeconds(mainTaskObj?.targetHours) || subtasksSummary.value.totalSubtasksTotalSeconds;
  if (targetSeconds === 0) return 0;
  const percent = (subtasksSummary.value.totalSubtasksTotalSeconds / targetSeconds) * 100;
  return percent > 100 ? 100 : percent.toFixed(2);
});

// 学习记录响应式定义
const todayStudyRecords = ref([]);
const totalStudyRecords = ref([]);

/**
 * 加载存储数据（秒级精度）
 */
const loadStorageData = () => {
  const { mainTaskId, subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();

  // 子任务场景：加载自身数据（秒级）
  if (subTaskId && !mainTaskObj && subTaskRelateParentPreId) {
    const { todayKey, totalKey } = getStorageKeys(subTaskId, true, subTaskRelateParentPreId);
    // 加载今日数据（优先读秒级，兼容原有小时字段）
    const todayStorageData = StorageUtil.get(todayKey, { todaySeconds: 0, todayHours: 0 });
    todayAccumulatedSeconds.value = parseInt(todayStorageData.todaySeconds) || hoursToSeconds(todayStorageData.todayHours);
    todayStudyRecords.value = todayStorageData.records || [];
    // 加载总数据（优先读秒级，兼容原有小时字段）
    const totalStorageData = StorageUtil.get(totalKey, { totalSeconds: 0, totalHours: 0, targetSeconds: 0, targetHours: 0 });
    totalAccumulatedSeconds.value = parseInt(totalStorageData.totalSeconds) || hoursToSeconds(totalStorageData.totalHours);
    totalTargetSeconds.value = parseInt(totalStorageData.targetSeconds) || hoursToSeconds(totalStorageData.targetHours || subTaskObj.targetHours || 0);
    totalStudyRecords.value = totalStorageData.records || [];
  } 
  // 主任务场景：加载所有关联子任务汇总数据
  else if (mainTaskId && mainTaskObj && !subTaskId) {
    updateSubtasksSummary();
  }

  // 加载计时器状态（仅子任务）
  if (subTaskId && !mainTaskObj && subTaskRelateParentPreId) {
    const timerStateKey = `timer_state_sub_${subTaskId}_pre_${subTaskRelateParentPreId}_${getTodayDateKey()}`;
    const timerState = StorageUtil.get(timerStateKey, null);
    if (timerState && !timerState.completed) {
      totalSeconds.value = parseInt(timerState.seconds || 0);
      isTimerRunning.value = timerState.isRunning;
      if (isTimerRunning.value) {
        startTimer(true);
      }
    }
  }
};

/**
 * 保存今日数据到存储（秒级）
 */
const saveTodayDataToStorage = () => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (!subTaskId || mainTaskObj || !subTaskRelateParentPreId) return;

  const { todayKey } = getStorageKeys(subTaskId, true, subTaskRelateParentPreId);
  const todayData = {
    todaySeconds: todayAccumulatedSeconds.value, // 秒级存储（核心）
    todayHours: secondsToHours(todayAccumulatedSeconds.value), // 兼容原有接口
    records: todayStudyRecords.value,
    preId: subTaskRelateParentPreId
  };
  StorageUtil.set(todayKey, todayData);
  updateSubtasksSummary();
};

/**
 * 保存总数据到存储（秒级）
 */
const saveTotalDataToStorage = () => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (!subTaskId || mainTaskObj || !subTaskRelateParentPreId) return;

  const { totalKey } = getStorageKeys(subTaskId, true, subTaskRelateParentPreId);
  const totalData = {
    totalSeconds: totalAccumulatedSeconds.value, // 秒级存储（核心）
    totalHours: secondsToHours(totalAccumulatedSeconds.value), // 兼容原有接口
    targetSeconds: totalTargetSeconds.value, // 秒级目标
    targetHours: secondsToHours(totalTargetSeconds.value), // 兼容原有接口
    records: totalStudyRecords.value,
    preId: subTaskRelateParentPreId
  };
  StorageUtil.set(totalKey, totalData);
  updateSubtasksSummary();
};

/**
 * 保存计时器状态（秒级）
 */
const saveTimerState = () => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (!subTaskId || mainTaskObj || !subTaskRelateParentPreId) return;

  const timerStateKey = `timer_state_sub_${subTaskId}_pre_${subTaskRelateParentPreId}_${getTodayDateKey()}`;
  const timerState = {
    seconds: totalSeconds.value,
    isRunning: isTimerRunning.value,
    completed: false,
    timestamp: new Date().getTime(),
    preId: subTaskRelateParentPreId
  };
  StorageUtil.set(timerStateKey, timerState);
};

// 计时器核心响应式定义（秒级）
const isTimerRunning = ref(false);
const totalSeconds = ref(0);
let timerInterval = null;
const hasShownCompleteModal = ref(false);

// 单次目标时长（秒级，默认45分钟=2700秒）
const singleTargetDuration = ref(45 * 60);
const showCustomDuration = ref(false);
const customDuration = ref('');

/**
 * 启动计时器（秒级）
 * @param {boolean} resume 是否为恢复计时
 */
const startTimer = (resume = false) => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (isTimerRunning.value || mainTaskObj || !subTaskId || !subTaskRelateParentPreId) return;

  if (!resume) {
    currentSession.value = {
      ...currentSession.value,
      startTime: new Date().toISOString(),
      status: 'active',
      lastActivityTime: new Date().toISOString()
    };
  }

  isTimerRunning.value = true;
  hasShownCompleteModal.value = false;
  
  timerInterval = setInterval(() => {
    totalSeconds.value++;
    saveTimerState();
    
    // 检测是否达到单次目标时长（秒级）
    if (totalSeconds.value >= singleTargetDuration.value && !hasShownCompleteModal.value) {
      hasShownCompleteModal.value = true;
      showCompleteModal.value = true;
      setTimeout(() => {
        stopAndSaveTimer();
      }, 1500);
    }
  }, 1000); // 每秒更新一次

  if (!resume) {
    showSmartTip.value = true;
    smartTipText.value = '计时已开始，专注当下，高效学习吧！';
    setTimeout(() => {
      showSmartTip.value = false;
    }, 3000);
  }
};

/**
 * 暂停计时器
 */
const pauseTimer = () => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (!isTimerRunning.value || mainTaskObj || !subTaskId || !subTaskRelateParentPreId) return;

  currentSession.value.status = 'paused';
  currentSession.value.lastActivityTime = new Date().toISOString();

  isTimerRunning.value = false;
  clearInterval(timerInterval);
  saveTimerState();
  
  showSmartTip.value = true;
  smartTipText.value = '计时已暂停，记得继续完成学习计划哦！';
  setTimeout(() => {
    showSmartTip.value = false;
  }, 3000);
};

// 当前会话信息
const currentSession = ref({
  startTime: '',
  status: '',
  lastActivityTime: ''
});

/**
 * 停止并保存计时器数据（秒级精度）
 */
const stopAndSaveTimer = async () => {
  const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if ((!isTimerRunning.value && !hasShownCompleteModal.value) || mainTaskObj || !subTaskId || !subTaskRelateParentPreId) return;

  clearInterval(timerInterval);
  const timerStateKey = `timer_state_sub_${subTaskId}_pre_${subTaskRelateParentPreId}_${getTodayDateKey()}`;
  StorageUtil.remove(timerStateKey);
  
  // 计算秒级学习数据
  const currentSeconds = totalSeconds.value; // 本次学习总秒数（精确到秒）
  const currentHours = secondsToHours(currentSeconds); // 兼容原有小时字段
  
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - currentSeconds * 1000);
  const isoStartTime = startTime.toISOString();
  const isoEndTime = endTime.toISOString();

  // 更新累计时长（秒级）
  todayAccumulatedSeconds.value += currentSeconds;
  totalAccumulatedSeconds.value += currentSeconds;

  // 构造会话记录（秒级）
  const sessionRecord = {
    user_id: StorageUtil.get('user_userid'),
    plan_id: subTaskObj?.planId || mainTaskObj?.planId || `plan_001`, 
    sub_task_id: subTaskId,
    main_task_preId: subTaskRelateParentPreId,
    session_status: 'completed',
    start_time: isoStartTime,
    last_activity_time: isoEndTime,
    end_time: isoEndTime,
    effective_seconds: currentSeconds, // 秒级有效时长
    effective_minutes: Math.floor(currentSeconds / 60), 
    total_duration_seconds: currentSeconds, // 秒级总时长
    total_duration_minutes: Math.floor(currentSeconds / 60), 
    auto_completed: hasShownCompleteModal.value,
    createTime: endTime.toLocaleTimeString(),
    duration: formatSecondsToHMS(currentSeconds), // 格式化显示为X时X分X秒
    completedTasks: taskList.value?.filter(t => t.completed).map(t => t.name.split(' ')[0]).join('、') || '无'
  };

  // 更新本地记录列表
  todayStudyRecords.value.unshift(sessionRecord);
  totalStudyRecords.value.unshift(sessionRecord);

  // 保存数据到存储
  saveTodayDataToStorage();
  saveTotalDataToStorage();

  /**
   * 判断任务状态（完成/进行中）
   * @returns {string} 任务状态：completed/in_progress
   */
  const getTaskStatus = () => {
    return formattedRemainingTime.value === '0时0分0秒' ? 'completed' : 'in_progress';
  };

  // 构造接口上报数据（秒级+兼容原有字段）
  const dayStuData = {
    userId: sessionRecord.user_id,
    planId: sessionRecord.plan_id,
    mainTaskPreId: subTaskRelateParentPreId,
    subTaskId: subTaskId,
    todayDate: getTodayDateKey(),
    todayTotalHours: secondsToHours(todayAccumulatedSeconds.value),
    todayTotalSeconds: todayAccumulatedSeconds.value, 
    todayTotalMinutes: Math.round(todayAccumulatedSeconds.value / 60),
    sessions: todayStudyRecords.value,
    updateTime: isoEndTime,
    status: getTaskStatus()
  };

  // 上报接口
  try {
    const result = await sendDayStu(dayStuData);
    console.log('发送子任务学习数据接口参数：', dayStuData);
    if (result && result.code === 200) {
      console.log('子任务学习数据发送成功：', result);
    } else {
      console.error('子任务学习数据发送失败：', result?.msg || '接口返回异常');
      const retryQueue = StorageUtil.get('study_retry_queue', []);
      retryQueue.push({ data: dayStuData, timestamp: Date.now() });
      StorageUtil.set('study_retry_queue', retryQueue);
    }
  } catch (error) {
    console.error('接口请求异常：', error);
    const retryQueue = StorageUtil.get('study_retry_queue', []);
    retryQueue.push({ data: dayStuData, timestamp: Date.now() });
    StorageUtil.set('study_retry_queue', retryQueue);
  }

  // 重置计时器状态
  isTimerRunning.value = false;
  totalSeconds.value = 0;
  hasShownCompleteModal.value = false;
  showCompleteModal.value = false;

  // 完成提示
  showSmartTip.value = true;
  smartTipText.value = `本次学习时长：${formatSecondsToHMS(currentSeconds)}，今日累计：${formattedTodayAccumulatedTime.value}，已保存并同步！`;
  setTimeout(() => {
    showSmartTip.value = false;
  }, 3000);
};

// 其他功能响应式定义
const showSettingsMenu = ref(false);
const settingsRef = ref(null);

// 页面挂载/卸载生命周期
onMounted(() => {
  loadStorageData();
  updateTaskList();

  const handleClickOutside = (e) => {
    if (settingsRef.value && !settingsRef.value.contains(e.target)) {
      showSettingsMenu.value = false;
    }
  };
  document.addEventListener('click', handleClickOutside);

  const handleBeforeUnload = () => {
    const { subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
    if (isTimerRunning.value && subTaskId && !mainTaskObj && subTaskRelateParentPreId) {
      saveTimerState();
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    clearInterval(timerInterval);
  };
});

/**
 * 返回上一页
 */
const handleBack = () => {
  if (StorageUtil.isMiniProgram()) {
    wx.navigateBack({ delta: 1 });
  } else {
    router.push('../study-plan/study-plan');  
  }
};

/**
 * 生成学习报告
 */
const handleGenerateReport = () => {
  showSettingsMenu.value = false;
  alert('学习报告已生成');
};

/**
 * 删除计划/任务
 */
const handleDeletePlan = () => {
  showSettingsMenu.value = false;
  const { mainTaskId, subTaskId, subTaskRelateParentPreId } = getTaskRelationIds();
  if (!mainTaskId && !subTaskId) return;

  if (confirm('确定要删除该计划/任务吗？删除后数据将无法恢复！')) {
    if (subTaskId && !mainTaskObj && subTaskRelateParentPreId) {
      const { todayKey, totalKey } = getStorageKeys(subTaskId, true, subTaskRelateParentPreId);
      const timerStateKey = `timer_state_sub_${subTaskId}_pre_${subTaskRelateParentPreId}_${getTodayDateKey()}`;
      StorageUtil.remove(todayKey);
      StorageUtil.remove(totalKey);
      StorageUtil.remove(timerStateKey);
    } else if (mainTaskId && mainTaskObj && !subTaskId) {
      const { todayKey: mainTodayKey, totalKey: mainTotalKey } = getStorageKeys(mainTaskId);
      StorageUtil.remove(mainTodayKey);
      StorageUtil.remove(mainTotalKey);

      if (Array.isArray(mainTaskObj.subtasks)) {
        mainTaskObj.subtasks.forEach(subtask => {
          const subtaskId = subtask.id;
          const subtaskPreId = subtask.preId || mainTaskId;
          const { todayKey, totalKey } = getStorageKeys(subtaskId, true, subtaskPreId);
          const timerStateKey = `timer_state_sub_${subtaskId}_pre_${subtaskPreId}_${getTodayDateKey()}`;
          StorageUtil.remove(todayKey);
          StorageUtil.remove(totalKey);
          StorageUtil.remove(timerStateKey);
        });
      }
    }
    
    alert('计划/任务已删除');
    handleBack();
  }
};

// 标签页相关
const activeTab = ref('time-arrange');

/**
 * 确认自定义单次目标时长（转换为秒级）
 */
const confirmCustomDuration = () => {
  const durationMinutes = parseInt(customDuration.value);
  if (durationMinutes && durationMinutes >= 1 && durationMinutes <= 180) {
    singleTargetDuration.value = durationMinutes * 60; // 转换为秒
    showCustomDuration.value = false;
    customDuration.value = '';
    hasShownCompleteModal.value = false;
  } else {
    alert('请输入1-180之间的有效数字！');
  }
};

// 任务列表响应式定义
const taskList = ref([]);

/**
 * 更新任务列表（秒级）
 */
const updateTaskList = () => {
  const { mainTaskId } = getTaskRelationIds();
  if (mainTaskObj && !subTaskObj && mainTaskId) {
    taskList.value = mainTaskObj.subtasks?.map(subtask => ({
      id: subtask.id,
      name: subtask.planName || subtask.name,
      completed: subtask.completed || false,
      accumulatedSeconds: getSubtaskAccumulatedSeconds(subtask.id, subtask.preId || mainTaskId), // 秒级
      accumulatedHours: secondsToHours(getSubtaskAccumulatedSeconds(subtask.id, subtask.preId || mainTaskId)), // 兼容
      targetSeconds: hoursToSeconds(subtask.targetHours) || 0,
      preId: subtask.preId || mainTaskId
    })) || [];
  } else if (subTaskObj && !mainTaskObj) {
    taskList.value = [{
      id: subTaskObj.id,
      name: subTaskObj.planName,
      completed: subTaskObj.completed || false,
      accumulatedSeconds: totalAccumulatedSeconds.value,
      accumulatedHours: secondsToHours(totalAccumulatedSeconds.value),
      targetSeconds: totalTargetSeconds.value,
      preId: subTaskObj.preId
    }];
  } else {
    taskList.value = [];
  }
};

/**
 * 获取单个子任务的累计时长（秒级）
 * @param {string} subTaskId 子任务ID
 * @param {string} parentTaskPreId 关联主任务PreId
 * @returns {number} 累计秒数
 */
const getSubtaskAccumulatedSeconds = (subTaskId, parentTaskPreId) => {
  const { totalKey } = getStorageKeys(subTaskId, true, parentTaskPreId);
  const totalStorageData = StorageUtil.get(totalKey, { totalSeconds: 0, totalHours: 0 });
  return parseInt(totalStorageData.totalSeconds) || hoursToSeconds(totalStorageData.totalHours);
};

/**
 * 添加新子任务
 */
const addNewTask = () => {
  const { mainTaskId } = getTaskRelationIds();
  if (!mainTaskObj || !mainTaskId) return;

  const newTask = {
    id: `subtask_${Date.now()}`,
    name: '新子任务',
    planName: mainTaskObj.planName,
    completed: false,
    accumulatedSeconds: 0,
    accumulatedHours: 0,
    targetSeconds: 0,
    targetHours: 0,
    preId: mainTaskId,
  };

  if (!Array.isArray(mainTaskObj.subtasks)) {
    mainTaskObj.subtasks = [];
  }
  mainTaskObj.subtasks.push(newTask);
  taskList.value.push(newTask);

  if (StorageUtil.isMiniProgram()) {
    wx.setStorageSync('study_plan_currentTask', JSON.stringify(mainTaskObj));
  } else {
    localStorage.setItem('study_plan_currentTask', JSON.stringify(mainTaskObj));
  }
};

// 热图相关
const showHeatmapTip = ref(false);
const heatmapTipText = ref('');

/**
 * 获取热图色块颜色
 * @param {number} index 天数索引
 * @returns {string} 颜色值
 */
const getHeatmapColor = (index) => {
  const random = Math.random();
  if (random < 0.3) return '#e8f5e9';
  if (random < 0.6) return '#a5d6a7';
  if (random < 0.9) return '#66bb6a';
  return '#2e7d32';
};

// 笔记相关
const showNoteModal = ref(false);
const currentNote = ref('');

/**
 * 保存学习笔记
 */
const saveNote = () => {
  if (!currentNote.value.trim()) {
    alert('请输入笔记内容！');
    return;
  }
  alert(`笔记已保存：${currentNote.value}`);
  showNoteModal.value = false;
  currentNote.value = '';
};

// 智能提示相关
const showSmartTip = ref(false);
const smartTipText = ref('');

// 完成弹窗相关
const showCompleteModal = ref(false);

/**
 * 关闭完成弹窗
 */
const handleCloseCompleteModal = () => {
  showCompleteModal.value = false;
};
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', '微软雅黑', sans-serif;
}

.study-plan-details {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  color: #1a1a1a;
  overflow-x: hidden;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 80px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0; 
  flex: 1; 
  margin-right: 20px;
}

.back-btn {
  padding: 2px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: transparent;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.back-btn:hover {
  border-color: #2196f3;
  color: #2196f3;
  background-color: #f5f9ff;
}

.plan-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}



.status-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.status-tag.running {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.total-target {
  font-size: 16px;
  color: #666666;
  margin-right: 20px;
}

.plan-settings {
  position: relative;
  display: inline-block;
}

.settings-btn {
  font-size: 20px;
  border: none;
  background: transparent;
  color: #666666;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.settings-btn:hover {
  background-color: #f0f0f0;
}

.settings-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 180px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 100;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.danger {
  color: #f44336;
}

.plan-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  position: relative;
}

.timer-wrapper {
  position: relative;
  margin-bottom: 30px;
}

.timer-container {
  cursor: pointer;
}

.timer-circle {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 2px solid #2196f3;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
  transition: transform 0.2s;
}

.timer-circle:hover {
  transform: scale(1.02);
}

.timer-display {
  font-size: 24px;
  color: #2196f3;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.timer-display span {
  font-size: 28px;
}

.timer-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.timer-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pause-btn {
  background-color: #fff3e0;
  color: #ef6c00;
}

.pause-btn:hover {
  background-color: #ffe0b2;
}

.stop-btn {
  background-color: #ffebee;
  color: #f44336;
}

.stop-btn:hover {
  background-color: #ffcdd2;
}

.quick-note-btn {
  position: absolute;
  top: -20px;
  right: -120px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: #e3f2fd;
  color: #2196f3;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
  transition: background-color 0.3s;
  white-space: nowrap;
}

.quick-note-btn:hover {
  background-color: #bbdefb;
}

.study-summary {
  display: flex;
  gap: 60px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 500;
}

/* 主任务汇总样式 */
.main-task-summary-wrapper {
  width: 100%;
  max-width: 500px;
  background-color: #f8f9ff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 15px rgba(33, 150, 243, 0.08);
  margin-top: 20px;
}

.main-summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #2196f3;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e3f2fd;
}

.main-summary-content {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
}

.main-summary-item {
  flex: 1;
}

.main-summary-item .summary-label {
  font-size: 15px;
  color: #424242;
}

.main-summary-item .summary-value {
  font-size: 22px;
  color: #2196f3;
  font-weight: 600;
}

.plan-details-tabs {
  width: 90%;
  margin: 0 auto;
  padding-bottom: 60px;
}

.tabs-header {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #666666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #2196f3;
  border-bottom: 2px solid #2196f3;
}

.tab-btn:hover {
  color: #2196f3;
  background-color: #f5f9ff;
}

.tabs-content {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.module-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #2196f3;
  display: inline-block;
}

.arrange-module {
  margin-bottom: 40px;
}

.duration-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.duration-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.duration-btn.selected {
  background-color: #2196f3;
  color: #ffffff;
  border-color: #2196f3;
}

.duration-btn:hover:not(.selected) {
  border-color: #2196f3;
  color: #2196f3;
}

.custom-btn {
  color: #2196f3;
  border-color: #2196f3;
}

.task-list {
  margin-bottom: 24px;
}

.task-item {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #2196f3;
  cursor: pointer;
}

.task-name {
  font-size: 16px;
  color: #1a1a1a;
  flex: 1;
}

.task-budget {
  font-size: 14px;
  color: #666666;
}

.add-task-btn {
  padding: 8px 16px;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background-color: transparent;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-task-btn:hover {
  border-color: #2196f3;
  color: #2196f3;
  background-color: #f5f9ff;
}

.record-list {
  margin-bottom: 24px;
}

.record-item {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333333;
}

.empty-record, .empty-heatmap {
  text-align: center;
  padding: 20px 0;
  color: #666666;
  font-size: 14px;
  background-color: #fafafa;
  border-radius: 8px;
}

.progress-container {
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.progress-text {
  font-size: 14px;
  color: #666666;
}

.calendar-heatmap {
  margin-top: 24px;
}

.heatmap-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.heatmap-days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.heatmap-block {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
}

.heatmap-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #666666;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.custom-modal {
  max-width: 300px;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.note-input {
  width: 100%;
  height: 150px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  margin-bottom: 16px;
}

.duration-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666666;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.confirm-btn {
  background-color: #2196f3;
  color: #ffffff;
}

.confirm-btn:hover {
  background-color: #1976d2;
}

.complete-modal {
  max-width: 400px;
  text-align: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease-in-out;
}

.complete-modal.animate {
  opacity: 1;
  transform: scale(1);
}

.complete-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.complete-title {
  font-size: 24px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 8px;
}

.complete-desc {
  font-size: 14px;
  color: #666666;
  margin-bottom: 24px;
}

.smart-tip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px 24px;
  text-align: center;
  font-size: 14px;
  z-index: 2000;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.tip-close-btn {
  background: transparent;
  border: none;
  color: #2e7d32;
  font-size: 16px;
  cursor: pointer;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .plan-header {
    padding: 0;
    height: 70px;
    width: 100%;
  }

  .header-left {
    gap: 12px;
  }

  .back-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .plan-title {
    font-size: 18px;
  }

  .total-target {
    font-size: 12px;
    margin-right: 10px;
    white-space: nowrap;
  }

  .timer-circle {
    width: 200px;
    height: 200px;
  }

  .quick-note-btn {
    top: -15px;
    right: -50px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .study-summary {
    gap: 20px;
  }

  .summary-item {
    width: 30%;
  }

  .summary-value {
    font-size: 16px;
  }

  /* 主任务汇总响应式 */
  .main-task-summary-wrapper {
    width: 90%;
    padding: 16px;
  }

  .main-summary-content {
    gap: 20px;
  }

  .plan-details-tabs {
    width: 95%;
  }

  .tabs-header {
    flex-wrap: wrap;
    gap: 0;
  }

  .tab-btn {
    padding: 8px 12px;
    font-size: 14px;
    flex: 1;
    text-align: center;
  }
}
</style>