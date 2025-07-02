import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import React from 'react';

const WorkoutHistoryTable = ({ workouts, workoutConfig, loading, isCardioExercise }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">詳細履歴</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
        <CalendarDaysIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <p className="text-blue-600 font-medium mb-2">ワークアウト履歴がありません</p>
        <p className="text-blue-500 text-sm">新しいワークアウトを開始しましょう！</p>
      </div>
    );
  }

  // 表示設定の説明文を生成
  const getDisplayDescription = () => {
    const cardioExercises = workoutConfig.exercises.filter(ex => isCardioExercise(ex));
    const strengthExercises = workoutConfig.exercises.filter(ex => !isCardioExercise(ex));
    
    let description = '表示中: ';
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

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">詳細履歴</h2>
        <p className="text-sm text-gray-600 mt-1">
          {getDisplayDescription()}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                日付
              </th>
              {workoutConfig.exercises.map((exerciseName) => {
                const isCardio = isCardioExercise(exerciseName);
                const colSpan = isCardio ? 2 : workoutConfig.maxSets;
                
                return (
                  <React.Fragment key={exerciseName}>
                    <th colSpan={colSpan} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {exerciseName}
                      {isCardio && <div className="text-xs text-gray-400 mt-1">(距離・時間)</div>}
                    </th>
                  </React.Fragment>
                );
              })}
              {workoutConfig.displayColumns.includes('totalReps') && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  合計回数
                </th>
              )}
              {workoutConfig.displayColumns.includes('totalTime') && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合計時間
                </th>
              )}
            </tr>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-r border-gray-200"></th>
              {workoutConfig.exercises.map((exerciseName) => {
                const isCardio = isCardioExercise(exerciseName);
                
                return (
                  <React.Fragment key={`${exerciseName}-headers`}>
                    {isCardio ? (
                      <>
                        <th className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">距離(km)</th>
                        <th className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">時間(分)</th>
                      </>
                    ) : (
                      Array.from({ length: workoutConfig.maxSets }, (_, i) => (
                        <th key={i} className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">
                          {i + 1}セット
                        </th>
                      ))
                    )}
                  </React.Fragment>
                );
              })}
              {workoutConfig.displayColumns.includes('totalReps') && (
                <th className="px-4 py-2 border-r border-gray-200"></th>
              )}
              {workoutConfig.displayColumns.includes('totalTime') && (
                <th className="px-4 py-2"></th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workouts.map((workout, index) => (
              <tr key={workout.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                  {workout.date}
                </td>
                {workoutConfig.exercises.map((exerciseName) => {
                  const exercise = workout.exercises[exerciseName];
                  const isCardio = isCardioExercise(exerciseName);
                  
                  return (
                    <React.Fragment key={`${workout.date}-${exerciseName}`}>
                      {isCardio ? (
                        <>
                          <td className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                            {exercise?.distance ? `${exercise.distance}km` : '-'}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                            {exercise?.duration ? `${exercise.duration}分` : '-'}
                          </td>
                        </>
                      ) : (
                        Array.from({ length: workoutConfig.maxSets }, (_, i) => {
                          const setKey = `set${i + 1}`;
                          return (
                            <td key={setKey} className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                              {exercise?.[setKey] || '-'}
                            </td>
                          );
                        })
                      )}
                    </React.Fragment>
                  );
                })}
                {workoutConfig.displayColumns.includes('totalReps') && (
                  <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600 border-r border-gray-200">
                    {workout.totalReps}
                  </td>
                )}
                {workoutConfig.displayColumns.includes('totalTime') && (
                  <td className="px-4 py-3 text-sm text-center font-semibold text-purple-600">
                    {workout.totalTime}分
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkoutHistoryTable; 