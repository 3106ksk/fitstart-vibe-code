import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolid,
  CheckIcon as CheckSolid,
  FireIcon as FireSolid,
  TrophyIcon as TrophySolid
} from '@heroicons/react/24/solid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/Hook';

const DashboadPage = () => {
  const { loading } = useAuth();
  const [lastWorkout, setLastWorkout] = useState(null);
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState('');

  // Mock data - replace with actual API calls
  const stats = {
    totalWorkouts: 24,
    weeklyWorkouts: 4,
    totalTime: 18.5, // hours
    streak: 7, // days
    caloriesBurned: 1250,
    lastMonthWorkouts: 15, // 先月のワークアウト数
    improvementRate: 60 // 今月の改善率
  };

  const recentWorkouts = [
    {
      id: 1,
      name: 'プッシュアップ + ランニング',
      date: '2024-01-15',
      duration: 45,
      exercises: ['プッシュアップ', 'ランニング'],
      details: {
        'プッシュアップ': { set1: 20, set2: 18, set3: 15 },
        'ランニング': { distance: 5.0, duration: 30 }
      }
    },
    {
      id: 2,
      name: 'スクワット + サイクリング',
      date: '2024-01-14',
      duration: 35,
      exercises: ['スクワット', 'サイクリング'],
      details: {
        'スクワット': { set1: 25, set2: 22, set3: 20 },
        'サイクリング': { distance: 10.0, duration: 25 }
      }
    },
    {
      id: 3,
      name: 'プッシュアップ + ウォーキング',
      date: '2024-01-13',
      duration: 30,
      exercises: ['プッシュアップ', 'ウォーキング'],
      details: {
        'プッシュアップ': { set1: 18, set2: 16, set3: 14 },
        'ウォーキング': { distance: 3.5, duration: 35 }
      }
    }
  ];

  // 最新のワークアウトを取得
  useEffect(() => {
    if (recentWorkouts.length > 0) {
      setLastWorkout(recentWorkouts[0]);
    }
  }, []);

  // 「今日もやった」ボタンの処理
  const handleQuickRepeat = async () => {
    if (!lastWorkout) {return;}

    setQuickActionLoading(true);
    setQuickActionMessage('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 最後のワークアウトの各種目を再送信
      for (const exercise of lastWorkout.exercises) {
        const exerciseData = lastWorkout.details[exercise];
        
        if (exerciseData.distance !== undefined) {
          // カーディオ系
          const submitData = {
            exercise,
            exerciseType: 'cardio',
            distance: exerciseData.distance,
            duration: exerciseData.duration,
            intensity: '中'
          };
          await axios.post("http://localhost:8000/workouts", submitData, config);
        } else {
          // 筋トレ系
                     const repsData = Object.entries(exerciseData)
             .filter(([key, value]) => key.startsWith('set') && value > 0)
             .map(([_key, value], index) => ({ id: String(index + 1), reps: value }));
          
          if (repsData.length > 0) {
            const submitData = {
              exercise,
              exerciseType: 'strength',
              setNumber: repsData.length,
              repsNumber: repsData,
              intensity: '中'
            };
            await axios.post("http://localhost:8000/workouts", submitData, config);
          }
        }
      }

      setQuickActionMessage('✅ 今日のワークアウトを記録しました！');
      setTimeout(() => setQuickActionMessage(''), 3000);
    } catch (error) {
      console.error('クイックリピートエラー:', error);
      setQuickActionMessage('❌ エラーが発生しました。再度お試しください。');
      setTimeout(() => setQuickActionMessage(''), 3000);
    } finally {
      setQuickActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">おかえりなさい！</h1>
          <p className="text-lg text-gray-600">継続は力なり。今日も頑張りましょう！</p>
        </div>

        {/* 継続のコツ */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              💪 継続のコツ
            </h2>
            <p className="text-green-700 leading-relaxed">
              小さな積み重ねが大きな変化を生みます。毎日少しずつでも続けることが大切です！
            </p>
          </div>
        </div>

        {/* クイックアクション */}
        {lastWorkout && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">前回と同じワークアウトをしますか？</h3>
                  <p className="text-white mb-3 opacity-90">
                    {lastWorkout.exercises.join(' + ')} ({lastWorkout.duration}分)
                  </p>
                  {quickActionMessage && (
                    <p className="text-white font-medium">{quickActionMessage}</p>
                  )}
                </div>
                <button
                  onClick={handleQuickRepeat}
                  disabled={quickActionLoading}
                  className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
                >
                  {quickActionLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckSolid className="h-5 w-5" />
                  )}
                  <span>{quickActionLoading ? '記録中...' : '今日もやった！'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card animate-slideInUp">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChartBarSolid className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ワークアウト</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalWorkouts}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    先月比 +{stats.improvementRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-slideInUp" style={{ animationDelay: '0.1s' }}>
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrophySolid className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">連続記録日数</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.streak}日</p>
                  <p className="text-xs text-green-600">素晴らしい継続力！</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FireSolid className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">今週のワークアウト</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.weeklyWorkouts}</p>
                  <p className="text-xs text-gray-500">回</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総運動時間</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTime}h</p>
                  <p className="text-xs text-gray-500">今月</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <div>
            <div className="card animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">最近のワークアウト</h3>
                  <Link
                    to="/workout-history"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    履歴を見る
                  </Link>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="border-l-4 border-primary-500 pl-4">
                      <h4 className="text-sm font-medium text-gray-900">{workout.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(workout.date).toLocaleDateString('ja-JP')}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{workout.duration}分</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChartBarIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{workout.exercises.length}種目</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="card animate-slideInUp" style={{ animationDelay: '0.5s' }}>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">クイックアクション</h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <Link
                    to="/"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>新しいワークアウトを記録</span>
                  </Link>
                  
                  <Link
                    to="/workout-history"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>履歴を確認</span>
                  </Link>

                  <Link
                    to="/workout-history/customize"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <FireIcon className="h-4 w-4" />
                    <span>トレーニングをカスタマイズ</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboadPage;