import React, { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { UserIcon, Plus, Search, Filter, MoreVertical, Eye, Trash2, Users as UsersIcon } from "lucide-react";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS_ID;

// Appwrite Users API returns only the current user for frontend SDKs
// For full user listing, you need to use Appwrite's Admin API (server-side)
// Here, we'll show the current logged-in user as an example

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
        const usersData = res.documents.map(user => ({
          id: user.userId,
          name: user.name || user.email,
          email: user.email,
          status: user.status === "active" ? "Verified" : "Unverified",
          labels: user.labels || [],
          joinDate: new Date(user.createdAt).toLocaleDateString(),
          lastLogin: "Recently"
        }));
        setUsers(usersData);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const admins = users.filter(u => Array.isArray(u.labels) && u.labels.includes('admin'));
  const customers = users.filter(u => !Array.isArray(u.labels) || !u.labels.includes('admin'));

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "admins") return matchesSearch && user.labels?.includes('admin');
    if (activeFilter === "customers") return matchesSearch && !user.labels?.includes('admin');
    return matchesSearch;
  });

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        status.toLowerCase() === "verified"
          ? "bg-green-500 text-white"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );

  const UserCard = ({ user }) => (
    <div className="bg-background border-2 border-border rounded-lg p-4 shadow-retro hover:shadow-retro-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center border-2 border-primary/20">
            <UserIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-pixel font-bold text-primary">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={user.status} />
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-pixel uppercase">Role</p>
          <p className="text-sm font-medium">
            {user.labels?.includes('admin') ? 'Admin' : 'Customer'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-pixel uppercase">Joined</p>
          <p className="text-sm font-medium">{user.joinDate}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="font-pixel flex-1">
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        <Button variant="destructive" size="sm" className="font-pixel">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-pixel font-bold text-primary">User Management</h1>
          <p className="text-muted-foreground font-pixel text-sm">Manage admins and customers</p>
        </div>
        <Button className="font-pixel px-4 py-2 shadow-retro w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-background border-2 border-border rounded-lg p-4 shadow-retro items-stretch md:items-center">
        {/* Tabs/Filters - left, prioritized */}
        <div className="flex gap-2 flex-wrap md:flex-nowrap md:gap-2 md:mr-auto order-2 md:order-1">
          {["all", "admins", "customers"].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "ghost"}
              size="sm"
              className={`font-pixel whitespace-nowrap px-4 py-2 ${activeFilter === filter ? "border-primary" : "border-border"}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
        {/* Search - right, reduced width */}
        <div className="relative w-full md:w-auto md:max-w-xs order-1 md:order-2 md:ml-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border-2 border-border rounded-lg bg-background text-foreground font-pixel focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-background border-2 border-primary rounded-lg p-4 shadow-retro flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-pixel">Total Users</p>
              <p className="text-xl font-pixel font-bold text-primary">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-background border-2 border-border rounded-lg p-4 shadow-retro flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-pixel">Admins</p>
              <p className="text-xl font-pixel font-bold text-orange-500">{admins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-background border-2 border-border rounded-lg p-4 shadow-retro flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-pixel">Customers</p>
              <p className="text-xl font-pixel font-bold text-green-500">{customers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-pixel">Loading users...</p>
          </div>
        </div>
      )}

      {/* Users Display - Cards for mobile, Table for desktop */}
      {!loading && (
        <>
          {/* Mobile View - Cards */}
          <div className="lg:hidden space-y-4 px-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-background border-2 border-border rounded-lg">
                <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-pixel">No users found</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block px-2">
            <div className="border-2 border-border rounded-lg shadow-retro overflow-x-auto bg-background">
              <div className="px-6 py-4 border-b-2 border-border bg-muted/40">
                <h2 className="font-pixel text-lg font-bold text-foreground">All Users</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-muted/60 to-muted/30">
                    <TableHead className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider font-pixel">User</TableHead>
                    <TableHead className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider font-pixel">Role</TableHead>
                    <TableHead className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider font-pixel">Joined</TableHead>
                    <TableHead className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider font-pixel">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-12 text-center">
                        <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-pixel">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center border-2 border-primary/20">
                              <UserIcon className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-pixel font-bold text-primary">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.labels?.includes('admin')
                              ? 'bg-orange-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {user.labels?.includes('admin') ? 'Admin' : 'Customer'}
                          </span>
                        </TableCell>
                        {/* Status column removed */}
                        <TableCell className="px-6 py-4 text-muted-foreground font-pixel">
                          {user.joinDate}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="ghost" size="sm" className="font-pixel">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="destructive" size="sm" className="font-pixel">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;