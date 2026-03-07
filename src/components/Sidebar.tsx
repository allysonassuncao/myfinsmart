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
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
}

export default function Sidebar({ isMobileOpen, toggleMobileSidebar }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  
  const menuItems: MenuItem[] = [
    { name: 'Início', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Transações', path: '/transactions', icon: <CreditCard size={20} /> },
    { name: 'Parcelamentos', path: '/installments', icon: <Receipt size={20} /> },
    { name: 'Calendário', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Relatório por categoria', path: '/category-report', icon: <BarChart2 size={20} /> },
    { name: 'Aplicativo', path: '/tokens', icon: <Key size={20} /> },
    { 
      name: 'Configurações', 
      path: '/settings', 
      icon: <Settings size={20} />,
      submenu: [
        { name: 'Categorias', path: '/categories', icon: <Tag size={16} /> },
        { name: 'Subcategorias', path: '/subcategories', icon: <Layers size={16} /> },
        { name: 'Cartões de crédito', path: '/credit-cards', icon: <CreditCard size={16} /> },
        { name: 'Termos personalizados', path: '/custom-terms', icon: <FileText size={16} /> },
        { name: 'Minha conta', path: '/settings', icon: <User size={16} /> },
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
    setExpandedMenus(prev => ({
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out w-64 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center p-4 border-b">
          <div className="bg-[#11ab77] p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold">FinSmart</span>
        </div>
        
        <nav className="mt-6 px-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-2">
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                        isActive(item.path) || isSubmenuActive(item.submenu)
                          ? 'bg-[#11ab77] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {expandedMenus[item.name] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <div className={`mt-2 ml-8 space-y-2 transition-all duration-200 ${
                      expandedMenus[item.name] ? 'block' : 'hidden'
                    }`}>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`submenu-item flex items-center p-2 rounded-lg transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-[#e6f7f1] text-[#11ab77]'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          <span className="text-sm">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#11ab77] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={handleSubmenuClick}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
            
            <li className="mb-2">
              <button
                onClick={handleSignOut}
                className="flex items-center p-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3"><LogOut size={20} /></span>
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-4 w-full px-4">
          <div className="bg-[#e6f7f1] p-4 rounded-lg text-center">
            <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign className="h-6 w-6 text-[#11ab77]" />
            </div>
            <h3 className="font-bold text-[#0e8c61]">FinSmart Anual</h3>
            <p className="text-xs text-[#0e8c61] mt-1 mb-3">
              Economize ainda mais com o plano anual: R$ 79,90.
            </p>
            <button className="bg-white text-[#11ab77] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f0faf7] transition-colors">
              Assinar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}