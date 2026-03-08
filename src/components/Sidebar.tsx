import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Settings,
  LogOut,
  DollarSign,
  BarChart2,
  Key,
  Tag,
  Layers,
  Receipt,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Sparkles,
  PanelLeftClose,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  submenu?: MenuItem[];
}

export default function Sidebar({
  isMobileOpen,
  toggleMobileSidebar,
  isCollapsed,
  toggleCollapse
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const menuItems: MenuItem[] = [
    { name: 'Início', path: '/dashboard', icon: Home },
    { name: 'Transações', path: '/transactions', icon: CreditCard },
    { name: 'Parcelamentos', path: '/installments', icon: Receipt },
    { name: 'Calendário', path: '/calendar', icon: Calendar },
    { name: 'Relatório por categoria', path: '/category-report', icon: BarChart2 },
    { name: 'Lista de desejos', path: '/wishlist', icon: Star },
    { name: 'Aplicativo', path: '/tokens', icon: Key },
    {
      name: 'Configurações',
      path: '/settings',
      icon: Settings,
      submenu: [
        { name: 'Categorias', path: '/categories', icon: Tag },
        { name: 'Subcategorias', path: '/subcategories', icon: Layers },
        { name: 'Cartões de crédito', path: '/credit-cards', icon: CreditCard },
        { name: 'Termos personalizados', path: '/custom-terms', icon: FileText },
        { name: 'Minha conta', path: '/settings', icon: User },
      ]
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu: MenuItem[]) => {
    return submenu.some(item => location.pathname === item.path);
  };

  const toggleMenu = (menuName: string) => {
    if (isCollapsed) {
      toggleCollapse();
    }
    setExpandedMenus((prev: Record<string, boolean>) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSubmenuClick = (e: React.MouseEvent) => {
    if (isMobileOpen && !e.currentTarget.closest('.submenu-item')) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none flex flex-col group/sidebar",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          !isMobileOpen && (isCollapsed ? "md:w-20" : "md:w-64")
        )}
      >
        <div className={cn(
          "relative flex items-center p-6 mb-2 transition-all duration-300",
          isCollapsed && !isMobileOpen ? "p-4 justify-center" : "justify-between"
        )}>
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-[#11ab77] to-[#0d8a5f] p-2.5 rounded-xl shadow-lg shadow-[#11ab77]/20 shrink-0">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="ml-3 text-2xl font-black tracking-tight text-slate-800 animate-in fade-in slide-in-from-left-2 duration-300">
                FinSmart
              </span>
            )}
          </div>

          {!isMobileOpen && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleCollapse}
              className={cn(
                "hidden md:flex text-slate-400 hover:text-[#11ab77] hover:bg-slate-50 transition-all duration-300",
                isCollapsed ? "absolute -right-3 top-8 bg-white border border-slate-200 rounded-full shadow-sm z-50 hover:scale-110" : "ml-2",
                isCollapsed && "rotate-180"
              )}
            >
              <PanelLeftClose size={14} />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-2">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "w-full h-11 px-3 rounded-xl transition-all duration-200 font-semibold group",
                        isCollapsed && !isMobileOpen ? "justify-center p-0 h-12 w-12 mx-auto" : "justify-between",
                        (isActive(item.path) || isSubmenuActive(item.submenu))
                          ? "bg-[#11ab77] text-white hover:bg-[#11ab77]/90 hover:text-white shadow-md shadow-[#11ab77]/10"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#11ab77]"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-all",
                          (isCollapsed && !isMobileOpen) ? "" : "mr-3",
                          (isActive(item.path) || isSubmenuActive(item.submenu)) ? "text-white" : "text-slate-400 group-hover:text-[#11ab77]"
                        )} />
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="truncate animate-in fade-in slide-in-from-left-1 duration-200">
                            {item.name}
                          </span>
                        )}
                      </div>
                      {(!isCollapsed || isMobileOpen) && (
                        <div className="shrink-0 transition-transform duration-200">
                          {expandedMenus[item.name] ? (
                            <ChevronDown size={14} className="opacity-40" />
                          ) : (
                            <ChevronRight size={14} className="opacity-40" />
                          )}
                        </div>
                      )}
                    </Button>
                    <div className={cn(
                      "overflow-hidden transition-all duration-300",
                      (isCollapsed && !isMobileOpen) ? "max-h-0" : (
                        expandedMenus[item.name]
                          ? "max-h-96 opacity-100 mt-1 pb-1 ml-6 border-l border-slate-100"
                          : "max-h-0 opacity-0"
                      )
                    )}>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={cn(
                            "submenu-item flex items-center px-4 py-2.5 my-0.5 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive(subItem.path)
                              ? "bg-[#e6f7f1] text-[#11ab77] shadow-sm shadow-[#11ab77]/5"
                              : "text-slate-500 hover:bg-slate-50 hover:text-[#11ab77]"
                          )}
                        >
                          <subItem.icon className={cn("mr-2.5 h-4 w-4 shrink-0", isActive(subItem.path) ? "text-[#11ab77]" : "text-slate-400")} />
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full h-11 px-3 rounded-xl transition-all duration-200 font-semibold group mb-1",
                      isCollapsed && !isMobileOpen ? "justify-center p-0 h-11 w-11 mx-auto" : "justify-start",
                      isActive(item.path)
                        ? "bg-[#11ab77] text-white hover:bg-[#11ab77]/90 hover:text-white shadow-md shadow-[#11ab77]/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#11ab77]"
                    )}
                    onClick={handleSubmenuClick}
                  >
                    <Link to={item.path} title={isCollapsed && !isMobileOpen ? item.name : undefined}>
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 transition-all",
                        (isCollapsed && !isMobileOpen) ? "" : "mr-3",
                        isActive(item.path) ? "text-white" : "text-slate-400 group-hover:text-[#11ab77]"
                      )} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate animate-in fade-in slide-in-from-left-1 duration-200">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className={cn(
            "bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl relative overflow-hidden group/pro transition-all duration-300",
            isCollapsed && !isMobileOpen ? "h-12 w-12 mx-auto flex items-center justify-center p-0" : "p-5"
          )}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/pro:scale-125 transition-transform duration-500">
              <Sparkles size={64} className="text-white" />
            </div>

            {isCollapsed && !isMobileOpen ? (
              <Sparkles className="text-[#11ab77] animate-pulse" size={24} />
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h3 className="font-bold text-white text-sm relative z-10 flex items-center">
                  FinSmart Pro
                  <span className="ml-2 bg-[#11ab77] text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Novo</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-1.5 mb-4 relative z-10 leading-relaxed text-balance">
                  Relatórios avançados por <strong>R$ 79,90/ano</strong>.
                </p>
                <Button size="sm" className="w-full h-8 bg-[#11ab77] hover:bg-[#0e9968] text-white text-[10px] md:text-xs font-bold rounded-lg relative z-10 transition-transform active:scale-95">
                  Assinar Agora
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full mt-4 h-11 px-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-200 font-semibold group",
              isCollapsed && !isMobileOpen ? "justify-center p-0 h-11 w-11 mx-auto" : "justify-start"
            )}
            title={isCollapsed && !isMobileOpen ? "Sair do App" : undefined}
          >
            <LogOut size={20} className={cn(
              "shrink-0 group-hover:rotate-12 transition-transform",
              (isCollapsed && !isMobileOpen) ? "" : "mr-3"
            )} />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">Sair do App</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
