<template>
  <div class="daka-container">
    <!-- 顶部导航栏（PC/移动端适配） -->
    <header class="header">
      <!-- 左侧：返回主页按钮 -->
      <div class="header-left">
        <div class="back-home" @click="handleBackHome">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span class="back-text">返回主页</span>
        </div>
      </div>

     
      
    </header>

    <!-- 主体内容区域 -->
    <main class="main-content">
      <!-- PC端：核心打卡区 + 统计数据区 横向布局 -->
      <div class="pc-main-layout">
        <!-- 核心打卡区 -->
        <div class="daka-card">
          <h2 class="daka-title">今日打卡</h2>
          <p class="daka-date" :style="{ borderBottom: '2px solid #409eff' }">{{ todayDateText }}</p>
          <p class="daka-status" :style="{ color: isDakaed ? '#67C23A' : '#f56c6c' }">{{ isDakaed ? '已打卡' : '未打卡' }}</p>
          <button class="daka-btn" @click="handleDaka" :disabled="isDakaed">
            {{ isDakaed ? '今日已打卡' : '立即打卡' }}
          </button>
          <p class="daka-tip">每日可打卡 1 次，打卡时间 00:00-23:59</p>
        </div>

        <!-- 统计数据区（当月数据） -->
        <div class="stats-container">
          <div class="stats-card">
            <p class="stats-label">当月连续打卡</p>
            <p class="stats-value"><span>{{ continuousDays }}</span>天</p>
          </div>
          <div class="stats-card">
            <p class="stats-label">当月打卡次数</p>
            <p class="stats-value"><span>{{ totalTimes }}</span>次</p>
          </div>
          <div class="stats-card">
            <p class="stats-label">当月打卡率</p>
            <p class="stats-value"><span>{{ punchRate }}%</span></p>
          </div>
        </div>
      </div>

      <!-- 移动端：核心打卡区 + 统计数据区 垂直布局 -->
      <div class="mobile-main-layout">
        <!-- 移动端顶部标题（补充） -->
        <div class="mobile-title">
          
          <span class="mobile-daka-title">今日打卡</span>
        </div>

        <!-- 核心打卡区 -->
        <div class="daka-card mobile-daka-card">
          <p class="daka-date mobile-daka-date" :style="{ borderBottom: '2px solid #409eff' }">{{ todayDateText }}</p>
          <p class="daka-status mobile-daka-status" :style="{ color: isDakaed ? '#67C23A' : '#f56c6c' }">
            {{ isDakaed ? '已打卡' : '未打卡' }}
          </p>
          <button class="daka-btn mobile-daka-btn" @click="handleDaka" :disabled="isDakaed">
            {{ isDakaed ? '今日已打卡' : '立即打卡' }}
          </button>
          <p class="daka-tip mobile-daka-tip">每日可打卡 1 次，打卡时间 00:00-23:59</p>
        </div>

        <!-- 统计数据区（当月数据） -->
        <div class="stats-container mobile-stats-container">
          <div class="stats-card mobile-stats-card">
            <p class="stats-label">当月连续打卡</p>
            <p class="stats-value"><span>{{ continuousDays }}</span>天</p>
          </div>
          <div class="stats-card mobile-stats-card">
            <p class="stats-label">当月打卡次数</p>
            <p class="stats-value"><span>{{ totalTimes }}</span>次</p>
          </div>
          <div class="stats-card mobile-stats-card">
            <p class="stats-label">当月打卡率</p>
            <p class="stats-value"><span>{{ punchRate }}%</span></p>
          </div>
        </div>
      </div>

      <!-- 历史打卡记录（仅保留日历，移除历史列表） -->
      <div class="history-card">
        <div class="history-header">
          <h3 class="history-title">当月打卡日历</h3>
          <!-- 已移除“查看全部”和历史列表 -->
        </div>

        <!-- 日历视图（恢复正常显示） -->
        <div class="calendar">
          <div class="calendar-week">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>
          <div class="calendar-days">
            <span 
              v-for="(day, index) in calendarDays" 
              :key="index" 
              class="calendar-day"
              :class="{
                disabled: day.disabled,
                checked: day.checked || (day.date === todayDay && isDakaed),
                today: day.date === todayDay
              }"
            >
              {{ day.date }}
            </span>
          </div>
        </div>
      </div>
    </main>

 
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 核心常量定义
const STORAGE_KEY = 'monthlyDakaData'; // 本地缓存键名
const todayDate = ref(new Date()); // 今日日期对象

// 计算属性：今日日期文本
const todayDateText = computed(() => {
  const year = todayDate.value.getFullYear();
  const month = todayDate.value.getMonth() + 1;
  const day = todayDate.value.getDate();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[todayDate.value.getDay()];
  return `${year} 年 ${month} 月 ${day} 日 ${weekDay}`;
});

// 计算属性：今日日期（数字）
const todayDay = computed(() => todayDate.value.getDate());

// 计算属性：当月已过天数（截止今日）
const passedDaysOfMonth = computed(() => todayDate.value.getDate());

// 计算属性：当月总天数
const totalDaysOfMonth = computed(() => {
  return new Date(
    todayDate.value.getFullYear(),
    todayDate.value.getMonth() + 1,
    0
  ).getDate();
});

// 初始化数据（优先从本地缓存读取，移除historyRecords）
const initDakaData = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const currentMonthKey = `${todayDate.value.getFullYear()}-${String(todayDate.value.getMonth() + 1).padStart(2, '0')}`;

  if (storedData) {
    const parsedData = JSON.parse(storedData);
    // 仅当缓存为当月数据时使用，跨月则重置
    if (parsedData.monthKey === currentMonthKey) {
      return {
        isDakaed: parsedData.isDakaed,
        continuousDays: parsedData.continuousDays,
        totalTimes: parsedData.totalTimes,
        punchRate: parsedData.punchRate,
        checkedDays: new Set(parsedData.checkedDays) // 还原为Set类型
      };
    }
  }

  // 无有效缓存时初始化（默认18、19、20日已打卡）
  const defaultCheckedDays = new Set([18, 19, 20]);
  const defaultTotalTimes = defaultCheckedDays.size;
  const defaultPunchRate = Math.round((defaultTotalTimes / passedDaysOfMonth.value) * 100);
  
  return {
    isDakaed: defaultCheckedDays.has(todayDay.value), // 今日是否已打卡
    continuousDays: 3, // 默认当月连续3天
    totalTimes: defaultTotalTimes,
    punchRate: defaultPunchRate,
    checkedDays: defaultCheckedDays
  };
};

// 响应式数据（从缓存初始化，移除historyRecords）
const initData = initDakaData();
const isDakaed = ref(initData.isDakaed);
const continuousDays = ref(initData.continuousDays);
const totalTimes = ref(initData.totalTimes);
const punchRate = ref(initData.punchRate);
const checkedDays = ref(initData.checkedDays); // 当月已打卡日期集合
const calendarDays = ref([]);

// 生成当月日历（恢复正常渲染）
const generateCalendar = () => {
  const year = todayDate.value.getFullYear();
  const month = todayDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayWeek = firstDay.getDay();
  const lastDayDate = lastDay.getDate();

  const days = [];

  // 上月末尾补位
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const prevMonthDay = new Date(year, month, -i);
    days.push({
      date: prevMonthDay.getDate(),
      disabled: true,
      checked: false
    });
  }

  // 当月日期（判断是否已打卡）
  for (let i = 1; i <= lastDayDate; i++) {
    days.push({
      date: i,
      disabled: false,
      checked: checkedDays.value.has(i)
    });
  }

  // 下月开头补位
  const remainDays = 42 - days.length;
  for (let i = 1; i <= remainDays; i++) {
    days.push({
      date: i,
      disabled: true,
      checked: false
    });
  }

  calendarDays.value = days;
};

// 保存数据到本地缓存（移除historyRecords相关）
const saveDakaDataToStorage = () => {
  const currentMonthKey = `${todayDate.value.getFullYear()}-${String(todayDate.value.getMonth() + 1).padStart(2, '0')}`;
  const dakaData = {
    monthKey: currentMonthKey, // 标记所属月份
    isDakaed: isDakaed.value,
    continuousDays: continuousDays.value,
    totalTimes: totalTimes.value,
    punchRate: punchRate.value,
    checkedDays: Array.from(checkedDays.value) // Set对象转为数组存储
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dakaData));
};

// 返回主页事件
const handleBackHome = () => {
  router.push('/home').catch(err => {
    if (!err.message.includes('NavigationDuplicated')) {
      console.error('返回主页失败：', err);
    }
  });
};

// 打卡按钮点击事件（移除historyRecords更新）
const handleDaka = () => {
  if (isDakaed.value) {
    alert('今日已打卡，无需重复打卡～');
    return;
  }

  // 更新打卡状态
  alert('打卡成功！');
  isDakaed.value = true;

  // 更新当月统计数据
  continuousDays.value += 1;
  totalTimes.value += 1;
  // 重新计算当月打卡率：(当月打卡次数 / 当月已过天数) * 100 四舍五入
  punchRate.value = Math.round((totalTimes.value / passedDaysOfMonth.value) * 100);

  // 更新已打卡日期集合
  checkedDays.value.add(todayDay.value);

  // 更新日历
  generateCalendar();

  // 保存到本地缓存
  saveDakaDataToStorage();
};

// 页面挂载时初始化（确保日历正常生成）
onMounted(() => {
  generateCalendar();
  // 首次加载也保存一次缓存（确保数据持久化）
  saveDakaDataToStorage();
});
</script>

<style scoped>
/* 全局样式重置与基础配置 */
.daka-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

/* 顶部导航栏 */
.header {
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 左侧返回主页样式 */
.header-left .back-home {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.header-left .back-home:hover {
  color: #409eff;
}

.back-icon {
  width: 18px;
  height: 18px;
}

.back-text {
  font-size: 16px;
  font-weight: 500;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e9f2;
}

.nickname {
  font-size: 14px;
  color: #333;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #666;
  transition: transform 0.3s;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 120px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: none;
  flex-direction: column;
  z-index: 99;
}

.user-info:hover .dropdown-menu {
  display: flex;
}

.menu-item {
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f0f7ff;
  color: #409eff;
}

.mobile-exit {
  display: none;
  cursor: pointer;
}

.exit-icon {
  width: 24px;
  height: 24px;
  color: #666;
}

/* 主体内容 */
.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* PC端主布局（核心打卡区+统计区横向排列） */
.pc-main-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.mobile-main-layout {
  display: none;
}

/* 核心打卡区 */
.daka-card {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.daka-title {
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.daka-date {
  font-size: 14px;
  color: #666;
  padding-bottom: 10px;
  margin: 0 0 20px 0;
}

.daka-status {
  font-size: 18px;
  margin: 0 0 30px 0;
  font-weight: 500;
}

.daka-btn {
  width: 200px;
  height: 50px;
  background: linear-gradient(to right, #409eff, #3390e7);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
}

.daka-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.daka-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(64, 158, 255, 0.3);
}

.daka-tip {
  font-size: 12px;
  color: #999;
  margin: 20px 0 0 0;
}

/* 统计数据区 */
.stats-container {
  flex: 1;
  display: flex;
  gap: 15px;
  align-items: center;
}

.stats-card {
  flex: 1;
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stats-label {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.stats-value {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.stats-value span {
  font-size: 24px;
  color: #409eff;
  font-weight: 600;
  margin-right: 4px;
}

/* 历史打卡记录（仅保留日历） */
.history-card {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
  box-sizing: border-box;
  margin-top: 30px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-title {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

/* 日历视图（确保正常显示） */
.calendar {
  width: 100%;
}

.calendar-week {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calendar-week span {
  width: calc(100% / 7);
  text-align: center;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.calendar-days {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.calendar-day {
  width: calc((100% - 30px) / 7);
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.calendar-day.checked {
  background-color: #409eff;
  color: #fff;
  position: relative;
}

.calendar-day.checked::after {
  content: "✓";
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
}

.calendar-day.today {
  border: 2px solid #f56c6c;
  font-weight: 600;
}

.calendar-day:hover:not(.disabled):not(.checked):not(.today) {
  background-color: #f0f7ff;
}



/* 移动端适配（屏幕宽度 ≤ 768px） */
@media (max-width: 768px) {
  /* 隐藏PC端元素，显示移动端元素 */
  .pc-main-layout {
    
    display: none;
  }
  .daka-container {
    width: 100vw; /* 使用100vw */
    padding: 0;
    padding-bottom: 60px;
    /* 修正可能的滚动条偏移 */
    margin-left: calc(50% - 50vw); 
    left: 0;
    position: relative;
  }
  img, video, iframe {
    max-width: 120vw;
    height: auto;
  }

  .mobile-main-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
  }

  /* 顶部导航调整 */
  .header-right .user-info {
    display: none;
  }

  .mobile-exit {
    display: block;
  }

  /* 移动端标题 */
  .mobile-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
  }

  .mobile-nickname {
    font-size: 14px;
    color: #333;
  }

  .mobile-daka-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  /* 移动端核心打卡区 */
  .mobile-daka-card {
    padding: 20px 15px;
  }

  .mobile-daka-date {
    font-size: 13px;
  }

  .mobile-daka-status {
    font-size: 16px;
  }

  .mobile-daka-btn {
    width: 100%;
  }

  .mobile-daka-tip {
    font-size: 11px;
  }

  /* 移动端统计区 */
  .mobile-stats-container {
    gap: 10px;
  }

  .mobile-stats-card {
    padding: 15px 10px;
  }

  .stats-label {
    font-size: 12px;
  }

  .stats-value span {
    font-size: 20px;
  }

  /* 日历适配移动端 */
  .history-card {
    padding: 20px 15px;
    margin-top: 20px;
  }

  .calendar-day {
    height: 30px;
    font-size: 12px;
  }

  /* 显示底部版权 */
  .footer {
    display: block;
  }
}
</style>