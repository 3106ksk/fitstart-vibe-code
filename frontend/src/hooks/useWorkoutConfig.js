import { useCallback, useEffect, useState } from 'react';

const useWorkoutConfig = () => {
  // カスタマイズ設定（履歴とフォーム共通）
  const [workoutConfig, setWorkoutConfig] = useState({
    exercises: ['ダイヤモンドプッシュアップ', 'デクラインプッシュアップ', 'プッシュアップ'],
    maxSets: 3,
    displayColumns: ['totalReps', 'totalTime']
  });

  // 強制再レンダリング用のカウンター
  const [_forceUpdate, setForceUpdate] = useState(0);

  // カーディオ系種目の定義
  const cardioExercises = [
    'ランニング',
    'ジョギング',
    'ウォーキング',
    'サイクリング',
    '水泳',
    'エリプティカル',
    'ローイング'
  ];

  // 筋トレ系種目の定義
  const strengthExercises = [
    'ダイヤモンドプッシュアップ',
    'デクラインプッシュアップ',
    'プッシュアップ',
    'インクラインプッシュアップ',
    'ワイドプッシュアップ',
    'スクワット',
    'ランジ',
    'プランク',
    'バーピー',
    'マウンテンクライマー',
    'ジャンピングジャック',
    'ベンチプレス',
    'デッドリフト',
    'クランチ',
    'レッグレイズ',
    '懸垂（チンニング）'
  ];

  // 利用可能な種目リスト（カーディオ + 筋トレ）
  const availableExercises = [...cardioExercises, ...strengthExercises];

  // 種目がカーディオ系かどうかを判定
  const isCardioExercise = (exercise) => {
    return cardioExercises.includes(exercise);
  };

  // 種目が筋トレ系かどうかを判定
  const isStrengthExercise = (exercise) => {
    return strengthExercises.includes(exercise);
  };

  // フォーム用の種目データ生成
  const generateFormFields = (config = workoutConfig) => {
    return config.exercises.map(exercise => ({
      name: exercise,
      type: isCardioExercise(exercise) ? 'cardio' : 'strength',
      isCardio: isCardioExercise(exercise),
      maxSets: config.maxSets,
      fields: isCardioExercise(exercise) 
        ? ['distance', 'duration'] 
        : Array.from({ length: config.maxSets }, (_, i) => `set${i + 1}`)
    }));
  };

  // プリセット設定
  const presets = {
    pushup: {
      name: 'プッシュアップ特化',
      exercises: ['ダイヤモンドプッシュアップ', 'デクラインプッシュアップ', 'プッシュアップ'],
      maxSets: 3
    },
    fullbody: {
      name: 'フルボディ',
      exercises: ['プッシュアップ', 'スクワット', 'プランク'],
      maxSets: 3
    },
    cardio: {
      name: 'カーディオ',
      exercises: ['ランニング', 'サイクリング', 'ウォーキング'],
      maxSets: 1
    },
    mixed: {
      name: 'ミックス',
      exercises: ['ランニング', 'プッシュアップ', 'スクワット'],
      maxSets: 3
    }
  };

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedConfig = localStorage.getItem('workoutConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      console.log('ローカルストレージから設定読み込み:', parsed);
      setWorkoutConfig(parsed);
    }
  }, []);

  // 設定変更の監視用useEffect
  useEffect(() => {
    console.log('workoutConfig状態更新:', workoutConfig);
  }, [workoutConfig]);

  // 設定を保存（履歴とフォーム両方に適用）
  const saveConfig = (newConfig) => {
    console.log('設定保存開始:', newConfig);
    
    setWorkoutConfig(newConfig);
    localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
    
    // フォーム設定も同期保存
    const formConfig = {
      exercises: newConfig.exercises,
      maxSets: newConfig.maxSets,
      formFields: generateFormFields(newConfig)
    };
    localStorage.setItem('workoutFormConfig', JSON.stringify(formConfig));
    
    console.log('ローカルストレージ保存完了');
    console.log('保存された履歴設定:', JSON.parse(localStorage.getItem('workoutConfig')));
    console.log('保存されたフォーム設定:', JSON.parse(localStorage.getItem('workoutFormConfig')));
    
    // 同期完了の通知
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('workoutConfigUpdated', { 
        detail: { historyConfig: newConfig, formConfig } 
      }));
    }
  };

  // 種目を追加
  const addExercise = (exercise) => {
    if (workoutConfig.exercises.length < 3 && !workoutConfig.exercises.includes(exercise)) {
      const newConfig = {
        ...workoutConfig,
        exercises: [...workoutConfig.exercises, exercise]
      };
      saveConfig(newConfig);
    }
  };

  // 種目を削除 - useCallbackで最適化
  const removeExercise = useCallback((exercise) => {
    console.log('🗑️ 削除機能実行:', exercise);
    console.log('📝 削除前の種目リスト:', workoutConfig.exercises);
    
    setWorkoutConfig(prevConfig => {
      const filteredExercises = prevConfig.exercises.filter(ex => ex !== exercise);
      console.log('✅ 削除後の種目リスト:', filteredExercises);
      
      const newConfig = {
        ...prevConfig,
        exercises: filteredExercises
      };
      
      // ローカルストレージに即座保存
      localStorage.setItem('workoutConfig', JSON.stringify(newConfig));
      console.log('💾 ローカルストレージ保存完了:', newConfig);
      
      // フォーム設定も同期保存
      const formConfig = {
        exercises: filteredExercises,
        maxSets: newConfig.maxSets,
        formFields: filteredExercises.map(ex => ({
          name: ex,
          type: isCardioExercise(ex) ? 'cardio' : 'strength',
          isCardio: isCardioExercise(ex),
          maxSets: newConfig.maxSets,
          fields: isCardioExercise(ex) 
            ? ['distance', 'duration'] 
            : Array.from({ length: newConfig.maxSets }, (_, i) => `set${i + 1}`)
        }))
      };
      localStorage.setItem('workoutFormConfig', JSON.stringify(formConfig));
      
      return newConfig;
    });
    
    // 強制再レンダリング
    setForceUpdate(prev => prev + 1);
    console.log('🔄 強制再レンダリング実行');
    
  }, [workoutConfig.exercises]);

  // プリセットを適用
  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    const newConfig = {
      ...workoutConfig,
      exercises: preset.exercises,
      maxSets: preset.maxSets
    };
    saveConfig(newConfig);
  };

  // セット数を変更
  const updateMaxSets = (sets) => {
    const newConfig = {
      ...workoutConfig,
      maxSets: sets
    };
    saveConfig(newConfig);
  };

  // フォーム設定の取得
  const getFormConfig = () => {
    return {
      exercises: workoutConfig.exercises,
      maxSets: workoutConfig.maxSets,
      formFields: generateFormFields()
    };
  };

  // 設定同期の強制実行
  const syncConfigs = () => {
    saveConfig(workoutConfig);
  };

  return {
    workoutConfig,
    availableExercises,
    cardioExercises,
    strengthExercises,
    presets,
    isCardioExercise,
    isStrengthExercise,
    addExercise,
    removeExercise,
    applyPreset,
    updateMaxSets,
    generateFormFields,
    getFormConfig,
    syncConfigs,
    forceUpdateCounter: _forceUpdate
  };
};

export default useWorkoutConfig; 