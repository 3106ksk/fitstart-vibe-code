import { ArrowDownIcon, ArrowUpIcon, CalendarDaysIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

const WorkoutStatistics = ({ workouts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center animate-pulse">
              <div className="p-2 bg-gray-200 rounded-lg">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }



  // 今月のデータ（実際のAPIデータがない場合はモックデータから今月分を取得）
  const currentMonthWorkouts = workouts; // 全データを今月として扱う
  
  // 先月のモックデータ（実際の実装では過去データを取得）
  const lastMonthWorkouts = [
    { totalReps: 120, totalTime: 40 },
    { totalReps: 98, totalTime: 35 },
    { totalReps: 145, totalTime: 50 },
    { totalReps: 88, totalTime: 30 },
    { totalReps: 156, totalTime: 45 },
    { totalReps: 134, totalTime: 42 },
    { totalReps: 99, totalTime: 35 },
    { totalReps: 167, totalTime: 55 },
    { totalReps: 143, totalTime: 48 },
    { totalReps: 125, totalTime: 40 },
    { totalReps: 134, totalTime: 45 },
    { totalReps: 156, totalTime: 50 },
    { totalReps: 178, totalTime: 60 },
    { totalReps: 145, totalTime: 48 },
    { totalReps: 123, totalTime: 38 }
  ];

  // 今月の統計
  const currentTotalDays = currentMonthWorkouts.length;
  const currentTotalReps = currentMonthWorkouts.reduce((total, workout) => total + workout.totalReps, 0);
  const currentTotalTime = currentMonthWorkouts.reduce((total, workout) => total + workout.totalTime, 0);

  // 先月の統計
  const lastTotalDays = lastMonthWorkouts.length;
  const lastTotalReps = lastMonthWorkouts.reduce((total, workout) => total + workout.totalReps, 0);
  const lastTotalTime = lastMonthWorkouts.reduce((total, workout) => total + workout.totalTime, 0);

  // 増減率を計算
  const calculateChangeRate = (current, last) => {
    if (last === 0) {return current > 0 ? 100 : 0;}
    return Math.round(((current - last) / last) * 100);
  };

  const daysChangeRate = calculateChangeRate(currentTotalDays, lastTotalDays);
  const repsChangeRate = calculateChangeRate(currentTotalReps, lastTotalReps);
  const timeChangeRate = calculateChangeRate(currentTotalTime, lastTotalTime);

  // 変化率の表示用コンポーネント
  const ChangeIndicator = ({ changeRate, lastValue, unit }) => {
    const isPositive = changeRate >= 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const bgColorClass = isPositive ? 'bg-green-50' : 'bg-red-50';
    
    return (
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          先月 {lastValue}{unit}
        </span>
        <div className={`flex items-center px-2 py-1 rounded-full ${bgColorClass}`}>
          <Icon className={`h-3 w-3 mr-1 ${colorClass}`} />
          <span className={`font-medium ${colorClass}`}>
            {Math.abs(changeRate)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 総ワークアウト日数 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm text-gray-600">総ワークアウト日数</p>
            <p className="text-2xl font-semibold text-gray-900">{currentTotalDays}日</p>
            <ChangeIndicator 
              changeRate={daysChangeRate} 
              lastValue={lastTotalDays} 
              unit="日" 
            />
          </div>
        </div>
      </div>
      
      {/* 総回数 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <FireIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm text-gray-600">総回数</p>
            <p className="text-2xl font-semibold text-gray-900">{currentTotalReps}回</p>
            <ChangeIndicator 
              changeRate={repsChangeRate} 
              lastValue={lastTotalReps} 
              unit="回" 
            />
          </div>
        </div>
      </div>
      
      {/* 総時間 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ClockIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm text-gray-600">総時間</p>
            <p className="text-2xl font-semibold text-gray-900">{currentTotalTime}分</p>
            <ChangeIndicator 
              changeRate={timeChangeRate} 
              lastValue={lastTotalTime} 
              unit="分" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutStatistics; 