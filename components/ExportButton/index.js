import Typography from "../Typography";
import excelIcon from "../../public/assets/svg/excel-file.svg";
import Image from "next/image";

const ExportComponent = ({ handleExport }) => {
  return (
    <div
      className="flex gap-4 items-center justify-center px-2 py-2  cursor-pointer max-w-[8rem] hover-translateX"
      onClick={handleExport}
    >
      <Image src={excelIcon} alt="" />
      <Typography
        textColor="text-primary"
        textWeight="font-medium"
        textSize=""
      >
        Export
      </Typography>
    </div>
  );
};

export default ExportComponent;
