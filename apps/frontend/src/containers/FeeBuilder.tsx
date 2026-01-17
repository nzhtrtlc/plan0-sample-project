import type {
   FeeLine,
   FeeSummary,
   Mandate,
   ProposedMandate,
} from "@shared/types/proposal";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";

function computeLine(
   mandate: Mandate,
   hours: number = 0,
   rate?: number,
): FeeLine {
   const safeRate = rate ?? mandate.defaultRate;
   return {
      staffId: mandate.id,
      staffName: mandate.name,
      hours,
      rate: safeRate,
      lineTotal: Number((hours * safeRate).toFixed(2)),
   };
}

type Props = {
   selectedMandates: ProposedMandate[];
   onChange?: (summary: FeeSummary) => void;
};

export function FeeBuilder({ selectedMandates, onChange }: Props) {
   const mandates = useMemo<Mandate[]>(
      () =>
         selectedMandates.map((name) => ({
            id: name,
            name,
            defaultRate: 0,
         })),
      [selectedMandates],
   );

   const [lines, setLines] = useState<FeeLine[]>([]);

   const summary: FeeSummary = useMemo(() => {
      const total = Number(
         lines.reduce((acc, l) => acc + l.lineTotal, 0).toFixed(2),
      );
      return { lines, total };
   }, [lines]);

   useEffect(() => {
      onChange?.(summary);
   }, [summary, onChange]);

   useEffect(() => {
      if (mandates.length === 0) {
         setLines([]);
         return;
      }
      setLines(mandates.map((mandate) => computeLine(mandate)));
   }, [mandates]);

   function addLine() {
      if (mandates.length === 0) {
         return;
      }
      setLines((prev) => [...prev, computeLine(mandates[0])]);
   }

   function removeLine(index: number) {
      setLines((prev) => prev.filter((_, i) => i !== index));
   }

   function updateLine(index: number, patch: Partial<FeeLine>) {
      setLines((prev) => {
         const updatedLines = [...prev];
         const lineToUpdate = updatedLines[index];

         const mandate =
            mandates.find(
               (m) => m.id === (patch.staffId ?? lineToUpdate.staffId),
            ) || mandates[0];

         const hours = patch.hours ?? lineToUpdate.hours;
         const rate = patch.rate ?? lineToUpdate.rate;

         updatedLines[index] = computeLine(mandate, hours, rate);
         return updatedLines;
      });
   }

   return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
         <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
               Fee Generator
            </div>
            <Button
               type="button"
               onClick={addLine}
               className="h-8 px-3 text-xs"
               disabled={mandates.length === 0}
            >
               Add Row
            </Button>
         </div>

         <div className="space-y-2">
            {lines.length === 0 && (
               <div className="text-sm text-gray-500">
                  Select a proposed mandate to start.
               </div>
            )}
            {lines.map((line, i) => (
               <div
                  key={`${line.staffId}-${i}`}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center"
               >
                  <div className="sm:col-span-4">
                     <label
                        htmlFor={`mandate-${i}`}
                        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                     >
                        Mandate
                     </label>
                     <Select
                        id={`mandate-${i}`}
                        value={line.staffId}
                        onChange={(e) => {
                           updateLine(i, {
                              staffId: e.target.value,
                              rate: mandates.find(
                                 (m) => m.id === e.target.value,
                              )?.defaultRate,
                           });
                        }}
                     >
                        {mandates.map((mandate) => (
                           <option key={mandate.id} value={mandate.id}>
                              {mandate.name}
                           </option>
                        ))}
                     </Select>
                  </div>

                  <div className="sm:col-span-2">
                     <label
                        htmlFor={`hours-${i}`}
                        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                     >
                        Hours
                     </label>
                     <Input
                        id={`hours-${i}`}
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
                     <label
                        htmlFor={`rate-${i}`}
                        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                     >
                        Rate
                     </label>
                     <Input
                        id={`rate-${i}`}
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
                     <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Total
                     </span>
                     <div className="h-10 flex items-center rounded-md border border-gray-200 px-3 text-sm text-gray-900 dark:border-gray-800 dark:text-gray-100">
                        ${line.lineTotal.toFixed(2)}
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
               ${summary.total.toFixed(2)}
            </span>
         </div>
      </div>
   );
}
