"use client";

import {
  ComputerIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: Sun01Icon,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon01Icon,
  },
  {
    value: "system",
    label: "System",
    icon: ComputerIcon,
  },
] as const;

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[100px]" />;
  }

  return (
    <div>
      <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
        <SelectTrigger aria-label="Select theme" className="w-[100px]">
          <SelectValue>
            {(value) => {
              const option = themeOptions.find((o) => o.value === value);
              if (!option) return null;
              return (
                <>
                  <HugeiconsIcon
                    icon={option.icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                  <span>{option.label}</span>
                </>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {themeOptions.map(({ value, label, icon }) => (
            <SelectItem key={value} value={value}>
              <HugeiconsIcon icon={icon} className="size-4" strokeWidth={2} />
              <span>{label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeToggle;
