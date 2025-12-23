type ExtractResponse = {
  detectedAddresses: {
    fullAddress: string;
  }[];
};

export async function extractAddressFromPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/api/extract", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("PDF extract failed");
  }

  const data = await res.json();

  const addressList = data.detectedAddresses ?? [];

  if (addressList.length === 0) {
    throw new Error("No address found in PDF");
  }

  return addressList;
}
