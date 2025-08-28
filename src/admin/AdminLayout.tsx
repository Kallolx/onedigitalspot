import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { adminNavConfig } from "../lib/adminNavConfig";
import { Home, ShoppingCart, Package, Users, Settings, Menu, MessageSquare } from "lucide-react";
import { ShopSignIcon } from "hugeicons-react";
import { NotificationProvider } from "../contexts/NotificationContext";
import NotificationDropdown from "../components/custom/NotificationDropdown";
import { useOrderNotifications } from "../hooks/useOrderNotifications";

const iconMap = {
  dashboard: Home,
  orders: ShoppingCart,
  products: Package,
  reviews: MessageSquare,
  users: Users,
  settings: Settings,
  main: ShopSignIcon,
};

const adminNav = adminNavConfig.map(item => ({
  ...item,
  icon: iconMap[item.key] || Home,
}));

// Internal component that uses the notification hooks
const AdminLayoutContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/admin");
  
  // Initialize order notifications
  useOrderNotifications();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        adminNav={adminNav}
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="lg:hidden bg-white border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded flex items-center justify-center">
                <Package className="w-4 h-4 text-foreground-foreground" />
              </div>
              <span className="font-pixel text-foreground">Admin</span>
            </div>
            <div className="flex items-center">
              <NotificationDropdown />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <NotificationProvider>
      <AdminLayoutContent />
    </NotificationProvider>
  );
};

export default AdminLayout;
