"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { quizSetupSchema, type QuizSetupInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type CategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  questionCount: number;
};

export function QuizSetupForm({
  categories,
  defaultCategoryId,
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  // Three generics because quizSetupSchema's fields carry `.default()`:
  // the raw field values RHF holds (z.input) are optional, while the
  // value handleSubmit's callback receives (z.output, = QuizSetupInput)
  // has defaults already applied. See docs/multi-domain-playbook.md.
  const { control, handleSubmit } = useForm<
    z.input<typeof quizSetupSchema>,
    unknown,
    QuizSetupInput
  >({
    resolver: zodResolver(quizSetupSchema),
    defaultValues: {
      categoryId: defaultCategoryId,
      count: 10,
      mode: "normal",
      timerSeconds: 20,
      order: "random",
    },
  });
  // useWatch (not form.watch) so React Compiler can memoize this component.
  const mode = useWatch({ control, name: "mode" }) ?? "normal";
  const count = useWatch({ control, name: "count" }) ?? 10;
  const timerSeconds = useWatch({ control, name: "timerSeconds" }) ?? 20;

  function onSubmit(values: QuizSetupInput) {
    const params = new URLSearchParams();
    if (values.categoryId) params.set("categoryId", values.categoryId);
    params.set("count", String(values.count));
    params.set("mode", values.mode);
    params.set("order", values.order);
    if (values.mode === "chrono") {
      params.set("timerSeconds", String(values.timerSeconds));
    }
    router.push(`/quiz/play?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value ?? "all"}
              onValueChange={(v) => field.onChange(v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name} ({c.questionCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Number of questions</Label>
          <span className="text-sm font-medium">{count}</span>
        </div>
        <Controller
          control={control}
          name="count"
          render={({ field }) => (
            <Slider
              min={1}
              max={30}
              step={1}
              value={[field.value ?? 10]}
              onValueChange={([v]) => field.onChange(v)}
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Mode</Label>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="chrono">Chrono (timed)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {mode === "chrono" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Seconds per question</Label>
            <span className="text-sm font-medium">{timerSeconds}s</span>
          </div>
          <Controller
            control={control}
            name="timerSeconds"
            render={({ field }) => (
              <Slider
                min={5}
                max={60}
                step={5}
                value={[field.value ?? 20]}
                onValueChange={([v]) => field.onChange(v)}
              />
            )}
          />
        </div>
      )}

      <Button type="submit" size="lg" className="w-full">
        Start quiz
      </Button>
    </form>
  );
}
