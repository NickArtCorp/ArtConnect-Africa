import { useLanguageStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages, t } = useLanguageStore();
  const currentLang = availableLanguages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLang?.flag} {language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.nav.languages}
          </p>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`cursor-pointer gap-3 ${language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{lang.nativeLabel}</span>
                <span className="text-xs text-muted-foreground">{lang.label}</span>
              </div>
              {language === lang.code && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
