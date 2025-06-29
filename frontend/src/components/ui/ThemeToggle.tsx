import React from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Saved theme:', savedTheme, 'Prefers dark:', prefersDark);
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="relative h-6 w-6">
        <span
          className={`absolute inset-0 transform transition-transform duration-500 ${
            isDark ? 'rotate-0' : 'rotate-90 opacity-0'
          }`}
        >
          <HiMoon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </span>
        <span
          className={`absolute inset-0 transform transition-transform duration-500 ${
            isDark ? '-rotate-90 opacity-0' : 'rotate-0'
          }`}
        >
          <HiSun className="h-6 w-6 text-yellow-500" />
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle; 