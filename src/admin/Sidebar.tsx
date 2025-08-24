import { useNavigate } from "react-router-dom";
import { adminNavConfig } from "../lib/adminNavConfig";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Settings,
  X,
  LogOut,
  MessageCircle
} from "lucide-react";

const Sidebar = ({ adminNav, activeRoute, setActiveRoute, sidebarOpen, onClose }) => {
  const navigate = useNavigate();

  const iconMap = {
    dashboard: Home,
    orders: ShoppingCart,
    products: Package,
    users: Users,
    messages: MessageCircle,
    settings: Settings,
    main: Package,
  };

  const navItems = (adminNav || adminNavConfig).map(item => ({
    ...item,
    icon: iconMap[item.key] || Package,
  }));

  const handleLogout = async () => {
    try {
      const { account } = await import("@/lib/appwrite");
      await account.deleteSession("current");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/auth/login");
    }
  };

  const handleNavigation = (item) => {
    setActiveRoute?.(item.path);
    navigate(item.path);
    
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 z-50 w-72 h-screen 
          bg-background border-r
          shadow-xl lg:shadow-none
          flex flex-col 
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        
        {/* Header Section */}
        <div className="flex-shrink-0 px-6 py-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management Console</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            
            return (
              <button
                key={item.name}
                className={`
                  group relative w-full flex items-center px-4 py-3 rounded-xl 
                  text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                onClick={() => handleNavigation(item)}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
                
                <Icon 
                  className={`
                    w-5 h-5 mr-3 transition-colors duration-200
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }
                  `} 
                />
                <span className="flex-1 text-left">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            className="w-full flex items-center px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-medium text-sm transition-all duration-200 group"
            onClick={handleLogout}
            aria-label="Logout from admin panel"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;