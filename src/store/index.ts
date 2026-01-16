import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FleetCategory } from '@/lib/constants';

interface SidebarState {
  isCollapsed: boolean;
  expandedCategories: FleetCategory[];
  toggleCollapsed: () => void;
  toggleCategory: (category: FleetCategory) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      expandedCategories: [],
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCategory: (category) =>
        set((state) => ({
          expandedCategories: state.expandedCategories.includes(category)
            ? state.expandedCategories.filter((c) => c !== category)
            : [...state.expandedCategories, category],
        })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

interface AppState {
  selectedFleetNumber: string | null;
  searchQuery: string;
  setSelectedFleetNumber: (fleetNumber: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  selectedFleetNumber: null,
  searchQuery: '',
  setSelectedFleetNumber: (fleetNumber) => set({ selectedFleetNumber: fleetNumber }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: Date;
  }>;
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
