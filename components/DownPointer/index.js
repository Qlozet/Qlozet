const { default: Image } = require("next/image")
import arrowdown from "../../public/assets/svg/arrowdown.svg"
const DownPointer = () => {
    return (<div className="flex items-center justify-center"><button className="mx-auto inline-block my-6">
        <Image src={arrowdown} />
    </button></div>)
}

export default DownPointer