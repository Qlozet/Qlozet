import { useState } from "react";

const ToggleSwitch = ({ value, onChange }) => {
    const [checked, setChecked] = useState(value)
    const handleChange = () => {
        setChecked(!checked)
        onChange(!checked)
    }

    return (
        <div className={`w-[20px] h-[12px] ${checked ? "bg-primary" : "bg-[#D9D9D9]"} cursor-pointer  rounded-full`}>
            <span className={`w-[12px] h-[12px] block rounded-full ${checked ? "bg-white ml-3" : "bg-primary"}`} onClick={handleChange}></span>
        </div>
    );
}

export default ToggleSwitch