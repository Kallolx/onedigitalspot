import React from "react";
import { useNavigate } from "react-router-dom";
import { adminNavConfig } from "../lib/adminNavConfig";
import {
  ShopSignIcon,
  CoinsDollarIcon,
  Tv01Icon,
  UserIcon,
  Settings02Icon,
  DashboardSpeed01Icon,
  Cancel01Icon,
  PackageIcon
} from "hugeicons-react";

const Sidebar = ({ adminNav, activeRoute, setActiveRoute, sidebarOpen, onClose }) => {
  const navigate = useNavigate();

  const iconMap = {
    dashboard: DashboardSpeed01Icon,
    orders: CoinsDollarIcon,
    products: ShopSignIcon,
    users: UserIcon,
    subscriptions: Tv01Icon,
    settings: Settings02Icon,
    main: ShopSignIcon,
  };

  const navItems = (adminNav || adminNavConfig).map(item => ({
    ...item,
    icon: iconMap[item.key] || ShopSignIcon,
  }));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Main Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 w-64 h-screen 
        bg-background border-r-2 border-border shadow-retro
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-6 border-b-2 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center border-2 border-primary/20">
                <PackageIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-pixel text-xl text-primary">Admin Panel</span>
            </div>
            
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={onClose}
            >
              <Cancel01Icon className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            return (
              <button
                key={item.name}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg text-base font-pixel text-left transition-colors duration-200
                  ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-primary'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => {
                  setActiveRoute?.(item.path);
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    onClose?.();
                  }
                }}
              >
                <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4">
          <div className="flex flex-col gap-3">
           
            <button
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-pixel text-base transition-colors"
              onClick={async () => {
                // Appwrite logout
                try {
                  const { account } = await import("@/lib/appwrite");
                  await account.deleteSession("current");
                  navigate("/auth/login");
                } catch (err) {
                  navigate("/auth/login");
                }
              }}
            >
              <Cancel01Icon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;