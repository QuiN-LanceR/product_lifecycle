"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useNavigateWithLoading } from "../hooks/useNavigateWithLoading";
import SidebarThemeToggle from "../components/common/SidebarThemeToggle";
import {
  DashboardIcon,
  ProductIcon,
  LifecycleIcon,
  ReportsIcon,
  UsersIcon,
  DashboardDarkIcon,
  ProductDarkIcon,
  LifecycleDarkIcon,
  ReportsDarkIcon,
  UsersDarkIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";

type NavItem = {
  name: string;
  lightIcon: React.ReactNode;
  darkIcon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    lightIcon: <DashboardIcon />,
    darkIcon: <DashboardDarkIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    lightIcon: <ProductIcon />,
    darkIcon: <ProductDarkIcon />,
    name: "Product Catalog",
    subItems: [
      { name: "Master Product", path: "/admin/product", pro: false },
      { name: "Kategori", path: "/admin/kategori", pro: false },
      { name: "Segmen", path: "/admin/segmen", pro: false },
      { name: "Stage", path: "/admin/stage", pro: false },
      { name: "Interval Stage", path: "/admin/interval", pro: false },
      { name: "Dev History", path: "/admin/devhistori", pro: false },
    ],
  },
  {
    lightIcon: <LifecycleIcon />,
    darkIcon: <LifecycleDarkIcon />,
    name: "Lifecycle Analyst",
    path: "/admin/lifecycle",
  },
  {
    lightIcon: <UsersIcon />,
    darkIcon: <UsersDarkIcon />,
    name: "Users Management",
    subItems: [
      { name: "Master Users", path: "/admin/users", pro: false },
      { name: "Role", path: "/admin/roles", pro: false },
      { name: "Job Position", path: "/admin/jabatan", pro: false },
    ],
  },
  {
    lightIcon: <ReportsIcon />,
    darkIcon: <ReportsDarkIcon />,
    name: "Report",
    path: "/admin/report",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const { navigateTo } = useNavigateWithLoading();

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);  

  const handleNavigation = (path: string) => {
    navigateTo(path); // Gunakan navigateTo, bukan navigateWithLoading
    // Close mobile sidebar after navigation
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {isDark ? nav.darkIcon : nav.lightIcon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <button
                onClick={() => handleNavigation(nav.path!)}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } w-full text-left`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {isDark ? nav.darkIcon : nav.lightIcon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </button>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <button
                      onClick={() => handleNavigation(subItem.path)}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      } w-full text-left`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex flex-col items-start space-y-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/admin/plniconplus.png"
                alt="Logo"
                width={80}
                height={80}
              />
              <Image
                className="hidden dark:block"
                src="/images/admin/plniconplus.png"
                alt="Logo"
                width={80}
                height={80}
              />
              <span className="text-xl font-bold text-gray-800 dark:text-white text-left">
                PLC MANAGER
              </span>
            </>
          ) : (
            <>
              <Image
                src="/images/admin/plniconplus.png"
                alt="Logo"
                width={70}
                height={70}
              />
              <span className="text-sm font-bold text-gray-800 dark:text-white text-center hidden sm:inline">
                PLC MANAGER
              </span>
            </>
          )}
        </Link>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "MENU"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Theme Toggle at Bottom */}
      <div className="mt-auto pb-4">
        <SidebarThemeToggle />
      </div>
    </aside>
  );
};

export default AppSidebar;