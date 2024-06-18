import Typography from "../Typography";
import excelIcon from "../../public/assets/svg/excel-file.svg";
import Image from "next/image";

const ExportComponent = ({ handleExport }) => {
  return (
    <div
      className="flex gap-4 items-center px-2 py-2 border-solid border-[1px] border-primary rounded-[12px] cursor-pointer"
      onClick={handleExport}
    >
      <Image src={excelIcon} alt="" />
      <Typography
        textColor="text-primary"
        textWeight="font-[500]"
        textSize="text-[16px]"
      >
        Export
      </Typography>
    </div>
  );
};

export default ExportComponent;
