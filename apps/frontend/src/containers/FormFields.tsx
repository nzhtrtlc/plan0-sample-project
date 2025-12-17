import { useState, type FormEvent, useCallback } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { FeeBuilder } from "../containers/FeeBuilder";
import { extractAddressFromPdf } from "../utils/actions";
import type { FeeSummary } from "@shared/types/project";

type FormState = {
  projectName: string;
  billingEntity: string;
  date: string;
};

export function FormFields() {
  const defaultState: FormState = {
    projectName: "",
    billingEntity: "",
    date: new Date().toDateString(),
  };

  const [form, setForm] = useState<FormState>(defaultState);
  const [file, setFile] = useState<File | null>(null);
  const [extractedAddress, setExtractedAddress] = useState<string>("");
  const [fee, setFee] = useState<FeeSummary>();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);

    if (!selected) {
      setExtractedAddress("");
      return;
    }

    const address = await extractAddressFromPdf(selected);
    setExtractedAddress(address);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function generatePdf() {
    if (!form.projectName || !form.billingEntity || !extractedAddress) {
      alert("Missing required fields");
      return;
    }

    console.log("pdf generation starting..");

    const payload = {
      projectName: form.projectName,
      billingEntity: form.billingEntity,
      address: extractedAddress,
      fee,
    };

    const res = await fetch("http://localhost:3000/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("PDF generation failed");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const date = new Date();
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-summary-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.pdf`;
    a.click();

    URL.revokeObjectURL(url);

    console.log("pdf generation end");
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a PDF file");
      return;
    }
    console.log("form", form);
    console.log("Selected file:", file);

    generatePdf();
  };

  const onFeeChange = useCallback(
    (feeObj: FeeSummary) => {
      console.log("fee summary", feeObj);
      setFee(feeObj);
    },
    [fee]
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="project_name">Project Name</label>
        <Input
          id="project_name"
          name="projectName"
          placeholder="Project name"
          value={form.projectName}
          onChange={(e) => updateField("projectName", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pdf_file">Upload PDF</label>
        <Input
          id="pdf_file"
          name="pdf_file"
          type="file"
          onChange={onFileChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="billing_entity">Billing Entity</label>
        <Input
          id="billing_entity"
          name="billingEntity"
          placeholder="Billing entity"
          value={form.billingEntity}
          onChange={(e) => updateField("billingEntity", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date">Date</label>
        <Input id="date" name="date" value={form.date} disabled />
      </div>
      <FeeBuilder onChange={onFeeChange} />
      <Button type="button" onClick={generatePdf}>
        Generate PDF
      </Button>
    </form>
  );
}
