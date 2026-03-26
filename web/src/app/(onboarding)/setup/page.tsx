"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSimStore } from "@/stores/useSimStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, DollarSign, PiggyBank, CreditCard, TrendingUp, ArrowRight, Mic, Loader2, MessageSquare, Send } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
  }
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function SetupPage() {
  const router = useRouter();
  const { setProfile, setOnboarded, simulate } = useSimStore();
  const [zip, setZip] = useState("");
  const [salary, setSalary] = useState(85000);
  const [savings, setSavings] = useState(30000);
  const [expenses, setExpenses] = useState(3500);
  const [investments, setInvestments] = useState(15000);
  const [debt, setDebt] = useState(0);
  const [listening, setListening] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [dreamText, setDreamText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleFinish = () => {
    setProfile({ zip, city: "", state: "", salary, savings, monthlyExpenses: expenses, investments, debt });
    simulate();
    setOnboarded(true);
    router.push("/dashboard");
  };

  const applyParsedDream = (data: {
    salary?: number;
    savings?: number;
    monthlyExpenses?: number;
    investments?: number;
    debt?: number;
  }) => {
    if (data.salary != null) setSalary(data.salary);
    if (data.savings != null) setSavings(data.savings);
    if (data.monthlyExpenses != null) setExpenses(data.monthlyExpenses);
    if (data.investments != null) setInvestments(data.investments);
    if (data.debt != null) setDebt(data.debt);
  };

  const sendDreamText = async (text: string) => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/ai/parse-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to parse dream");
      const data = await res.json();
      applyParsedDream(data);
      setShowTextFallback(false);
      setDreamText("");
    } catch (err) {
      console.error("Error parsing dream:", err);
    } finally {
      setParsing(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowTextFallback(true);
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendDreamText(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-available") {
        setShowTextFallback(true);
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const handleTextFallbackSubmit = () => {
    sendDreamText(dreamText);
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <h1 className="mb-2 text-2xl font-bold">Your financial snapshot</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Drag the sliders or type exact numbers. We&apos;ll crunch the rest.
        </p>

        <div className="space-y-6">
          {/* ZIP */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium">ZIP Code</Label>
              </div>
              <Input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g. 10001"
                maxLength={5}
                className="text-lg font-mono"
              />
              <p className="mt-2 text-xs text-muted-foreground">Used for cost-of-living adjustments</p>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-sm font-medium">Annual Salary</Label>
                </div>
                <span className="text-lg font-bold font-mono">{formatCurrency(salary)}</span>
              </div>
              <Slider
                value={[salary]}
                onValueChange={(val) => setSalary(Array.isArray(val) ? val[0] : val)}
                min={20000}
                max={500000}
                step={5000}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$20k</span>
                <span>$500k</span>
              </div>
            </CardContent>
          </Card>

          {/* Savings */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-sm font-medium">Total Savings</Label>
                </div>
                <span className="text-lg font-bold font-mono">{formatCurrency(savings)}</span>
              </div>
              <Slider
                value={[savings]}
                onValueChange={(val) => setSavings(Array.isArray(val) ? val[0] : val)}
                min={0}
                max={500000}
                step={1000}
                className="py-4"
              />
            </CardContent>
          </Card>

          {/* Monthly Expenses */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-sm font-medium">Monthly Expenses</Label>
                </div>
                <span className="text-lg font-bold font-mono">{formatCurrency(expenses)}</span>
              </div>
              <Slider
                value={[expenses]}
                onValueChange={(val) => setExpenses(Array.isArray(val) ? val[0] : val)}
                min={500}
                max={20000}
                step={100}
                className="py-4"
              />
            </CardContent>
          </Card>

          {/* Investments */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-sm font-medium">Investments</Label>
                </div>
                <span className="text-lg font-bold font-mono">{formatCurrency(investments)}</span>
              </div>
              <Slider
                value={[investments]}
                onValueChange={(val) => setInvestments(Array.isArray(val) ? val[0] : val)}
                min={0}
                max={1000000}
                step={5000}
                className="py-4"
              />
            </CardContent>
          </Card>

          {/* Debt */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-destructive" />
                  <Label className="text-sm font-medium">Outstanding Debt</Label>
                </div>
                <span className="text-lg font-bold font-mono">{formatCurrency(debt)}</span>
              </div>
              <Slider
                value={[debt]}
                onValueChange={(val) => setDebt(Array.isArray(val) ? val[0] : val)}
                min={0}
                max={200000}
                step={1000}
                className="py-4"
              />
            </CardContent>
          </Card>

          {/* Voice input */}
          <AnimatePresence>
            <motion.div layout>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14"
                onClick={handleVoice}
                disabled={parsing}
              >
                {parsing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Parsing your dream...
                  </>
                ) : listening ? (
                  <>
                    <Mic className="mr-2 h-5 w-5 text-red-500 animate-pulse" />
                    Listening... (tap to stop)
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Tell me your dream (voice)
                  </>
                )}
              </Button>

              {/* Text fallback for unsupported browsers */}
              <AnimatePresence>
                {showTextFallback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Voice not available — type your dream instead
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={dreamText}
                            onChange={(e) => setDreamText(e.target.value)}
                            placeholder='e.g. "I make $95k, have $50k saved, spend $4k/month..."'
                            onKeyDown={(e) => e.key === "Enter" && handleTextFallbackSubmit()}
                            disabled={parsing}
                          />
                          <Button
                            size="icon"
                            onClick={handleTextFallbackSubmit}
                            disabled={parsing || !dreamText.trim()}
                          >
                            {parsing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Submit */}
          <Button size="lg" className="w-full h-14 text-base" onClick={handleFinish}>
            See my runway
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed">
            All calculations run on your device. Voice/text dream parsing may send
            your description to an AI provider to extract numbers. No data is stored
            on our servers.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
