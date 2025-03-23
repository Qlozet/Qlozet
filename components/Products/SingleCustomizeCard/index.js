import ToolTip from "@/components/ToolTip";
import Typography from "@/components/Typography";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const SingleCustomzeCard = ({ text, ToolTipText, children }) => {
    const [showChilderen, setShowChildren] = useState(false);
    return (
        <div>
            <div className="flex items-center gap-4" onClick={() => {
                setShowChildren(!showChilderen)
            }}>
                <Typography
                    textColor="text-sectionHeader"
                    textWeight="font-semibold"
                    textSize="text-[18px]"
                    verticalPadding={0}
                >
                    {text}
                </Typography>
                <ToolTip />
                <button className="w-[5%]">
                    {showChilderen ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>
            {showChilderen && children}
        </div>
    );
};

export default SingleCustomzeCard;
