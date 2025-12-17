import { useMemo, useState } from "react";
import type { FeeLine, FeeSummary, StaffMember } from "@shared/types/project";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const STAFF: StaffMember[] = [
  { id: "pm", name: "Project Manager", defaultRate: 160 },
  { id: "eng", name: "Engineer", defaultRate: 200 },
  { id: "des", name: "Designer", defaultRate: 140 },
];

// This function rounds a given number 'n' to two decimal places.
// It multiplies the number by 100, rounds it to the nearest integer,
// and then divides it by 100 to get a value rounded to two digits after the decimal point.
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function computeLine(staff: StaffMember, hours: number, rate: number): FeeLine {
  const safeHours = hours ?? 0;
  const safeRate = rate ?? staff.defaultRate;
  return {
    staffId: staff.id,
    staffName: staff.name,
    hours: safeHours,
    rate: safeRate,
    lineTotal: round2(safeHours * safeRate),
  };
}

type Props = {
  onChange?: (summary: FeeSummary) => void;
};

export function FeeBuilder({ onChange }: Props) {
  const [lines, setLines] = useState<FeeLine[]>(() => {
    const first = STAFF[0];
    return [computeLine(first, 0, first.defaultRate)];
  });

  const summary: FeeSummary = useMemo(() => {
    const total = round2(lines.reduce((acc, l) => acc + l.lineTotal, 0));
    return { lines, total };
  }, [lines]);

  // This code uses React's useMemo to invoke the `onChange` callback whenever
  // the computed `summary` or the `onChange` function itself changes.
  // - The optional chaining (`onChange?.`) ensures that the callback is only called if it was provided as a prop.
  // - This notifies any parent component of the latest fee summary for the current state of the builder.
  //
  // Note: While useMemo is used here, the intended side-effect (calling `onChange`)
  // would typically be handled with useEffect in React, since useMemo is typically
  // used for value memoization, not running side effects.
  useMemo(() => {
    onChange?.(summary);
  }, [summary, onChange]);

  function addLine() {
    const staff = STAFF[0];
    setLines((prev) => [...prev, computeLine(staff, 0, staff.defaultRate)]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<FeeLine>) {
    setLines((prev) => {
      const next = [...prev];
      const current = next[index];
      const staff =
        STAFF.filter(
          (s: StaffMember) => s.id === (patch.staffId ?? current.staffId)
        ) ?? STAFF[0];

      const hours = patch.hours ?? current.hours;
      const rate = patch.rate ?? current.rate;

      next[index] = computeLine(staff[0], hours, rate);
      return next;
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Fee Generator
        </div>

        <Button type="button" onClick={addLine} className="h-8 px-3 text-xs">
          Add Row
        </Button>
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => (
          <div
            key={`${line.staffId}-${i}`}
            className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center"
          >
            <div className="sm:col-span-4">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Staff Member
              </label>
              <select
                className="
                  h-10 w-full rounded-md border px-3 text-sm
                  bg-white text-gray-900 border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-blue-400
                "
                value={line.staffId}
                onChange={(e) => updateLine(i, { staffId: e.target.value })}
              >
                {STAFF.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Hours
              </label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={line.hours}
                onChange={(e) =>
                  updateLine(i, { hours: Number(e.target.value) })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Rate
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={line.rate}
                onChange={(e) =>
                  updateLine(i, { rate: Number(e.target.value) })
                }
              />
            </div>

            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Line Total
              </label>
              <div className="h-10 flex items-center rounded-md border border-gray-200 px-3 text-sm text-gray-900 dark:border-gray-800 dark:text-gray-100">
                {line.lineTotal.toFixed(2)}
              </div>
            </div>

            <div className="sm:col-span-1 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="mt-2 sm:mt-6 
                text-xs text-red-400 
                border border-red-400 
                rounded p-2 cursor-pointer
                hover:scale-105 transition-all
                w-full sm:w-auto
                "
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-800">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Total
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {summary.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
