import { Info } from "lucide-react"
import React from "react"

const ToolTip = ({ text }) => {
    return (
        <div style={{ position: "relative", width: "12rem" }}>
            <div class="relative group">
                <p class="absolute left-2 top-[-1rem] hidden group-hover:block bg-gray-800 text-dark py-2 px-4 rounded-lg shadow-lg text-xs">
                    {text}
                </p>
                <Info className="text-dark h-4 w-4 rounded-lg shadow-lg group-hover:bg-green-600 transition" />
            </div>
        </div>
    )
}
export default ToolTip