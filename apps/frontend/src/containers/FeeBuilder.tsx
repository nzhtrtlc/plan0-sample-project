import { useEffect, useMemo, useState } from "react";
import type { FeeLine, FeeSummary, StaffMember } from "@shared/types/project";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const STAFF: StaffMember[] = [
  { id: "pm", name: "Project Manager", defaultRate: 160 },
  { id: "eng", name: "Engineer", defaultRate: 200 },
  { id: "des", name: "Designer", defaultRate: 140 },
];

function computeLine(
  staff: StaffMember,
  hours: number = 0,
  rate?: number
): FeeLine {
  const safeRate = rate ?? staff.defaultRate;
  return {
    staffId: staff.id,
    staffName: staff.name,
    hours,
    rate: safeRate,
    lineTotal: Number((hours * safeRate).toFixed(2)),
  };
}

type Props = {
  onChange?: (summary: FeeSummary) => void;
};

export function FeeBuilder({ onChange }: Props) {
  const [lines, setLines] = useState<FeeLine[]>([
    computeLine(STAFF[0])
  ]);

  const summary: FeeSummary = useMemo(() => {
    const total = Number(
      lines.reduce((acc, l) => acc + l.lineTotal, 0).toFixed(2)
    );
    return { lines, total };
  }, [lines]);

  useEffect(() => {
    onChange?.(summary);
  }, [summary, onChange]);

  function addLine() {
    setLines((prev) => [...prev, computeLine(STAFF[0])]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<FeeLine>) {
    setLines((prev) => {
      const updatedLines = [...prev];
      const lineToUpdate = updatedLines[index];

      // If staffId is changing, use selected staff, otherwise keep
      const staff =
        STAFF.find((s) => s.id === (patch.staffId ?? lineToUpdate.staffId)) ||
        STAFF[0];

      const hours = patch.hours ?? lineToUpdate.hours;
      const rate = patch.rate ?? lineToUpdate.rate;

      updatedLines[index] = computeLine(staff, hours, rate);
      return updatedLines;
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
                onChange={e =>
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
                onChange={e =>
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

