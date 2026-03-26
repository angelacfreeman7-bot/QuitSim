"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface SimSliderProps {
  label: string;
  icon: LucideIcon;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  suffix?: string;
}

export function SimSlider({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
  step,
  format,
  suffix = "",
}: SimSliderProps) {
  const display = format ? format(value) : `${value}${suffix}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm">{label}</Label>
        </div>
        <span className="text-sm font-bold font-mono tabular-nums">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
    </div>
  );
}
