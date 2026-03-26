import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../api/axios';

type Role = 'ADMIN' | 'STAFF';
type Plan = 'free' | 'pro';
type PlanStatus = 'active' | 'expired';

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  plan: Plan;
  planStatus: PlanStatus;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      const list = res.data?.users ?? [];
      setUsers(
        list.map((u: any) => ({
          _id: u._id ?? u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          organizationId: u.organizationId,
          plan: u.plan ?? 'free',
          planStatus: u.planStatus ?? 'expired',
        }))
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load users.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const freeCount = users.filter((u) => u.plan === 'free').length;
  const proCount = users.filter((u) => u.plan === 'pro').length;

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.post('/users', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
      });
      const u = res.data?.user;
      if (u) {
        setUsers((prev) => [
          ...prev,
          {
            _id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            organizationId: u.organizationId,
            plan: prev[0]?.plan ?? 'free',
            planStatus: prev[0]?.planStatus ?? 'expired',
          },
        ]);
      }
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '' });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to add user.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937]">User Management</h1>
          <p className="text-[#6B7280] mt-1">Manage team members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Users</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Admins</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{adminCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Staff</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{staffCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Free Plan</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{freeCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Pro Plan</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{proCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-[#6B7280]">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-[#6B7280]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 text-[#1F2937]">{user.name}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-[#F3E8D9] text-[#C89B5A]' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'pro'
                              ? 'bg-[#F3E8D9] text-[#C89B5A]'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {user.plan === 'pro' ? 'Pro' : 'Free'}
                        </span>
                        <span className="text-xs text-[#6B7280]">
                          {user.planStatus === 'active' ? 'Active' : 'Expired'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Add Staff User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Set password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
