import {
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await axios.post('http://localhost:8000/authrouter/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.status === 400) {
          setErrorMessage('入力内容に問題があります。');
        } else if (error.response.status === 404) {
          setErrorMessage('リソースが見つかりません。');
        } else if (error.response.status >= 500) {
          setErrorMessage('サーバーエラーが発生しました。後でもう一度お試しください。');
        } else {
          setErrorMessage('アカウント作成に失敗しました。もう一度お試しください。');
        }
      } else if (error.request) {
        setErrorMessage('サーバーに接続できません。インターネット接続を確認してください。');
      } else {
        setErrorMessage('予期しないエラーが発生しました。');
      }
      console.error('登録エラー', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) {return { strength: 0, label: '' };}
    
    let strength = 0;
    if (password.length >= 8) {strength++;}
    if (/[A-Z]/.test(password)) {strength++;}
    if (/[a-z]/.test(password)) {strength++;}
    if (/[0-9]/.test(password)) {strength++;}
    if (/[^A-Za-z0-9]/.test(password)) {strength++;}

    const labels = ['', '弱い', '普通', '良い', '強い', '非常に強い'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    
    return { 
      strength: (strength / 5) * 100, 
      label: labels[strength] || '',
      color: colors[strength] || 'bg-gray-300'
    };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            アカウントを作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            または{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              既存のアカウントでログイン
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="card animate-slideInUp">
          <div className="card-content">
            {errorMessage && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
                <p className="text-sm text-error-600">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザー名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="ユーザー名を入力"
                    className={`input-field pl-10 ${
                      errors.username ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
                    }`}
                    {...register('username', {
                      required: 'ユーザー名は必須です',
                      minLength: {
                        value: 3,
                        message: 'ユーザー名は3文字以上で入力してください',
                      },
                      maxLength: {
                        value: 20,
                        message: 'ユーザー名は20文字以下で入力してください',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'ユーザー名は英数字とアンダースコアのみ使用可能です',
                      },
                    })}
                  />
                </div>
                {errors.username && (
                  <p className="error-message">{errors.username.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className={`input-field pl-10 ${
                      errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
                    }`}
                    {...register('email', {
                      required: 'メールアドレスは必須です',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: '有効なメールアドレスを入力してください',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 ${
                      errors.password ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
                    }`}
                    {...register('password', {
                      required: 'パスワードは必須です',
                      minLength: {
                        value: 8,
                        message: 'パスワードは8文字以上で入力してください',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">パスワード強度</span>
                      <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード確認
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`input-field pl-10 ${
                      errors.confirmPassword ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
                    }`}
                    {...register('confirmPassword', {
                      required: 'パスワードの確認は必須です',
                      validate: value =>
                        value === password || 'パスワードが一致しません',
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('terms', {
                    required: '利用規約に同意してください',
                  })}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    利用規約
                  </Link>
                  と
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>
              {errors.terms && (
                <p className="error-message">{errors.terms.message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-primary ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } relative`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    アカウント作成中...
                  </>
                ) : (
                  'アカウントを作成'
                )}
              </button>
            </form>

            {/* Social Registration (Optional) */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;