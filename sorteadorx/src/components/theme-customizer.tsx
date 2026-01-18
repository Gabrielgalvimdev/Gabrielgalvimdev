"use client";

import * as React from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const colorThemes = [
    {
        name: 'blue',
        label: 'Azul',
        color: 'hsl(203 66% 53%)',
        vars: {
            light: { '--background': '208 100% 97%', '--primary': '203 66% 83%', '--accent': '264 60% 85%', '--ring': '203 66% 73%' },
            dark: { '--background': '222.2 84% 4.9%', '--primary': '203 66% 73%', '--accent': '264 60% 75%', '--ring': '203 66% 83%' }
        }
    },
    {
        name: 'green',
        label: 'Verde',
        color: 'hsl(150 75% 40%)',
        vars: {
            light: { '--background': '140 70% 97%', '--primary': '150 75% 80%', '--accent': '160 70% 85%', '--ring': '150 80% 60%' },
            dark: { '--background': '145 60% 5%', '--primary': '150 75% 70%', '--accent': '160 70% 75%', '--ring': '150 80% 70%' }
        }
    },
    {
        name: 'orange',
        label: 'Laranja',
        color: 'hsl(30 95% 50%)',
        vars: {
            light: { '--background': '24 90% 97%', '--primary': '30 95% 80%', '--accent': '40 90% 85%', '--ring': '35 90% 60%' },
            dark: { '--background': '20 80% 5%', '--primary': '30 95% 70%', '--accent': '40 90% 75%', '--ring': '35 90% 70%' }
        }
    }
];

const fontStyles = [
    { name: 'default', label: 'Padrão (Playfair/PT Sans)', className: 'font-body' },
    { name: 'inter', label: 'Inter', className: 'font-inter' },
    { name: 'source-code', label: 'Código Fonte', className: 'font-code' },
];

export function ThemeCustomizer() {
  const { setTheme: setMode, theme: mode } = useTheme();
  const [activeColor, setActiveColor] = React.useState("blue");
  const [activeFont, setActiveFont] = React.useState("default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const savedColor = localStorage.getItem("theme-color") ?? "blue";
    const savedFont = localStorage.getItem("theme-font") ?? "default";
    setActiveColor(savedColor);
    setActiveFont(savedFont);
  }, [mounted]);
  
  React.useEffect(() => {
    if (!mounted) return;
    const theme = colorThemes.find((t) => t.name === activeColor);
    if (theme) {
      const themeMode = mode === 'dark' ? 'dark' : (mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'light');
      Object.entries(theme.vars[themeMode]).forEach(([key, value]) => {
         document.documentElement.style.setProperty(key, value);
      });
      localStorage.setItem("theme-color", activeColor);
    }
  }, [activeColor, mode, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    document.body.classList.remove(...fontStyles.map(f => f.className));
    
    const font = fontStyles.find((f) => f.name === activeFont);
    if (font) {
      document.body.classList.add(font.className);
    }
    
    localStorage.setItem("theme-font", activeFont);
  }, [activeFont, mounted]);
  
  if (!mounted) {
    return <Button variant="ghost" size="sm" disabled><Palette className="mr-2 h-4 w-4" />Personalizar</Button>;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm"><Palette className="mr-2 h-4 w-4" />Personalizar</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Personalizar Aparência</SheetTitle>
          <SheetDescription>
            Ajuste o visual do aplicativo para a sua preferência.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-8 py-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Modo</h4>
            <div className="grid grid-cols-3 gap-2">
                <Button variant={mode === 'light' ? 'secondary' : 'outline'} onClick={() => setMode('light')}><Sun className="mr-2" />Claro</Button>
                <Button variant={mode === 'dark' ? 'secondary' : 'outline'} onClick={() => setMode('dark')}><Moon className="mr-2" />Escuro</Button>
                <Button variant={mode === 'system' ? 'secondary' : 'outline'} onClick={() => setMode('system')}>Sistema</Button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Cor</h4>
            <div className="flex flex-wrap gap-2">
              {colorThemes.map((theme) => (
                <Button
                  key={theme.name}
                  variant={activeColor === theme.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveColor(theme.name)}
                >
                  <span
                    className={cn("mr-2 h-5 w-5 rounded-full flex items-center justify-center border")}
                    style={{ backgroundColor: theme.color }}
                  >
                    {activeColor === theme.name && <Check className="h-4 w-4 text-white" />}
                  </span>
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
             <h4 className="text-sm font-medium">Fonte</h4>
             <div className="space-y-2">
                {fontStyles.map((font) => (
                    <Button
                        key={font.name}
                        variant={activeFont === font.name ? 'secondary' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveFont(font.name)}
                    >
                        {activeFont === font.name && <Check className="mr-2 h-4 w-4" />}
                        {font.label}
                    </Button>
                ))}
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
