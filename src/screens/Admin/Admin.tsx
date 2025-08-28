import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, FolderOpen, BookOpen, BarChart3, Activity, TrendingUp, Eye, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { Card, CardContent } from '../../components/ui/card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface AdminProps {
  onBack: () => void;
}

interface AdminStats {
  totalUsers: number;
  totalFolders: number;
  totalBooks: number;
  activeUsers: number;
  recentActivity: any[];
  topGenres: { genre: string; count: number }[];
  userGrowth: { date: string; count: number }[];
}

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalFolders: 0,
    totalBooks: 0,
    activeUsers: 0,
    recentActivity: [],
    topGenres: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'books' | 'analytics'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      const [usersResult, foldersResult, booksResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('folders').select('*', { count: 'exact' }),
        supabase.from('books').select('*', { count: 'exact' })
      ]);

      // Fetch detailed data
      const [usersData, booksData] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('books').select('*, folders(name)').order('created_at', { ascending: false }).limit(100)
      ]);

      // Calculate top genres
      const genreCount: { [key: string]: number } = {};
      booksData.data?.forEach(book => {
        if (book.genre) {
          book.genre.forEach((g: string) => {
            genreCount[g] = (genreCount[g] || 0) + 1;
          });
        }
      });

      const topGenres = Object.entries(genreCount)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalUsers: usersResult.count || 0,
        totalFolders: foldersResult.count || 0,
        totalBooks: booksResult.count || 0,
        activeUsers: Math.floor((usersResult.count || 0) * 0.7), // Mock active users
        recentActivity: [],
        topGenres,
        userGrowth: []
      });

      setUsers(usersData.data || []);
      setBooks(booksData.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their data.')) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        
        // Refresh data
        fetchAdminData();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const deleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', bookId);
        if (error) throw error;
        
        // Refresh data
        fetchAdminData();
        alert('Book deleted successfully');
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden relative border dark:border-gray-800">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'books', label: 'Books', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto bg-white dark:bg-black">
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total Users</p>
                        <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Active Users</p>
                        <p className="text-lg font-bold text-gray-900">{stats.activeUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total Folders</p>
                        <p className="text-lg font-bold text-gray-900">{stats.totalFolders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total Books</p>
                        <p className="text-lg font-bold text-gray-900">{stats.totalBooks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Genres */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Top Genres</h3>
                  <div className="space-y-2">
                    {stats.topGenres.slice(0, 5).map((genre, index) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{genre.genre}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${(genre.count / stats.topGenres[0]?.count) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-6">{genre.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Recent Users</h3>
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Recent Books</h3>
              {books.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{book.title}</p>
                        <p className="text-xs text-gray-500">
                          {book.author} • {book.folders?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            book.status === 'reading' ? 'bg-blue-500' :
                            book.status === 'completed' ? 'bg-green-500' :
                            book.status === 'plan-to-read' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500 capitalize">
                            {book.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBook(book.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Platform Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Books per User</span>
                      <span className="font-medium">
                        {stats.totalUsers > 0 ? Math.round(stats.totalBooks / stats.totalUsers) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Folders per User</span>
                      <span className="font-medium">
                        {stats.totalUsers > 0 ? Math.round(stats.totalFolders / stats.totalUsers) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">User Engagement</span>
                      <span className="font-medium text-green-600">
                        {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Reading Status Distribution</h3>
                  <div className="space-y-2">
                    {['reading', 'completed', 'plan-to-read', 'dropped'].map((status) => {
                      const count = books.filter(book => book.status === status).length;
                      const percentage = books.length > 0 ? (count / books.length) * 100 : 0;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {status.replace('-', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  status === 'reading' ? 'bg-blue-600' :
                                  status === 'completed' ? 'bg-green-600' :
                                  status === 'plan-to-read' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
};