import { useState, type FormEvent, useCallback, useRef } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { FeeBuilder } from "../containers/FeeBuilder";
import { extractAddressFromDocument } from "../utils/actions";
import type {
  FeeSummary,
  FormState,
  ProposedMandate,
} from "@shared/types/project";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { DatePicker } from "../components/DatePicker";
import { toISODateLocal } from "../utils/date";
import { MultiSelect } from "../components/MultiSelect";

// const defaultTestValues = {
//   projectName: "test project name",
//   billingEntity: "test billing entity",
//   address: "test address",
//   clientEmail: "test client email",
//   clientName: "test client name",
//   clientCompanyAddress: "test client company address",
//   assetClass: "test asset class",
//   projectDescription: "test project description",
//   proposedMandate: "Estimating",
//   date: new Date().toDateString(),
// } as FormState;

const emptyFee: FeeSummary = { lines: [], total: 0 };

const defaultValues = {
  projectName: "",
  billingEntity: "",
  address: "",
  clientEmail: "",
  clientName: "",
  clientCompanyAddress: "",
  assetClass: "",
  projectDescription: "",
  proposedMandates: [],
  date: toISODateLocal(new Date()),
  fee: emptyFee,
} as FormState;

export function FormFields() {
  const defaultState: FormState = defaultValues;

  const PROPOSED_MANDATES: { label: string; value: ProposedMandate }[] = [
    { label: "Estimating", value: "Estimating" },
    { label: "Proforma", value: "Proforma" },
    { label: "Project Monitoring", value: "Project Monitoring" },
  ];

  const [form, setForm] = useState<FormState>(defaultState);
  const [file, setFile] = useState<File | null>(null);
  const [fee, setFee] = useState<FeeSummary>();
  const [addressList, setAddressList] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [emailError, setEmailError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);

    if (!selected) {
      return;
    }

    setIsDocumentLoading(true);
    try {
      const addressList = await extractAddressFromDocument(selected);
      setAddressList(addressList);
      if (addressList.length > 0) {
        setSelectedAddress(addressList[0]);
      }
    } catch (e) {
      setFile(null);
      console.log("Error while uploading document:", e);
    }
    setIsDocumentLoading(false);
  }

  function clearFile() {
    setFile(null);
    setAddressList([]);
    setSelectedAddress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    if (!fee) {
      alert("Please add fee details");
      return;
    }
    if (
      !form.projectName ||
      !form.billingEntity ||
      !form.proposedMandates.length ||
      (!selectedAddress && !form.address)
    ) {
      alert("Missing required fields");
      return;
    }

    const payload: FormState = {
      projectName: form.projectName,
      billingEntity: form.billingEntity,
      date: form.date,
      clientEmail: form.clientEmail,
      clientName: form.clientName,
      clientCompanyAddress: form.clientCompanyAddress,
      assetClass: form.assetClass,
      projectDescription: form.projectDescription,
      address: selectedAddress || form.address,
      fee,
      proposedMandates: form.proposedMandates,
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

    generatePdf();
  };

  const onAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(e.target.value);
  };

  // const onProposedMandateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedProposedMandate(e.target.value as ProposedMandate);
  // };

  const onFeeChange = useCallback((feeObj: FeeSummary) => {
    console.log("fee summary", feeObj);
    setFee(feeObj);
    setForm((prev) => ({
      ...prev,
      fee: feeObj,
    }));
  }, []);

  console.log("form", form);

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
            tabIndex={1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pdf_file">Upload PDF</label>
          {file ? (
            <>
              <div
                className={`flex items-center gap-2 transition-opacity ${
                  isDocumentLoading ? "opacity-40" : "opacity-100"
                }`}
              >
                <span className="text-sm text-gray-700">{file.name}</span>
                <Button
                  type="button"
                  onClick={clearFile}
                  aria-label="Clear selected file"
                  className="text-xs text-gray-500 hover:text-gray-800"
                  tabIndex={2}
                >
                  &#215;
                </Button>
              </div>
              {isDocumentLoading && (
                <div
                  className="relative bottom-8 left-[45%] w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"
                  aria-label="Loading"
                ></div>
              )}
            </>
          ) : (
            <Input
              id="pdf_file"
              name="pdf_file"
              type="file"
              onChange={onFileChange}
              ref={fileInputRef}
              tabIndex={2}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="billing_entity">Address List</label>
          <Select
            onChange={onAddressSelect}
            disabled={addressList.length === 0}
            tabIndex={3}
          >
            <>
              {addressList.length === 0 && <option>Select Address</option>}
              {addressList.map((address, index) => (
                <option key={index}>{address}</option>
              ))}
            </>
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
            tabIndex={4}
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
            tabIndex={5}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date">Date</label>
          <DatePicker
            id="date"
            name="date"
            value={form.date}
            onChange={(value) => updateField("date", value)}
            tabIndex={6}
          />
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
            tabIndex={7}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="client_company_address">Client Company Address</label>
          <AddressAutocomplete
            id="client_company_address"
            name="clientCompanyAddress"
            value={form.clientCompanyAddress}
            onChange={(value) => updateField("clientCompanyAddress", value)}
            onSelect={(_, description) => {
              updateField("clientCompanyAddress", description);
            }}
            placeholder="Start typing an address..."
            tabIndex={4}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="asset_class">Asset Class</label>
          <Select
            id="asset_class"
            name="assetClass"
            value={form.assetClass}
            onChange={(e) => updateField("assetClass", e.target.value)}
            tabIndex={9}
          >
            {!form.assetClass && <option>Select Asset class</option>}
            <option>Asset Class 1</option>
            <option>Asset Class 2</option>
            <option>Asset Class 3</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="project_description">Project Description</label>
          <Input
            id="project_description"
            name="projectDescription"
            placeholder="Project description"
            value={form.projectDescription}
            onChange={(e) => updateField("projectDescription", e.target.value)}
            tabIndex={10}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="proposed_mandate">Proposed Mandate</label>
          <MultiSelect
            options={PROPOSED_MANDATES}
            value={form.proposedMandates}
            onChange={(val) => updateField("proposedMandates", val)}
          />
        </div>
      </div>

      <FeeBuilder onChange={onFeeChange} />
      <Button type="button" onClick={generatePdf} tabIndex={12}>
        Generate PDF
      </Button>
    </form>
  );
}
