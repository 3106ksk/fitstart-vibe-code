import { CogIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkoutHistoryTable from '../components/WorkoutHistoryTable';
import WorkoutStatistics from '../components/WorkoutStatistics';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutHistory = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // カスタムフックからワークアウト設定を取得
  const { workoutConfig, isCardioExercise } = useWorkoutConfig();

  // APIレスポンスを履歴表示用の形式に変換
  const transformWorkoutData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // 日付でグループ化
    const groupedByDate = apiData.reduce((acc, workout) => {
      const dateKey = new Date(workout.date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric'
      });
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          exercises: {},
          totalReps: 0,
          totalTime: 0
        };
      }

      if (workout.exerciseType === 'cardio') {
        acc[dateKey].exercises[workout.exercise] = {
          distance: workout.distance,
          duration: workout.duration
        };
        acc[dateKey].totalTime += workout.duration || 0;
      } else if (workout.exerciseType === 'strength') {
        const exerciseData = {};
        if (workout.repsDetail && Array.isArray(workout.repsDetail)) {
          workout.repsDetail.forEach((set, index) => {
            exerciseData[`set${index + 1}`] = set.reps;
          });
        }
        acc[dateKey].exercises[workout.exercise] = exerciseData;
        acc[dateKey].totalReps += workout.reps || 0;
      }

      return acc;
    }, {});

    return Object.values(groupedByDate);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/workouts', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });
        const transformedData = transformWorkoutData(response.data);
        setWorkouts(transformedData);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('ワークアウト履歴の取得がキャンセルされました');
          return;
        }
        console.error('ワークアウト履歴の取得エラー:', error);
        // エラーが発生した場合は空の配列を設定
        setWorkouts([]);
        setError(error);
        setLoading(false);
      }
    };
    fetchWorkouts();
    return () => controller.abort();
  }, []);

  const handleCustomizeClick = () => {
    navigate('/workout-history/customize');
  };

  // 現在の設定表示用の説明文を生成
  const getConfigDescription = () => {
    const cardioExercises = workoutConfig.exercises.filter(ex => isCardioExercise(ex));
    const strengthExercises = workoutConfig.exercises.filter(ex => !isCardioExercise(ex));
    
    let description = '';
    if (cardioExercises.length > 0) {
      description += cardioExercises.join('、') + ' (距離・時間)';
      if (strengthExercises.length > 0) {
        description += '、';
      }
    }
    if (strengthExercises.length > 0) {
      description += strengthExercises.join('、') + ` (${workoutConfig.maxSets}セット)`;
    }
    
    return description;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">エラーが発生しました: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ワークアウト履歴</h1>
            <p className="text-gray-600">トレーニングの進捗を一覧で確認できます</p>
          </div>
          <button
            onClick={handleCustomizeClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            表示設定
          </button>
        </div>

        {/* 現在の設定表示 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 mb-1">現在の表示設定</p>
              <p className="text-blue-900 font-medium">
                {getConfigDescription()}
              </p>
            </div>
            <button
              onClick={handleCustomizeClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              変更 →
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <WorkoutStatistics workouts={workouts} loading={loading} />

        {/* ワークアウト履歴テーブル */}
        <WorkoutHistoryTable 
          workouts={workouts} 
          workoutConfig={workoutConfig} 
          loading={loading}
          isCardioExercise={isCardioExercise}
        />
      </div>
    </div>
  );
};

export default WorkoutHistory;