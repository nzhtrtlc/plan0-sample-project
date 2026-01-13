import type { Bio } from "@shared/types/project";
import { MultiSelect } from "../../components/MultiSelect";
import { useEffect, useState } from "react";
import { getBios } from "../../utils/actions";

export default function Bios({ onChange, value }: { onChange: (value: Bio[]) => void, value: Bio[] }) {
    const [availableBios, setAvailableBios] = useState<Bio[]>([]);

    useEffect(() => {
        getBios().then(setAvailableBios);
    }, []);

    const handleChange = (selectedIds: string[]) => {
        const selectedBios = selectedIds.map(id => availableBios.find(b => b.id === id)).filter(Boolean) as Bio[];
        onChange(selectedBios);
    };

    return <MultiSelect
        options={availableBios.map(bio => ({ label: bio.name, value: bio.id }))}
        value={value.map(v => v.id)}
        onChange={handleChange} />;
}