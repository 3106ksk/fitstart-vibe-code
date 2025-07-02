import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, FireIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutHistoryCustomization = () => {
  const navigate = useNavigate();
  const [savedMessage, setSavedMessage] = useState('');
  const [isPresetExpanded, setIsPresetExpanded] = useState(false); // プリセット折りたたみ状態
  const [isSetExpanded, setIsSetExpanded] = useState(true); // セット数は初期展開状態
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(true); // 選択済み種目は初期展開
  const [isAddExpanded, setIsAddExpanded] = useState(true); // 種目追加は初期展開

  const {
    workoutConfig,
    cardioExercises,
    strengthExercises,
    presets,
    isCardioExercise,
    addExercise,
    removeExercise,
    applyPreset,
    updateMaxSets,
    syncConfigs,
    forceUpdateCounter: _forceUpdateCounter
  } = useWorkoutConfig();

  // デバッグ用：グローバルにremoveExercise関数を公開
  useEffect(() => {
    window.debugRemoveExercise = removeExercise;
    window.debugAddExercise = addExercise;
    window.debugWorkoutConfig = workoutConfig;
    console.log('🔧 デバッグ用関数を公開:', {
      debugRemoveExercise: 'window.debugRemoveExercise("種目名")',
      debugAddExercise: 'window.debugAddExercise("種目名")',
      debugWorkoutConfig: 'window.debugWorkoutConfig'
    });
  }, [removeExercise, addExercise, workoutConfig]);

  const handleSaveAndBack = () => {
    // 最終的な同期を確実に実行
    syncConfigs();
    setSavedMessage('設定が保存されました！');
    setTimeout(() => {
      navigate('/workout-history');
    }, 1500);
  };

  const handlePresetApply = (presetKey) => {
    applyPreset(presetKey);
    // フォーム設定も同期
    setTimeout(() => syncConfigs(), 100);
    setSavedMessage('プリセットが適用されました！');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleMaxSetsChange = (sets) => {
    updateMaxSets(sets);
    // フォーム設定も同期
    setTimeout(() => syncConfigs(), 100);
  };

  const handleAddExercise = (exercise) => {
    console.log('🔘 追加ボタンクリック:', exercise);
    addExercise(exercise);
  };

  const handleRemoveExercise = (exercise) => {
    console.log('🔘 削除ボタンクリック:', exercise);
    removeExercise(exercise);
  };

  // 現在の設定表示用の説明文を生成
  const getConfigDescription = () => {
    const currentCardio = workoutConfig.exercises.filter(ex => isCardioExercise(ex));
    const currentStrength = workoutConfig.exercises.filter(ex => !isCardioExercise(ex));
    
    let description = '';
    if (currentCardio.length > 0) {
      description += currentCardio.join('、') + ' (距離・時間)';
      if (currentStrength.length > 0) {
        description += '、';
      }
    }
    if (currentStrength.length > 0) {
      description += currentStrength.join('、') + ` (${workoutConfig.maxSets}セット)`;
    }
    
    return description;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/workout-history')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            履歴に戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ワークアウト履歴設定</h1>
          <p className="text-gray-600">履歴表示をカスタマイズして、あなたのトレーニングスタイルに合わせましょう</p>
        </div>

        {/* 保存メッセージ */}
        {savedMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-600 font-medium">{savedMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム - プリセットとセット数 */}
          <div className="space-y-6">
            {/* プリセット選択 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsPresetExpanded(!isPresetExpanded)}
              >
                <div className="flex items-center">
                  {isPresetExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">プリセット</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {isPresetExpanded ? '折りたたむ' : '展開する'}
                </span>
              </div>
              
              {isPresetExpanded && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">よく使われる設定から選択できます</p>
                  <div className="space-y-3">
                    {Object.entries(presets).map(([key, preset]) => {
                      const cardioCount = preset.exercises.filter(ex => isCardioExercise(ex)).length;
                      const strengthCount = preset.exercises.filter(ex => !isCardioExercise(ex)).length;
                      
                      return (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePresetApply(key);
                          }}
                          className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">{preset.name}</div>
                              <div className="text-sm text-gray-600 mb-2">{preset.exercises.join('、')}</div>
                              <div className="flex items-center text-xs text-gray-500 space-x-4">
                                {cardioCount > 0 && (
                                  <div className="flex items-center">
                                    <HeartIcon className="h-3 w-3 text-red-500 mr-1" />
                                    カーディオ {cardioCount}種目
                                  </div>
                                )}
                                {strengthCount > 0 && (
                                  <div className="flex items-center">
                                    <FireIcon className="h-3 w-3 text-orange-500 mr-1" />
                                    筋トレ {strengthCount}種目 ({preset.maxSets}セット)
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-blue-600 text-sm font-medium ml-4">適用</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* セット数設定 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsSetExpanded(!isSetExpanded)}
              >
                <div className="flex items-center">
                  {isSetExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">セット数</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {isSetExpanded ? '折りたたむ' : '展開する'}
                </span>
              </div>
              
              {isSetExpanded && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">筋トレ系種目の履歴テーブルに表示するセット数を選択</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((sets) => (
                      <button
                        key={sets}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMaxSetsChange(sets);
                        }}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          workoutConfig.maxSets === sets
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold">{sets}</div>
                          <div className="text-xs">セット</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ※ カーディオ系種目は距離・時間表示のため、セット数設定の影響を受けません
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム - 種目カスタマイズ */}
          <div className="space-y-6">
            {/* 現在の設定 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">現在の設定</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-blue-800 mb-2">表示中の種目</div>
                <div className="text-blue-900 font-medium mb-2">
                  {getConfigDescription()}
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  {workoutConfig.exercises.filter(ex => isCardioExercise(ex)).length > 0 && (
                    <div className="flex items-center text-red-600">
                      <HeartIcon className="h-3 w-3 mr-1" />
                      カーディオ {workoutConfig.exercises.filter(ex => isCardioExercise(ex)).length}種目
                    </div>
                  )}
                  {workoutConfig.exercises.filter(ex => !isCardioExercise(ex)).length > 0 && (
                    <div className="flex items-center text-orange-600">
                      <FireIcon className="h-3 w-3 mr-1" />
                      筋トレ {workoutConfig.exercises.filter(ex => !isCardioExercise(ex)).length}種目
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 選択済み種目 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsSelectedExpanded(!isSelectedExpanded)}
              >
                <div className="flex items-center">
                  {isSelectedExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    選択中の種目 ({workoutConfig.exercises.length}/3)
                  </h2>
                </div>
                <span className="text-sm text-gray-500">
                  {isSelectedExpanded ? '折りたたむ' : '展開する'}
                </span>
              </div>
              
              {isSelectedExpanded && (
                <div className="mt-4">
                  <div className="space-y-3">
                    {workoutConfig.exercises.map((exercise, index) => {
                      const isCardio = isCardioExercise(exercise);
                      return (
                        <div key={`${exercise}-${index}-${workoutConfig.exercises.length}`} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <span className="text-blue-900 font-medium">{exercise}</span>
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                {isCardio ? (
                                  <>
                                    <HeartIcon className="h-3 w-3 mr-1" />
                                    カーディオ (距離・時間)
                                  </>
                                ) : (
                                  <>
                                    <FireIcon className="h-3 w-3 mr-1" />
                                    筋トレ ({workoutConfig.maxSets}セット)
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔘 削除ボタンクリック:', exercise);
                              handleRemoveExercise(exercise);
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 種目追加 */}
            {workoutConfig.exercises.length < 3 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsAddExpanded(!isAddExpanded)}
                >
                  <div className="flex items-center">
                    {isAddExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <h2 className="text-lg font-semibold text-gray-900">種目を追加</h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {isAddExpanded ? '折りたたむ' : '展開する'}
                  </span>
                </div>
                
                {isAddExpanded && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">最大3種目まで選択できます</p>
                    
                    {/* カーディオ系種目 */}
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <HeartIcon className="h-4 w-4 text-red-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900">カーディオ系 (距離・時間)</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {cardioExercises
                          .filter(exercise => !workoutConfig.exercises.includes(exercise))
                          .map((exercise) => (
                            <button
                              key={exercise}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔘 追加ボタンクリック:', exercise);
                                handleAddExercise(exercise);
                              }}
                              className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                            >
                              <div className="w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center mr-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-900">{exercise}</span>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* 筋トレ系種目 */}
                    <div>
                      <div className="flex items-center mb-3">
                        <FireIcon className="h-4 w-4 text-orange-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900">筋トレ系 (セット・回数)</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {strengthExercises
                          .filter(exercise => !workoutConfig.exercises.includes(exercise))
                          .map((exercise) => (
                            <button
                              key={exercise}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔘 追加ボタンクリック:', exercise);
                                handleAddExercise(exercise);
                              }}
                              className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                            >
                              <div className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center mr-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-900">{exercise}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/workout-history')}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSaveAndBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            設定を保存して履歴に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistoryCustomization; 