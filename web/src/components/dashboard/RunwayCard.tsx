"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

interface RunwayCardProps {
  months: number;
  freedomDate: string | null;
}

export function RunwayCard({ months, freedomDate }: RunwayCardProps) {
  const freedomFormatted = freedomDate
    ? new Date(freedomDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Not yet";

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-5">
            <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
            <span className="text-3xl font-bold tabular-nums">{months}</span>
            <span className="text-xs text-muted-foreground">Runway months</span>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-5">
            <Calendar className="mb-2 h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold">{freedomFormatted}</span>
            <span className="text-xs text-muted-foreground">Freedom date</span>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
