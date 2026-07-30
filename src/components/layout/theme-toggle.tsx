"use client";

import { Segment } from "@heroui-pro/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div aria-hidden className="h-7 w-[100px]" />;
  }

  return (
    <Segment
      aria-label="Theme"
      size="sm"
      selectedKey={theme ?? "system"}
      onSelectionChange={(key) => setTheme(String(key))}
    >
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <Segment.Item key={value} id={value} aria-label={label}>
          <Icon aria-hidden className="size-4" />
        </Segment.Item>
      ))}
    </Segment>
  );
}

export default ThemeToggle;
