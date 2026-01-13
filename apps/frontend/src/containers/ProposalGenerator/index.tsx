import type {
	FeeSummary,
	FormState,
	ProposedMandate,
} from "@shared/types/project";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { AddressAutocomplete } from "../../components/AddressAutocomplete";
import { Button } from "../../components/Button";
import { DatePicker } from "../../components/DatePicker";
import { Input } from "../../components/Input";
import { MultiSelect } from "../../components/MultiSelect";
import { Select } from "../../components/Select";
import { extractAddressFromDocument } from "../../utils/actions";
import { toISODateLocal } from "../../utils/date";
import { FeeBuilder } from "../FeeBuilder";
import { FormField } from "./FormField";
import Bios from "./Bios";

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
	service: "",
	proposedMandates: [],
	date: toISODateLocal(new Date()),
	fee: emptyFee,
	bios: [],
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
		if (form.clientEmail && !isValidEmail(form.clientEmail)) {
			alert("Please enter a valid email address");
			return;
		}
		if (!fee) {
			alert("Please add fee details");
			return;
		}
		const requiredFields = [
			{ value: form.projectName, label: "Project Name" },
			{ value: form.billingEntity, label: "Billing Entity" },
			{ value: form.proposedMandates.length, label: "Proposed Mandates" },
			{ value: form.service, label: "Service" },
			{ value: selectedAddress || form.address, label: "Project Address" },
		];

		const missing = requiredFields.filter(field => !field.value).map(field => field.label);
		if (missing.length) {
			alert(`Missing required fields: ${missing.join(", ")}`);
			return;
		}

		const payload = {
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
			proposedMandates: form.proposedMandates.join(", "),
			service: form.service,
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

	const onFeeChange = useCallback((feeObj: FeeSummary) => {
		setFee(feeObj);
		setForm((prev) => ({
			...prev,
			fee: feeObj,
		}));
	}, []);

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormField label="Project Name" id="project_name">
					<Input
						value={form.projectName}
						onChange={(e) => updateField("projectName", e.target.value)}
						placeholder="Enter project name"
					/>
				</FormField>

				<FormField label="Upload PDF" id="upload_pdf">
					{file ? (
						<>
							<div
								className={`flex items-center gap-2 transition-opacity ${isDocumentLoading ? "opacity-40" : "opacity-100"
									}`}
							>
								<span className="text-sm text-gray-700">{file.name}</span>
								<Button
									type="button"
									onClick={clearFile}
									aria-label="Clear selected file"
									className="text-xs text-gray-500 hover:text-gray-800"
								>
									&#215;
								</Button>
							</div>
							{isDocumentLoading && (
								<output
									className="relative bottom-8 left-[45%] w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"
									aria-label="Loading"
								/>
							)}
						</>
					) : (
						<Input
							id="pdf_file"
							name="pdf_file"
							type="file"
							onChange={onFileChange}
							ref={fileInputRef}
						/>
					)}
				</FormField>

				<FormField label="Address List" id="address_list">
					<Select
						onChange={onAddressSelect}
						disabled={addressList.length === 0}
					>
						{addressList.length === 0 && <option>Select Address</option>}
						{addressList.map((address) => (
							<option key={address}>{address}</option>
						))}
					</Select>
				</FormField>

				<FormField label="Address" id="address">
					<Input
						id="address"
						name="address"
						placeholder="Address"
						value={form.address}
						disabled={addressList.length > 0}
						onChange={(e) => updateField("address", e.target.value)}
					/>
				</FormField>

				<FormField label="Billing Entity" id="billing_entity">
					<Input
						id="billing_entity"
						name="billingEntity"
						placeholder="Billing entity"
						value={form.billingEntity}
						onChange={(e) => updateField("billingEntity", e.target.value)}
					/>
				</FormField>

				<FormField label="Date" id="date">
					<DatePicker
						id="date"
						name="date"
						value={form.date}
						onChange={(value) => updateField("date", value)}
					/>
				</FormField>

				<FormField label="Client Email" id="client_email">
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
									: "",
							);
						}}
						aria-invalid={emailError ? "true" : "false"}
					/>
					{emailError && (
						<span className="text-sm text-red-600">{emailError}</span>
					)}
				</FormField>

				<FormField label="Client Name" id="client_name">
					<Input
						id="client_name"
						name="clientName"
						placeholder="Client name"
						value={form.clientName}
						onChange={(e) => updateField("clientName", e.target.value)}
					/>
				</FormField>

				<FormField label="Client Company Address" id="client_company_address">
					<AddressAutocomplete
						id="client_company_address"
						name="clientCompanyAddress"
						value={form.clientCompanyAddress}
						onChange={(value) => updateField("clientCompanyAddress", value)}
						onSelect={(_, description) => {
							updateField("clientCompanyAddress", description);
						}}
						placeholder="Start typing an address..."
					/>
				</FormField>

				<FormField label="Asset Class" id="asset_class">
					<Select
						id="asset_class"
						name="assetClass"
						value={form.assetClass}
						onChange={(e) => updateField("assetClass", e.target.value)}
					>
						{!form.assetClass && <option>Select Asset class</option>}
						<option>Asset Class 1</option>
						<option>Asset Class 2</option>
						<option>Asset Class 3</option>
					</Select>
				</FormField>

				<FormField label="Project Description" id="project_description">
					<Input
						id="project_description"
						name="projectDescription"
						placeholder="Project description"
						value={form.projectDescription}
						onChange={(e) => updateField("projectDescription", e.target.value)}
					/>
				</FormField>

				<FormField label="Proposed Mandate" id="proposed_mandate">
					<MultiSelect
						options={PROPOSED_MANDATES}
						value={form.proposedMandates}
						onChange={(val) => updateField("proposedMandates", val)}
					/>
				</FormField>

				<FormField label="List Of Services" id="list_of_services">
					<Select
						id="list_of_services"
						name="listOfServices"
						value={form.service}
						onChange={(e) => updateField("service", e.target.value)}
					>
						{!form.service && <option>Select Service</option>}
						<option>Service 1</option>
						<option>Service 2</option>
						<option>Service 3</option>
					</Select>
				</FormField>

				<FormField id="bios" label="Bios">
					<Bios
						value={form.bios}
						onChange={(val) => updateField("bios", val)}
					/>
				</FormField>
			</div>

			<FeeBuilder
				selectedMandates={form.proposedMandates}
				onChange={onFeeChange}
			/>
			<Button type="button" onClick={generatePdf}>
				Generate PDF
			</Button>
		</form>
	);
}
