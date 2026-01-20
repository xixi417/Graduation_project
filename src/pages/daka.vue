<template>
  <div class="daka-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="back-home" @click="handleBackHome">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span class="back-text">返回主页</span>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- PC端布局 -->
      <div class="pc-main-layout">
        <div class="daka-card">
          <h2 class="daka-title">今日打卡</h2>
          <p class="daka-date" :style="{ borderBottom: '2px solid #409eff' }">{{ todayDateText }}</p>
          <p class="daka-status" :style="{ color: isDakaed ? '#67C23A' : '#f56c6c' }">{{ isDakaed ? '已打卡' : '未打卡' }}</p>
          <button class="daka-btn" @click="handleDaka" :disabled="isDakaed">
            {{ isDakaed ? '今日已打卡' : '立即打卡' }}
          </button>
          <p class="daka-tip">每日可打卡 1 次，打卡时间 00:00-23:59</p>
        </div>

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

      <!-- 移动端布局 -->
      <div class="mobile-main-layout">
        <div class="mobile-title">
          <span class="mobile-daka-title">今日打卡</span>
        </div>

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

        <!-- 自定义打卡日历（替代ElCalendar） -->
        <div class="history-card">
          <div class="history-header">
            <h3 class="history-title">打卡日历</h3>
          </div>

          <!-- 自定义日历头部：年月选择器 + 切换按钮 -->
          <div class="calendar-header">
            <!-- 原生年月选择器 -->
            <div class="month-picker">
              <select v-model="selectedYear" @change="handleYearChange">
                <option v-for="year in yearOptions" :value="year" :key="year">{{ year }}年</option>
              </select>
              <select v-model="selectedMonthNum" @change="handleMonthChange">
                <option v-for="month in monthOptions" :value="month.value" :key="month.value">{{ month.label }}月</option>
              </select>
            </div>
            
            <!-- 自定义切换按钮 -->
            <div class="calendar-buttons">
              <button class="calendar-btn" @click="selectDate('prev-year')">上一年</button>
              <button class="calendar-btn" @click="selectDate('prev-month')">上月</button>
              <button class="calendar-btn" @click="selectDate('today')">今天</button>
              <button class="calendar-btn" @click="selectDate('next-month')">下月</button>
              <button class="calendar-btn" @click="selectDate('next-year')">下一年</button>
            </div>
          </div>

          <!-- 自定义日历主体 -->
          <div class="calendar-wrapper">
            <!-- 星期头部 -->
            <div class="calendar-week-header">
              <div class="week-day" v-for="day in weekDays" :key="day">{{ day }}</div>
            </div>
            <!-- 日期单元格 -->
            <div class="calendar-days">
              <!-- 补全月初空白 -->
              <div class="calendar-cell empty-cell" v-for="i in startWeekDay" :key="'empty-' + i"></div>
              <!-- 当月日期 -->
              <div 
                class="calendar-cell" 
                v-for="day in currentMonthDays" 
                :key="day"
                :class="{ 
                  'checked-cell': isDateChecked(`${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
                  'today-cell': isToday(day)
                }"
              >
                <span class="day-number">{{ day }}</span>
                <span v-if="isDateChecked(`${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`)" class="checked-mark">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 自定义消息提示框 -->
    <div class="message-toast" v-if="showToast" :class="toastType">
      {{ toastText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import  StorageUtil  from '.././components/StorageUtil';
const router = useRouter();

// 模拟接口
const getDaka = async (param) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const mockData = {
        "2024-05-01": { isDakaed: true },
        "2024-05-02": { isDakaed: true },
        "2024-05-03": { isDakaed: false },
        "2024-05-04": { isDakaed: true },
        "2024-05-05": { isDakaed: true },
      };
      resolve(mockData);
    }, 300);
  });
};
// 核心数据
const STORAGE_KEY = 'dailyDakaData';
const todayDate = ref(new Date());
const currentCalendarDate = ref(new Date());

// 自定义日历 - 年月选择器数据
const yearOptions = ref([]);
const monthOptions = ref([
  { label: '01', value: 1 },
  { label: '02', value: 2 },
  { label: '03', value: 3 },
  { label: '04', value: 4 },
  { label: '05', value: 5 },
  { label: '06', value: 6 },
  { label: '07', value: 7 },
  { label: '08', value: 8 },
  { label: '09', value: 9 },
  { label: '10', value: 10 },
  { label: '11', value: 11 },
  { label: '12', value: 12 },
]);
const selectedYear = ref(todayDate.value.getFullYear());
const selectedMonthNum = ref(todayDate.value.getMonth() + 1);
const weekDays = ref(['日', '一', '二', '三', '四', '五', '六']);

// 生成年份选项（前后5年）
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i);
  }
  yearOptions.value = years;
};

// 计算当月天数
const currentMonthDays = computed(() => {
  const days = new Date(selectedYear.value, selectedMonthNum.value, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
});

// 计算当月第一天是星期几（用于补全空白）
const startWeekDay = computed(() => {
  return new Date(selectedYear.value, selectedMonthNum.value - 1, 1).getDay();
});

// 今日日期文本（年月日+星期）
const todayDateText = computed(() => {
  const year = todayDate.value.getFullYear();
  const month = todayDate.value.getMonth() + 1;
  const day = todayDate.value.getDate();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[todayDate.value.getDay()];
  return `${year} 年 ${month} 月 ${day} 日 ${weekDay}`;
});

// 今日日期key（格式：YYYY-MM-DD）
const todayDateKey = computed(() => {
  const year = todayDate.value.getFullYear();
  const month = String(todayDate.value.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// 当月维度计算
const currentMonthKey = computed(() => {
  const year = todayDate.value.getFullYear();
  const month = String(todayDate.value.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
});
const passedDaysOfMonth = computed(() => todayDate.value.getDate());
const totalDaysOfMonth = computed(() => {
  return new Date(todayDate.value.getFullYear(), todayDate.value.getMonth() + 1, 0).getDate();
});

const getAllDakaData = async (targetMonth = '') => {
  let localData = StorageUtil.get(STORAGE_KEY, {});
  const userId = StorageUtil.get('user_userid');
  // console.log('用户ID:', localData);
  // console.log('本地打卡数据:', localStorage.getItem('user_userid'));

  if (Object.keys(localData).length === 0 || (targetMonth && !Object.keys(localData).some(key => key.startsWith(targetMonth)))) {
    const param = {
      userId,
      month: targetMonth || currentMonthKey.value
    };
    const apiData = await getDaka(param);
    localData = { ...localData, ...apiData };
    StorageUtil.set(STORAGE_KEY, localData);
  }
  return localData;
};

// 2. 拉取指定月份的打卡数据
const fetchMonthDakaData = async (month) => {
  if (!month) return;
  await getAllDakaData(month);
  updateMonthStats();
};

// 3. 筛选当月所有打卡日期
const getCurrentMonthCheckedDays = () => {
  const allDakaData = StorageUtil.get(STORAGE_KEY, {});
  const monthKey = currentMonthKey.value;
  const checkedDays = [];
  
  Object.keys(allDakaData).forEach(dateKey => {
    if (dateKey.startsWith(monthKey) && allDakaData[dateKey].isDakaed) {
      const day = Number(dateKey.split('-')[2]);
      checkedDays.push(day);
    }
  });
  return new Set(checkedDays);
};

// 4. 计算当月连续打卡天数
const calculateContinuousDays = () => {
  const checkedDays = getCurrentMonthCheckedDays();
  if (checkedDays.size === 0) return 0;

  const checkedDaysArr = Array.from(checkedDays).sort((a, b) => a - b);
  const todayDay = todayDate.value.getDate();
  let continuousDays = 1;

  if (checkedDays.has(todayDay)) {
    let currentDay = todayDay;
    for (let i = checkedDaysArr.indexOf(currentDay) - 1; i >= 0; i--) {
      if (checkedDaysArr[i] === currentDay - 1) {
        continuousDays++;
        currentDay = checkedDaysArr[i];
      } else {
        break;
      }
    }
  }else {
    let lastCheckedDay = 0;
    for (let i = checkedDaysArr.length - 1; i >= 0; i--) {
      if (checkedDaysArr[i] < todayDay) {
        lastCheckedDay = checkedDaysArr[i];
        break;
      }
    }
    if (lastCheckedDay === 0) return 0;
    let currentDay = lastCheckedDay;
    for (let i = checkedDaysArr.indexOf(lastCheckedDay) - 1; i >= 0; i--) {
      if (checkedDaysArr[i] === currentDay - 1) {
        continuousDays++;
        currentDay = checkedDaysArr[i];
      } else {
        break;
      }
    }
  }
  return continuousDays;
};

// 5. 更新当月统计数据
const updateMonthStats = () => {
  const allDakaData = StorageUtil.get(STORAGE_KEY, {});
  const isDakaedVal = allDakaData[todayDateKey.value]?.isDakaed || false;
  const checkedDays = getCurrentMonthCheckedDays();
  const totalTimesVal = checkedDays.size;
  const punchRateVal = Math.round((totalTimesVal / passedDaysOfMonth.value) * 100) || 0;
  const continuousDaysVal = calculateContinuousDays();

  isDakaed.value = isDakaedVal;
  continuousDays.value = continuousDaysVal;
  totalTimes.value = totalTimesVal;
  punchRate.value = punchRateVal;
};

// 6. 初始化打卡数据
const initDakaData = async () => {
  await getAllDakaData();
  updateMonthStats();
};

// 响应式数据
const isDakaed = ref(false);
const continuousDays = ref(0);
const totalTimes = ref(0);
const punchRate = ref(0);

// 7. 判断指定日期是否打卡
const isDateChecked = (dateStr) => {
  const allDakaData = StorageUtil.get(STORAGE_KEY, {});
  return allDakaData[dateStr]?.isDakaed || false;
};

// 8. 判断是否是今日（用于日历高亮）
const isToday = (day) => {
  const today = new Date();
  return (
    selectedYear.value === today.getFullYear() &&
    selectedMonthNum.value === today.getMonth() + 1 &&
    day === today.getDate()
  );
};

// 9. 保存打卡数据到本地
const saveDakaDataToStorage = () => {
  const allDakaData = StorageUtil.get(STORAGE_KEY, {});
  allDakaData[todayDateKey.value] = {
    isDakaed: isDakaed.value,
    date: todayDateKey.value
  };
  StorageUtil.set(STORAGE_KEY, allDakaData);
};

// 10. 年份选择器变化事件
const handleYearChange = () => {
  currentCalendarDate.value = new Date(selectedYear.value, selectedMonthNum.value - 1, 1);
  const newMonthKey = `${selectedYear.value}-${String(selectedMonthNum.value).padStart(2, '0')}`;
  fetchMonthDakaData(newMonthKey);
};

// 11. 月份选择器变化事件
const handleMonthChange = () => {
  currentCalendarDate.value = new Date(selectedYear.value, selectedMonthNum.value - 1, 1);
  const newMonthKey = `${selectedYear.value}-${String(selectedMonthNum.value).padStart(2, '0')}`;
  fetchMonthDakaData(newMonthKey);
};

// 12. 日历切换事件
const selectDate = async (type) => {
  const date = new Date(selectedYear.value, selectedMonthNum.value - 1, 1);
  switch (type) {
    case 'prev-year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case 'prev-month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'today':
      date.setTime(todayDate.value.getTime());
      break;
    case 'next-month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'next-year':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  currentCalendarDate.value = date;
  selectedYear.value = date.getFullYear();
  selectedMonthNum.value = date.getMonth() + 1;
  const newMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  await fetchMonthDakaData(newMonthKey);
};

// 13. 返回主页
const handleBackHome = () => {
  router.push('/home').catch(err => {
    if (!err.message.includes('NavigationDuplicated')) console.error('返回主页失败：', err);
  });
};

// 14. 自定义消息提示（替代ElMessage）
const showToast = ref(false);
const toastText = ref('');
const toastType = ref('success'); // success/info/error
let toastTimer = null;

const showMessage = (text, type = 'success', duration = 2000) => {
  toastText.value = text;
  toastType.value = type;
  showToast.value = true;
  
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
  }, duration);
};

// 15. 打卡事件
const handleDaka = async () => {
  if (isDakaed.value) {
    showMessage('今日已打卡，无需重复打卡～', 'info');
    return;
  }
 
  isDakaed.value = true;
  saveDakaDataToStorage();
  updateMonthStats();
  await getAllDakaData();
  showMessage('打卡成功！', 'success');
  
  
};

// 监听日历日期变化
watch(currentCalendarDate, (newVal) => {
  selectedYear.value = newVal.getFullYear();
  selectedMonthNum.value = newVal.getMonth() + 1;
}, { immediate: true });

// 监听月份变化
watch(currentMonthKey, () => {
  updateMonthStats();
}, { immediate: true });

// 初始化
onMounted(async () => {
  generateYearOptions();
  await initDakaData();
});

// 清理定时器
onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
/* 基础样式 */
.daka-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.header {
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}
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

.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* PC端布局 */
.pc-main-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.mobile-main-layout {
  display: none;
}

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
  transition: transform 0.3s;
}
.daka-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}
.daka-btn:hover:not(:disabled) {
  transform: scale(1.05);
}
.daka-tip {
  font-size: 12px;
  color: #999;
  margin: 20px 0 0 0;
}

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

/* 日历样式 */
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

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}
.month-picker {
  display: flex;
  gap: 8px;
}
.month-picker select {
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}
.calendar-buttons {
  display: flex;
  gap: 5px;
}
.calendar-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.calendar-btn:hover {
  background-color: #f0f7ff;
  color: #409eff;
  border-color: #409eff;
}

.calendar-wrapper {
  width: 100%;
}
.calendar-week-header {
  display: flex;
  background-color: #f5f7fa;
  border-radius: 4px 4px 0 0;
}
.week-day {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
.calendar-days {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 4px 4px;
}
.calendar-cell {
  width: calc(100% / 7);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}
.calendar-cell:nth-child(7n) {
  border-right: none;
}
.calendar-cell:last-child {
  border-bottom: none;
}
.empty-cell {
  background-color: #fafafa;
}
.checked-cell {
  background-color: #e6f7ff;
  color: #1890ff;
}
.today-cell {
  font-weight: bold;
  color: #409eff;
}
.day-number {
  font-size: 14px;
}
.checked-mark {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
  color: #409eff;
  font-weight: bold;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .pc-main-layout {
    display: none;
  }
  .mobile-main-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
  }
  .daka-container {
    width: 100vw;
    padding: 0;
    padding-bottom: 60px;
    margin-left: calc(50% - 50vw);
    left: 0;
    position: relative;
  }
  .mobile-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
  }
  .mobile-daka-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
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
  .history-card {
    padding: 20px 15px;
    margin-top: 20px;
  }
  .calendar-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .calendar-cell {
    height: 40px;
  }
  .checked-mark {
    bottom: 1px;
    right: 1px;
    font-size: 9px;
  }
}

/* 自定义消息提示样式 */
.message-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  z-index: 9999;
  opacity: 0.9;
  transition: all 0.3s;
}
.message-toast.success {
  background-color: #67C23A;
}
.message-toast.info {
  background-color: #909399;
}
.message-toast.error {
  background-color: #F56C6C;
}
</style>