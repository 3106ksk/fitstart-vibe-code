import { yupResolver } from '@hookform/resolvers/yup';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutForm = () => {
  const { getFormConfig, isCardioExercise } = useWorkoutConfig();
  const [formConfig, setFormConfig] = useState(getFormConfig());
  const [feedback, setFeedback] = useState({
    message: '',
    type: '',
    visible: false
  });

  // 動的バリデーションスキーマの生成
  const generateValidationSchema = () => {
    const schemaFields = {};
    
    formConfig.exercises.forEach(exercise => {
      if (isCardioExercise(exercise)) {
        schemaFields[`${exercise}_distance`] = yup.number()
          .required(`${exercise}の距離を入力してください`)
          .min(0.1, '距離は0.1km以上で入力してください');
        schemaFields[`${exercise}_duration`] = yup.number()
          .required(`${exercise}の時間を入力してください`)
          .min(1, '時間は1分以上で入力してください');
      } else {
        for (let i = 1; i <= formConfig.maxSets; i++) {
          schemaFields[`${exercise}_set${i}`] = yup.number()
            .min(0, '回数は0以上で入力してください')
            .nullable();
        }
      }
    });
    
    schemaFields.intensity = yup.string().required('強度を選択してください');
    
    return yup.object().shape(schemaFields);
  };

  // デフォルト値の生成
  const generateDefaultValues = () => {
    const defaults = { intensity: '' };
    
    formConfig.exercises.forEach(exercise => {
      if (isCardioExercise(exercise)) {
        defaults[`${exercise}_distance`] = '';
        defaults[`${exercise}_duration`] = '';
      } else {
        for (let i = 1; i <= formConfig.maxSets; i++) {
          defaults[`${exercise}_set${i}`] = '';
        }
      }
    });
    
    return defaults;
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(generateValidationSchema()),
    defaultValues: generateDefaultValues()
  });

  // 設定変更の監視
  useEffect(() => {
    const handleConfigUpdate = (_event) => {
      const newFormConfig = getFormConfig();
      setFormConfig(newFormConfig);
      
      // フォームをリセットして新しいデフォルト値を設定
      const newDefaults = generateDefaultValues();
      Object.keys(newDefaults).forEach(key => {
        setValue(key, newDefaults[key]);
      });
    };

    window.addEventListener('workoutConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('workoutConfigUpdated', handleConfigUpdate);
  }, [setValue]);

  // 定期的な設定同期
  useEffect(() => {
    const interval = setInterval(() => {
      const currentFormConfig = getFormConfig();
      if (JSON.stringify(currentFormConfig) !== JSON.stringify(formConfig)) {
        setFormConfig(currentFormConfig);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [formConfig, getFormConfig]);

  const showFeedback = (message, type) => {
    setFeedback({
      message,
      type,
      visible: true
    });
  };

  useEffect(() => {
    if (feedback.visible) {
      const timer = setTimeout(() => {
        setFeedback(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.visible]);

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      // 各種目のデータを個別に送信
      for (const exercise of formConfig.exercises) {
        if (isCardioExercise(exercise)) {
          const distance = data[`${exercise}_distance`];
          const duration = data[`${exercise}_duration`];
          
          if (distance && duration) {
            const submitData = {
              exercise,
              exerciseType: 'cardio',
              distance: parseFloat(distance),
              duration: parseInt(duration, 10),
              intensity: data.intensity
            };
            
            await axios.post("http://localhost:8000/workouts", submitData, config);
          }
        } else {
          // 筋トレ系の場合、入力された回数のみを送信
          const repsData = [];
          for (let i = 1; i <= formConfig.maxSets; i++) {
            const reps = data[`${exercise}_set${i}`];
            if (reps && reps > 0) {
              repsData.push({ id: String(i), reps: parseInt(reps, 10) });
            }
          }
          
          if (repsData.length > 0) {
            const submitData = {
              exercise,
              exerciseType: 'strength',
              setNumber: repsData.length,
              repsNumber: repsData,
              intensity: data.intensity
            };
            
            await axios.post("http://localhost:8000/workouts", submitData, config);
          }
        }
      }
      
      showFeedback('ワークアウトが保存されました', 'success');
      reset();
    } catch (error) {
      console.error('エラー発生:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      showFeedback(errorMessage, 'error');
    }
  };

  const DISTANCE_OPTIONS = Array.from({ length: 21 }, (_, i) => (i * 0.5).toFixed(1));
  const DURATION_OPTIONS = Array.from({ length: 25 }, (_, i) => i * 5).filter(d => d > 0);
  const REPS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ワークアウト記録
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              設定中の種目:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formConfig.exercises.map(exercise => (
                <Chip 
                  key={exercise}
                  label={exercise}
                  color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
                  variant="outlined"
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              履歴ページで種目設定を変更できます
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                           {formConfig.exercises.map((exercise, _index) => (
               <Grid item xs={12} key={exercise}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {exercise}
                        <Chip 
                          label={isCardioExercise(exercise) ? 'カーディオ' : '筋トレ'}
                          size="small"
                          color={isCardioExercise(exercise) ? 'primary' : 'secondary'}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      
                      {isCardioExercise(exercise) ? (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Controller
                              name={`${exercise}_distance`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="距離 (km)"
                                  select
                                  fullWidth
                                  error={!!errors[`${exercise}_distance`]}
                                  helperText={errors[`${exercise}_distance`]?.message}
                                >
                                  {DISTANCE_OPTIONS.map(distance => (
                                    <MenuItem key={distance} value={distance}>
                                      {distance} km
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Controller
                              name={`${exercise}_duration`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="時間 (分)"
                                  select
                                  fullWidth
                                  error={!!errors[`${exercise}_duration`]}
                                  helperText={errors[`${exercise}_duration`]?.message}
                                >
                                  {DURATION_OPTIONS.map(duration => (
                                    <MenuItem key={duration} value={duration}>
                                      {duration} 分
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          {Array.from({ length: formConfig.maxSets }, (_, i) => (
                            <Grid item xs={12/formConfig.maxSets} key={i}>
                              <Controller
                                name={`${exercise}_set${i + 1}`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label={`${i + 1}セット目`}
                                    select
                                    fullWidth
                                    error={!!errors[`${exercise}_set${i + 1}`]}
                                    helperText={errors[`${exercise}_set${i + 1}`]?.message}
                                  >
                                    <MenuItem value="">なし</MenuItem>
                                    {REPS_OPTIONS.map(reps => (
                                      <MenuItem key={reps} value={reps}>
                                        {reps} 回
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Controller
                  name="intensity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="全体的な強度"
                      select
                      fullWidth
                      error={!!errors.intensity}
                      helperText={errors.intensity?.message}
                    >
                      <MenuItem value="低">楽に感じる（軽い息切れ程度）</MenuItem>
                      <MenuItem value="中">少しきつい（会話しながらできる程度）</MenuItem>
                      <MenuItem value="高">かなりきつい（会話が難しい程度）</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ mt: 2 }}
                >
                  ワークアウトを保存
                </Button>
              </Grid>
            </Grid>
          </form>

          {feedback.visible && (
            <Alert 
              severity={feedback.type === 'success' ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {feedback.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WorkoutForm;