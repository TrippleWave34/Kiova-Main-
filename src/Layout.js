import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, 
  ShoppingBag, 
  Shirt,
  Heart,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Marketplace",
    url: createPageUrl("Marketplace"),
    icon: ShoppingBag,
  },
  {
    title: "My Wardrobe",
    url: createPageUrl("Wardrobe"),
    icon: Shirt,
  },
  {
    title: "Saved Outfits",
    url: createPageUrl("SavedOutfits"),
    icon: Heart,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 flex flex-col bg-white hidden lg:flex">
        <div className="p-8 border-b border-gray-200">
          <Link to={createPageUrl("Home")} className="block">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690018f6927e32d11b8ea50f/88e9eb5ec_Kiovalogo.png" 
              alt="Kiova - The Key to Your New Style" 
              className="w-full h-auto max-w-[200px]"
            />
          </Link>
        </div>
        
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-6 border-t border-gray-200 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50"
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
          
          <div className="pt-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690018f6927e32d11b8ea50f/88e9eb5ec_Kiovalogo.png" 
            alt="Kiova" 
            className="h-10"
          />
          <Bell className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="lg:pt-0 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}