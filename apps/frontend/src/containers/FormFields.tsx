import { useState, type FormEvent, useCallback } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { FeeBuilder } from "../containers/FeeBuilder";
import { extractAddressFromPdf } from "../utils/actions";
import type {
  FeeSummary,
  Address,
  FormState,
  ProposedMandate,
} from "@shared/types/project";

export function FormFields() {
  const defaultState: FormState = {
    projectName: "test project name",
    billingEntity: "test billing entity",
    date: new Date().toDateString(),
    address: "test address",
    clientEmail: "test client email",
    clientName: "test client name",
    clientCompanyAddress: "test client company address",
    assetClass: "test asset class",
    projectDescription: "test project description",
    proposedMandate: "Estimating",
  };

  const PROPOSED_MANDATES = [
    "Estimating",
    "Proforma",
    "Project Monitoring",
  ] as ProposedMandate[];

  const [form, setForm] = useState<FormState>(defaultState);
  const [file, setFile] = useState<File | null>(null);
  const [fee, setFee] = useState<FeeSummary>();
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedProposedMandate, setSelectedProposedMandate] = useState(
    PROPOSED_MANDATES[0]
  );
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);

    if (!selected) {
      return;
    }

    const addressList = await extractAddressFromPdf(selected); //
    console.log(addressList);
    setAddressList(addressList);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function generatePdf() {
    console.log("form", form);
    if (form.clientEmail && !isValidEmail(form.clientEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    if (
      !form.projectName ||
      !form.billingEntity ||
      !form.proposedMandate ||
      (!selectedAddress && !form.address)
    ) {
      alert("Missing required fields");
      return;
    }

    const payload = {
      projectName: form.projectName,
      billingEntity: form.billingEntity,
      clientEmail: form.clientEmail,
      clientName: form.clientName,
      clientCompanyAddress: form.clientCompanyAddress,
      assetClass: form.assetClass,
      projectDescription: form.projectDescription,
      address: selectedAddress || form.address,
      fee,
      proposedMandate: selectedProposedMandate,
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

  const onAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(e.target.value);
  };

  const onProposedMandateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProposedMandate(e.target.value as ProposedMandate);
  };

  const onFeeChange = useCallback((feeObj: FeeSummary) => {
    console.log("fee summary", feeObj);
    setFee(feeObj);
  }, []);

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="project_name">Project Name</label>
          <Input
            id="project_name"
            name="projectName"
            placeholder="Project name"
            value={form.projectName}
            onChange={(e) => updateField("projectName", e.target.value)}
            tabIndex={0}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pdf_file">Upload PDF</label>
          <Input
            id="pdf_file"
            name="pdf_file"
            type="file"
            onChange={onFileChange}
            tabIndex={1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="billing_entity">Addresses</label>
          <Select onChange={onAddressSelect} tabIndex={2}>
            {addressList.map((address, index) => (
              <option key={index}>{address.fullAddress}</option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address">Address</label>
          <Input
            id="address"
            name="address"
            placeholder="Address"
            value={form.address}
            disabled={addressList.length > 0}
            onChange={(e) => updateField("address", e.target.value)}
            tabIndex={3}
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
            tabIndex={4}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date">Date</label>
          <Input id="date" name="date" value={form.date} disabled />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="client_email">Client Email</label>
          <Input
            id="client_email"
            name="clientEmail"
            type="email"
            placeholder="Client email"
            value={form.clientEmail}
            onChange={(e) => {
              updateField("clientEmail", e.target.value);
              setEmailError("");
            }}
            onBlur={(e) => {
              const value = e.target.value;
              setEmailError(
                value && !isValidEmail(value)
                  ? "Please enter a valid email address"
                  : ""
              );
            }}
            tabIndex={6}
            aria-invalid={emailError ? "true" : "false"}
          />
          {emailError && (
            <span className="text-sm text-red-600">{emailError}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="client_name">Client Name</label>
          <Input
            id="client_name"
            name="clientName"
            placeholder="Client name"
            value={form.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="client_company_address">Client Company Address</label>
          <Input
            id="client_company_address"
            name="clientCompanyAddress"
            placeholder="Client company address"
            value={form.clientCompanyAddress}
            onChange={(e) =>
              updateField("clientCompanyAddress", e.target.value)
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="asset_class">Asset Class</label>
          <Input
            id="asset_class"
            name="assetClass"
            placeholder="Asset class"
            value={form.assetClass}
            onChange={(e) => updateField("assetClass", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="project_description">Project Description</label>
          <Input
            id="project_description"
            name="projectDescription"
            placeholder="Project description"
            value={form.projectDescription}
            onChange={(e) => updateField("projectDescription", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="proposed_mandate">Proposed Mandate</label>
          <Select onChange={onProposedMandateSelect}>
            {PROPOSED_MANDATES.map((mandate, index) => (
              <option key={index} value={mandate}>
                {mandate}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <FeeBuilder onChange={onFeeChange} />
      <Button type="button" onClick={generatePdf}>
        Generate PDF
      </Button>
    </form>
  );
}
