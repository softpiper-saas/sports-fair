"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decrement, increment } from "@/store/slices/counter-slice";

export function CounterPanel() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <aside className="rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Redux counter</h2>
          <p className="text-sm text-muted-foreground">Client state is ready through Redux Toolkit.</p>
        </div>
        <span className="flex h-10 min-w-10 items-center justify-center rounded-md bg-secondary px-3 text-lg font-semibold">
          {count}
        </span>
      </div>
      <div className="mt-5 flex gap-3">
        <Button aria-label="Decrease counter" size="icon" variant="outline" onClick={() => dispatch(decrement())}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button aria-label="Increase counter" size="icon" onClick={() => dispatch(increment())}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
