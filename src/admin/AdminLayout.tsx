import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { adminNavConfig } from "../lib/adminNavConfig";
import { Home, ShoppingCart, Package,Users, Settings, Menu } from "lucide-react";
import { ShopSignIcon } from "hugeicons-react";

const iconMap = {
  dashboard: Home,
  orders: ShoppingCart,
  products: Package,
  users: Users,
  settings: Settings,
  main: ShopSignIcon,
};

const adminNav = adminNavConfig.map(item => ({
  ...item,
  icon: iconMap[item.key] || Home,
}));

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/admin");

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
              <Menu className="w-6 h-6 text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-pixel text-primary">Admin</span>
            </div>
            <div className="w-10" />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
