type ExtractResponse = {
  result: string[];
};

export async function extractAddressFromDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/api/extract", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Document data extraction failed");
  }

  const data: ExtractResponse = await res.json();

  const addressList = data.result ?? [];

  if (addressList.length === 0) {
    throw new Error("No address found in the document.");
  }

  return addressList;
}

export async function placesApiRequest(input: string) {
  return await fetch(
    `http://localhost:3000/api/map-places?input=${encodeURIComponent(input)}`
  );
}
