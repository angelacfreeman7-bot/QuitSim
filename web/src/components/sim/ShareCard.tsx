"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, Check, Loader2 } from "lucide-react";
import { SimResult } from "@/types";

interface ShareCardProps {
  result: SimResult;
  city: string;
  state: string;
}

export function ShareCard({ result, city, state }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const getConfidenceColor = (v: number) => {
    if (v >= 70) return "from-green-500 to-emerald-600";
    if (v >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-600";
  };

  const getConfidenceLabel = (v: number) => {
    if (v >= 80) return "Ready to Quit";
    if (v >= 60) return "Getting There";
    if (v >= 40) return "Needs Work";
    return "Not Yet";
  };

  const shareText = `My QuitSim Score: ${result.quitConfidence}% quit confidence | ${result.runwayMonths} months runway | ${result.monteCarlo.successRate}% Monte Carlo success rate. Find your freedom date at quitsim.it.com`;

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.error("Failed to generate image:", e);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quitsim-${result.quitConfidence}pct.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateImage, result.quitConfidence]);

  const handleShare = useCallback(async () => {
    // Try sharing as image first (mobile)
    if (navigator.share) {
      const blob = await generateImage();
      if (blob && navigator.canShare?.({ files: [new File([blob], "quitsim.png", { type: "image/png" })] })) {
        const file = new File([blob], "quitsim.png", { type: "image/png" });
        await navigator.share({
          title: "My QuitSim Results",
          text: shareText,
          files: [file],
        });
        return;
      }
      // Fallback: text-only share
      await navigator.share({ title: "My QuitSim Results", text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateImage, shareText]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText]);

  return (
    <div className="space-y-3">
      {/* Branded share card — captured by html-to-image */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div ref={cardRef}>
          <Card className="overflow-hidden border-border/50">
            {/* Gradient header */}
            <div
              className={`bg-gradient-to-r ${getConfidenceColor(result.quitConfidence)} px-5 py-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">QuitSim</p>
                  <p className="text-2xl font-bold text-white">
                    {result.quitConfidence}% Confidence
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-xl font-bold text-white">
                    {getConfidenceLabel(result.quitConfidence).charAt(0)}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-white/80">
                {getConfidenceLabel(result.quitConfidence)}
              </p>
            </div>

            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.runwayMonths}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Months Runway
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.monteCarlo.successRate}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Monte Carlo
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.monteCarlo.median}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Median Months
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">QS</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">quitsim.it.com</p>
                    <p className="text-[9px] text-muted-foreground">
                      {city}, {state}
                    </p>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-10"
          onClick={handleShare}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="mr-2 h-4 w-4" />
          )}
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10"
          onClick={handleDownload}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Save PNG
        </Button>
        <Button variant="outline" size="sm" className="h-10" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
