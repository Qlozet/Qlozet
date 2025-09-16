import Image from "next/image"
import sponsor1 from "@/public/assets/svg/sponsor1.svg"
import sponsor2 from "@/public/assets/svg/sponsor2.svg"
import sponsor3 from "@/public/assets/svg/sponsor3.svg"
import sponsor4 from "@/public/assets/svg/sponsor4.svg"
import sponsor5 from "@/public/assets/svg/sponsor5.svg"
import sponsor6 from "@/public/assets/svg/sponsor6.svg"

const Sponsors = () => {
    return (
        <div className=" flex items-center justify-between my-[5rem] w-[80%] m-auto">
            <Image unOptimized src={sponsor1} />
            <Image unOptimized src={sponsor2} />
            <Image unOptimized src={sponsor3} />
            <Image unOptimized src={sponsor4} />
            <Image unOptimized src={sponsor5} />
            <Image unOptimized src={sponsor6} />
        </div>
    )
}

export default Sponsors