import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const WorkoutCustomizationPanel = ({ 
  showSettings, 
  setShowSettings, 
  workoutConfig,
  availableExercises,
  presets,
  addExercise,
  removeExercise,
  applyPreset,
  updateMaxSets
}) => {
  return (
    <div className={`fixed inset-0 z-50 ${showSettings ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* オーバーレイ */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          showSettings ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={() => setShowSettings(false)}
      />
      
      {/* サイドパネル */}
      <div
        className={`absolute right-0 top-0 h-full w-96 max-w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showSettings ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">ワークアウト履歴カスタマイズ</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* プリセット */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">プリセット</h4>
              <div className="space-y-3">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{preset.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{preset.exercises.join('、')}</div>
                    <div className="text-xs text-gray-500 mt-1">{preset.maxSets}セット</div>
                  </button>
                ))}
              </div>
            </div>

            {/* セット数設定 */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">セット数</h4>
              <div className="flex space-x-3">
                {[1, 2, 3].map((sets) => (
                  <button
                    key={sets}
                    onClick={() => updateMaxSets(sets)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      workoutConfig.maxSets === sets
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {sets}セット
                  </button>
                ))}
              </div>
            </div>

            {/* 選択済み種目 */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                選択中の種目 ({workoutConfig.exercises.length}/3)
              </h4>
              <div className="space-y-2">
                {workoutConfig.exercises.map((exercise) => (
                  <div key={exercise} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-900 text-sm">{exercise}</span>
                    <button
                      onClick={() => removeExercise(exercise)}
                      className="p-1 text-blue-600 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 種目追加 */}
            {workoutConfig.exercises.length < 3 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">種目を追加</h4>
                <div className="space-y-2">
                  {availableExercises
                    .filter(exercise => !workoutConfig.exercises.includes(exercise))
                    .map((exercise) => (
                      <button
                        key={exercise}
                        onClick={() => addExercise(exercise)}
                        className="w-full flex items-center p-2 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                        <span className="text-sm">{exercise}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              設定を適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCustomizationPanel; 