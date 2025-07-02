import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    UserIcon,
    UserPlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './Hook';

const Navbar = () => {
  const authResult = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 認証結果の安全な取得
  const user = authResult?.user || null;
  const loading = authResult?.loading || false;
  const logout = authResult?.logout || (() => {});

  const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: HomeIcon },
    { name: 'ワークアウト', href: '/', icon: ClipboardDocumentListIcon },
    { name: '履歴', href: '/workout-history', icon: ChartBarIcon },
  ];

  const authNavigation = [
    { name: 'ログイン', href: '/login', icon: ArrowRightOnRectangleIcon },
    { name: 'サインアップ', href: '/signup', icon: UserPlusIcon },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // 強化されたデバッグ情報
  console.log('🔍 Navbar デバッグ:', {
    authResult,
    user,
    loading,
    userExists: !!user,
    currentPath: location.pathname
  });

  // ローカルストレージからトークンをチェック（フォールバック）
  const hasToken = localStorage.getItem('token');
  const shouldShowLoggedInUI = user || hasToken;

  console.log('🔑 認証状態チェック:', {
    user: !!user,
    hasToken: !!hasToken,
    shouldShowLoggedInUI
  });

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    // フォールバック: 直接ローカルストレージをクリア
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                FitTrack
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {shouldShowLoggedInUI ? (
              <>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActivePath(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      } px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* ユーザー情報とログアウト */}
                <div className="ml-4 pl-4 border-l border-gray-200 flex items-center space-x-3">
                  {/* ユーザー情報表示 */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>{user?.username || user?.email || 'テストユーザー'}</span>
                  </div>
                  
                  {/* ログアウトボタン */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {authNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActivePath(item.href)
                          ? 'bg-blue-600 text-white'
                          : item.name === 'サインアップ'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {shouldShowLoggedInUI ? (
              <>
                {/* ユーザー情報 - モバイル */}
                <div className="px-3 py-2 text-sm text-gray-600 flex items-center space-x-2 border-b border-gray-200 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span>ようこそ、{user?.username || user?.email || 'テストユーザー'}さん</span>
                </div>
                
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActivePath(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      } block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-3`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* ログアウト - モバイル */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3 mt-4 border-t border-gray-200 pt-4"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>ログアウト</span>
                </button>
              </>
            ) : (
              <>
                {authNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActivePath(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      } block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-3`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}


    </nav>
  );
};

export default Navbar;