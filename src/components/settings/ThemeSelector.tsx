
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant={theme === 'light' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('light')}
        className="transition-colors"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button 
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('dark')}
        className="transition-colors"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ThemeSelector;
