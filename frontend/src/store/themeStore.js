import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light', 'dark', or 'system'
      isDark: false,

      // Set theme
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      // Apply theme to document
      applyTheme: (theme) => {
        const root = window.document.documentElement;
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.remove('light', 'dark');
          root.classList.add(systemTheme);
          set({ isDark: systemTheme === 'dark' });
        } else {
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
          set({ isDark: theme === 'dark' });
        }
      },

      // Toggle between light and dark
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // Initialize theme
      initTheme: () => {
        const { theme } = get();
        get().applyTheme(theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (get().theme === 'system') {
            get().applyTheme('system');
          }
        });
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
);

export default useThemeStore;

// Made with Bob
