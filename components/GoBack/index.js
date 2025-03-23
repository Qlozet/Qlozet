import { useRouter } from "next/navigation";
import goIcon from "../../public/assets/svg/Vector@2x.svg";

const GoBack = () => {
    const router = useRouter();
    return (
        <button onClick={() => router.push(-1)} className="flex items-center text-[#575757] gap-3">
            <img src={goIcon.src} />
            <span>Go Back</span>
        </button>
    );
};

export default GoBack;
