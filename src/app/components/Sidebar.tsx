import {
  Navigation,
  FileText,
  BarChart3,
  Home,
  Users,
  User,
  Settings,
  LogOut,
  MessagesSquare,
  Menu,
  X,
  Check,
  ClipboardList,
  Link,
  ChevronDown,
  ChevronsUpDown,
  BookOpen,
  PanelLeft,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { AppView } from '../types/navigation';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import logoImage from '../../assets/un-somalia-logo.png';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const NAV_ICON_SIZE = 17;
const NAV_ICON_STROKE = 1.75;

const ADMIN_NAV_ITEMS: {
  view: AppView;
  label: string;
  icon: LucideIcon;
  badge?: number;
}[] = [
  { view: 'adminDashboard', label: 'Admin Dashboard', icon: BarChart3 },
  { view: 'approvals', label: 'Approvals', icon: Check, badge: 4 },
  { view: 'usersAccess', label: 'Users and Access', icon: Users },
  { view: 'definitions', label: 'Definitions', icon: BookOpen },
  { view: 'resources', label: 'Resources', icon: FileText },
  { view: 'links', label: 'URL Sources', icon: Link },
  { view: 'auditTrails', label: 'Audit Trails', icon: ClipboardList },
];

function NavTooltip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        variant="muted"
        showArrow={false}
        className="z-[1280] rounded-full px-4 py-2 text-sm font-medium border-border bg-card shadow-md"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function navItemClass(isActive: boolean, collapsed: boolean) {
  return cn(
    'nav-item',
    isActive && 'nav-item--active',
    collapsed && 'nav-item--collapsed',
  );
}

function SidebarNavGroup({ children }: { children: ReactNode }) {
  return <div className="nav-list">{children}</div>;
}

function SidebarDivider() {
  return (
    <div className="nav-divider" role="separator">
      <hr className="nav-divider__line" />
    </div>
  );
}

function SidebarNavItem({
  label,
  icon: Icon,
  isActive,
  collapsed,
  onClick,
  trailing,
  className,
}: {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <NavTooltip label={label} show={collapsed}>
      <button
        type="button"
        onClick={onClick}
        className={cn(navItemClass(isActive, collapsed), 'relative', className)}
      >
        <Icon size={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE} className="shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && trailing}
      </button>
    </NavTooltip>
  );
}

interface SidebarProps {
  currentView?: AppView | 'aiSearch';
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
  onOpenSharedThread?: (threadId: string) => void;
  onOpenInvitePreview?: (threadId: string) => void;
  hideMobileMenuButton?: boolean;
  showFixedMobileMenuButton?: boolean;
  isRiskIqActive?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function readSidebarCollapsedPreference(): boolean {
  try {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  } catch {
    return false;
  }
}

function persistSidebarCollapsedPreference(collapsed: boolean) {
  try {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  } catch {
    /* ignore */
  }
}

export function Sidebar({
  currentView,
  onNavigate,
  onLogout,
  hideMobileMenuButton = false,
  showFixedMobileMenuButton = false,
  isRiskIqActive = false,
  mobileMenuOpen: controlledMobileMenuOpen,
  onMobileMenuOpenChange,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(readSidebarCollapsedPreference);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileMenuControlled = controlledMobileMenuOpen !== undefined;
  const isMobileMenuOpen = isMobileMenuControlled
    ? controlledMobileMenuOpen
    : internalMobileMenuOpen;
  const setIsMobileMenuOpen = (open: boolean) => {
    if (isMobileMenuControlled) {
      onMobileMenuOpenChange?.(open);
    } else {
      setInternalMobileMenuOpen(open);
    }
  };
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const isAdminView =
    currentView === 'adminDashboard' ||
    currentView === 'approvals' ||
    currentView === 'usersAccess' ||
    currentView === 'definitions' ||
    currentView === 'resources' ||
    currentView === 'links' ||
    currentView === 'auditTrails';

  const setCollapsed = (next: boolean) => {
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
    persistSidebarCollapsedPreference(next);
    setIsAdminExpanded(false);
    setIsProfileMenuOpen(false);
  };

  const toggleCollapsed = () => {
    setCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminExpanded(false);
      }
    };

    if (isProfileMenuOpen || isAdminExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isAdminExpanded]);

  useEffect(() => {
    if (hideMobileMenuButton) {
      setIsMobileMenuOpen(false);
    }
  }, [hideMobileMenuButton]);

  useEffect(() => {
    if (isAdminView) {
      setIsAdminExpanded(true);
    }
  }, [currentView, isAdminView]);

  const handleNavigate = (view: AppView) => {
    onNavigate?.(view);
    setIsMobileMenuOpen(false);
    const isAdminSubNav = ADMIN_NAV_ITEMS.some((item) => item.view === view);
    if (isAdminSubNav) {
      setIsAdminExpanded(true);
    } else {
      setIsAdminExpanded(false);
    }
  };

  return (
    <>
      {!hideMobileMenuButton && (showFixedMobileMenuButton || !isMobileMenuControlled) && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-5 left-4 z-[1300] size-10 shadow-lg"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X size={20} className="text-foreground" />
          ) : (
            <Menu size={20} className="text-foreground" />
          )}
        </Button>
      )}

      {!hideMobileMenuButton && isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[1260]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 flex flex-col z-[1270]',
          'transform transition-all duration-300 ease-in-out',
          'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-[var(--sidebar-w)]',
          isCollapsed && 'lg:w-[var(--sidebar-w-collapsed)]',
        )}
      >
        <TooltipProvider delayDuration={0}>
          {/* Logo + collapse */}
          <div
            className={cn(
              'bg-[var(--sidebar-bg)] shrink-0',
              isCollapsed ? 'px-3 pt-4 pb-3' : 'px-3 pt-4 pb-3',
            )}
          >
            <div
              className={cn(
                'flex items-center',
                isCollapsed ? 'justify-center' : 'justify-between gap-2',
              )}
            >
              {!isCollapsed && (
                <img
                  src={logoImage}
                  alt="United Nations Somalia"
                  className="max-w-[calc(var(--sidebar-w)-56px)] h-auto"
                />
              )}
              <button
                type="button"
                onClick={toggleCollapsed}
                className={cn(
                  'hidden lg:flex size-9 items-center justify-center rounded-lg transition-colors',
                  'text-[var(--sidebar-nav-text)] hover:bg-[var(--sidebar-nav-hover-bg)] hover:text-[var(--sidebar-nav-text-hover)]',
                  isCollapsed ? '' : 'ml-auto shrink-0',
                )}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <PanelLeft size={17} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-auto nav-section">
            <div className="nav-stack">
              <SidebarNavGroup>
                <SidebarNavItem
                  label="Home"
                  icon={Home}
                  isActive={currentView === 'home'}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('home')}
                />
                <SidebarNavItem
                  label="Chats"
                  icon={MessagesSquare}
                  isActive={currentView === 'platformChats'}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('platformChats')}
                />
              </SidebarNavGroup>

              <SidebarDivider />

              <SidebarNavGroup>
                <SidebarNavItem
                  label="Resources"
                  icon={BookOpen}
                  isActive={currentView === 'resourcesHub'}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('resourcesHub')}
                />
                <SidebarNavItem
                  label="Maps"
                  icon={Navigation}
                  isActive={currentView === 'mapAI'}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('mapAI')}
                />
                <SidebarNavItem
                  label="Reports"
                  icon={FileText}
                  isActive={currentView === 'reports'}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('reports')}
                />
              </SidebarNavGroup>

              <SidebarDivider />

              <SidebarNavGroup>
                <SidebarNavItem
                  label="Risk iQ"
                  icon={Shield}
                  isActive={isRiskIqActive}
                  collapsed={isCollapsed}
                  onClick={() => handleNavigate('riskIQ')}
                />
              </SidebarNavGroup>

              <SidebarDivider />

              <SidebarNavGroup>
                <div ref={adminMenuRef}>
                <NavTooltip label="Admin" show={isCollapsed && !isAdminExpanded}>
                  <button
                    type="button"
                    onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                    className={navItemClass(isAdminView, isCollapsed)}
                  >
                    <Settings size={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">Admin</span>}
                    <ChevronDown
                      size={isCollapsed ? 13 : 17}
                      strokeWidth={1.75}
                      className={cn(
                        'shrink-0 text-[var(--text-3)] transition-transform',
                        !isCollapsed && 'ml-auto',
                        isAdminExpanded && 'rotate-180',
                      )}
                    />
                  </button>
                </NavTooltip>

                {isAdminExpanded && (
                  <div
                    className={cn(
                      'nav-list',
                      isCollapsed ? 'mt-0.5' : 'mt-0.5 ml-2 pl-2 border-l border-[var(--sidebar-divider)]',
                    )}
                  >
                    {ADMIN_NAV_ITEMS.map(({ view, label, icon: Icon, badge }) => (
                      <NavTooltip key={view} label={label} show={isCollapsed}>
                        <button
                          type="button"
                          onClick={() => handleNavigate(view)}
                          className={cn(navItemClass(currentView === view, isCollapsed), 'relative')}
                        >
                          <Icon size={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE} className="shrink-0" />
                          {!isCollapsed && <span className="truncate">{label}</span>}
                          {badge != null && !isCollapsed && (
                            <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center">
                              {badge}
                            </span>
                          )}
                          {badge != null && isCollapsed && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-xs font-semibold flex items-center justify-center leading-none tabular-nums">
                              {badge}
                            </span>
                          )}
                        </button>
                      </NavTooltip>
                    ))}
                  </div>
                )}
                </div>
              </SidebarNavGroup>
            </div>
          </nav>

          {/* Footer: Profile */}
          <div
            ref={menuRef}
            className="relative shrink-0 border-t p-2.5 flex flex-col gap-0.5"
            style={{ borderColor: 'var(--sidebar-footer-border)' }}
          >
            {isProfileMenuOpen && (
              <div
                className={cn(
                  'absolute mb-2 bg-[var(--sidebar-bg)] border rounded-xl shadow-xl overflow-hidden z-50',
                  isCollapsed
                    ? 'left-full bottom-0 ml-2 w-[var(--sidebar-w)]'
                    : 'bottom-full left-2.5 right-2.5',
                )}
                style={{ borderColor: 'var(--sidebar-divider)' }}
              >
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate?.('profile');
                      setIsProfileMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--sidebar-nav-text)] hover:bg-[var(--sidebar-nav-hover-bg)] hover:text-[var(--sidebar-nav-text-hover)] transition-colors"
                  >
                    <User size={17} strokeWidth={1.75} />
                    <span>My Profile</span>
                  </button>
                  <div
                    className="h-px my-1 mx-2"
                    style={{ backgroundColor: 'var(--sidebar-divider)' }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start gap-2.5 px-3 py-2.5 h-auto text-sm text-destructive-text hover:bg-destructive-subtle hover:text-destructive-text"
                  >
                    <LogOut size={17} strokeWidth={1.75} />
                    Sign out
                  </Button>
                </div>
              </div>
            )}

            <NavTooltip label="Amina Mohamed" show={isCollapsed && !isProfileMenuOpen}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={cn(
                  'w-full flex items-center rounded-[8px] transition-colors',
                  'hover:bg-[var(--sidebar-nav-hover-bg)]',
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
                )}
              >
                <div
                  className={cn(
                    'rounded-full bg-[var(--sidebar-nav-active-text)] flex items-center justify-center text-white font-bold shrink-0',
                    'w-[34px] h-[34px] text-xs tracking-[0.02em]',
                  )}
                >
                  AM
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-label text-foreground truncate">
                        Amina Mohamed
                      </div>
                      <div
                        className="text-xs font-normal truncate"
                        style={{ color: 'var(--text-3)' }}
                      >
                        Field Coordinator
                      </div>
                    </div>
                    <ChevronsUpDown
                      size={13}
                      strokeWidth={1.75}
                      className="shrink-0"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </>
                )}
              </button>
            </NavTooltip>
          </div>
        </TooltipProvider>
      </aside>
    </>
  );
}
