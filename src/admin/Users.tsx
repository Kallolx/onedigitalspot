import React, { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  UserIcon, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Users as UsersIcon, 
  RefreshCw,
  Shield,
  Crown,
  Mail,
  Calendar,
  Clock,
  UserPlus,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { RotateLoader } from "react-spinners";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS_ID;

interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  status: boolean;
  labels: string[];
  registration: string;
  $createdAt: string;
  $updatedAt: string;
  prefs: any;
  accessedAt?: string;
  passwordUpdate?: string;
  phoneVerification?: boolean;
  phone?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Get current user to check admin status
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const user = await account.get();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error getting current user:", err);
      }
    }
    getCurrentUser();
  }, []);

  // Fetch users - Note: This will only work with server-side implementation
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get users from the custom users collection first
      const res = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
      const usersData = res.documents.map(user => ({
        $id: user.userId || user.$id,
        name: user.name || "Unknown User",
        email: user.email || "No Email",
        emailVerification: user.emailVerification || false,
        status: user.status === "active" || user.status === true,
        labels: user.labels || [],
        registration: user.registration || user.$createdAt,
        $createdAt: user.$createdAt,
        $updatedAt: user.$updatedAt,
        prefs: user.prefs || {},
        accessedAt: user.accessedAt,
        phoneVerification: user.phoneVerification || false,
        phone: user.phone
      }));

      // Add current user if not in collection (for Google OAuth users)
      if (currentUser && !usersData.some(u => u.$id === currentUser.$id)) {
        usersData.unshift({
          $id: currentUser.$id,
          name: currentUser.name || "Current User",
          email: currentUser.email,
          emailVerification: currentUser.emailVerification,
          status: currentUser.status,
          labels: currentUser.labels || [],
          registration: currentUser.registration,
          $createdAt: currentUser.$createdAt,
          $updatedAt: currentUser.$updatedAt,
          prefs: currentUser.prefs || {},
          accessedAt: currentUser.accessedAt,
          phoneVerification: currentUser.phoneVerification,
          phone: currentUser.phone
        });
      }

      setUsers(usersData);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Unable to load users. Note: Full user management requires server-side implementation.");
      
      // Fallback: show current user only
      if (currentUser) {
        setUsers([{
          $id: currentUser.$id,
          name: currentUser.name || "Current User",
          email: currentUser.email,
          emailVerification: currentUser.emailVerification,
          status: currentUser.status,
          labels: currentUser.labels || [],
          registration: currentUser.registration,
          $createdAt: currentUser.$createdAt,
          $updatedAt: currentUser.$updatedAt,
          prefs: currentUser.prefs || {},
          accessedAt: currentUser.accessedAt,
          phoneVerification: currentUser.phoneVerification,
          phone: currentUser.phone
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh users
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // Filter users
  const admins = users.filter(u => Array.isArray(u.labels) && u.labels.includes('admin'));
  const customers = users.filter(u => !Array.isArray(u.labels) || !u.labels.includes('admin'));
  const verifiedUsers = users.filter(u => u.emailVerification);
  const activeUsers = users.filter(u => u.status);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "admins") return matchesSearch && user.labels?.includes('admin');
    if (activeFilter === "customers") return matchesSearch && !user.labels?.includes('admin');
    if (activeFilter === "verified") return matchesSearch && user.emailVerification;
    if (activeFilter === "unverified") return matchesSearch && !user.emailVerification;
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour(s) ago`;
    return `${Math.floor(diffInMinutes / 1440)} day(s) ago`;
  };

  // Status badges
  const StatusBadge = ({ user }: { user: User }) => {
    const isAdmin = user.labels?.includes('admin');
    const isVerified = user.emailVerification;
    const isActive = user.status;

    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <Crown className="w-3 h-3" />
          Admin
        </span>
      );
    }

    if (isVerified && isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }

    if (!isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertCircle className="w-3 h-3" />
          Unverified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        <UserIcon className="w-3 h-3" />
        Customer
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-3xl font-pixel font-bold text-foreground">User Management</h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <RotateLoader color="green" size={15} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-pixel font-bold text-foreground">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, admins, and customer accounts</p>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-pixel text-foreground">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span className="font-pixel">Add User</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-foreground font-pixel">{users.length}</div>
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <UsersIcon className="w-4 h-4" />
            Total Users
          </div>
        </div>
        <div className="rounded-lg p-4 border border-orange-200 shadow-sm">
          <div className="text-2xl font-bold text-orange-600 font-pixel">{admins.length}</div>
          <div className="text-sm text-orange-700 flex items-center gap-1">
            <Crown className="w-4 h-4" />
            Admins
          </div>
        </div>
        <div className="rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 font-pixel">{customers.length}</div>
          <div className="text-sm text-blue-700 flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            Customers
          </div>
        </div>
        <div className="rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600 font-pixel">{verifiedUsers.length}</div>
          <div className="text-sm text-green-700 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Verified
          </div>
        </div>
        <div className="rounded-lg p-4 border border-primary/20 shadow-sm">
          <div className="text-2xl font-bold text-foreground font-pixel">{activeUsers.length}</div>
          <div className="text-sm text-foreground/70 flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Active
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
          />
        </div>
        
        {["all", "admins", "customers", "verified", "unverified"].map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="font-pixel capitalize"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Last Active</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-pixel">
                    {searchTerm || activeFilter !== "all" 
                      ? "No users match your filters" 
                      : "No users found"
                    }
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.$id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center border-2 border-primary/20">
                          <UserIcon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge user={user} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {user.labels?.includes('admin') ? 'Administrator' : 'Customer'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.$createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">{timeAgo(user.$createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {user.accessedAt ? timeAgo(user.accessedAt) : 'Never'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1 rounded-lg hover:bg-primary/10 transition-colors" 
                          title="View Details" 
                          onClick={() => setViewUser(user)}
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button 
                          className="p-1 rounded-lg hover:bg-red-100 transition-colors" 
                          title="Delete User"
                          onClick={() => {
                            alert(`Delete functionality would be implemented here for user: ${user.name}`);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            {filteredUsers.length !== users.length && (
              <span className="text-xs text-gray-500">
                (filtered from {users.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-white border border-gray-300 font-pixel text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="font-pixel text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg bg-white border border-gray-300 font-pixel text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
            <select 
              value={pageSize} 
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="font-pixel text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* View User Details Modal */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-foreground">
              User Details
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center border-2 border-primary/20">
                  <UserIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-xl text-foreground mb-1">
                    {viewUser.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <Mail className="w-4 h-4" />
                    {viewUser.email}
                  </p>
                  <StatusBadge user={viewUser} />
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-pixel text-xs text-gray-500">User ID:</span>
                    <div className="font-mono text-sm text-gray-900 bg-gray-100 p-2 rounded">{viewUser.$id}</div>
                  </div>
                  
                  <div>
                    <span className="font-pixel text-xs text-gray-500">Role:</span>
                    <div className="font-medium text-gray-900">
                      {viewUser.labels?.includes('admin') ? 'Administrator' : 'Customer'}
                    </div>
                  </div>

                  <div>
                    <span className="font-pixel text-xs text-gray-500">Account Status:</span>
                    <div className="font-medium text-gray-900">
                      {viewUser.status ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-pixel text-xs text-gray-500">Email Verified:</span>
                    <div className="font-medium text-gray-900">
                      {viewUser.emailVerification ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div>
                    <span className="font-pixel text-xs text-gray-500">Joined:</span>
                    <div className="text-sm text-gray-900">{new Date(viewUser.$createdAt).toLocaleString()}</div>
                  </div>

                  <div>
                    <span className="font-pixel text-xs text-gray-500">Last Updated:</span>
                    <div className="text-sm text-gray-900">{new Date(viewUser.$updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Labels & Preferences */}
              <div className="space-y-3">
                <div>
                  <span className="font-pixel text-xs text-gray-500">Labels:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewUser.labels && viewUser.labels.length > 0 ? (
                      viewUser.labels.map((label, index) => (
                        <Badge key={index} variant="secondary" className="font-pixel text-xs">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No labels</span>
                    )}
                  </div>
                </div>

                {viewUser.prefs && Object.keys(viewUser.prefs).length > 0 && (
                  <div>
                    <span className="font-pixel text-xs text-gray-500">Preferences:</span>
                    <div className="bg-gray-100 p-3 rounded-lg mt-1">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(viewUser.prefs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;