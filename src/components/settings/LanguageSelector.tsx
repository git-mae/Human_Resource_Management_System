
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value as "en" | "es" | "fr");
    document.documentElement.setAttribute("lang", value);
    // Apply any immediate text translations here if needed
  };

  useEffect(() => {
    // Set the page language on component mount
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
