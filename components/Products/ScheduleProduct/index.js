import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import SelectInput from "@/components/SelectInput";
import TextArea from "@/components/TextAreaInput";
import TimeInput from "@/components/TimeInput";
import Typography from "@/components/Typography";
import "react-calendar/dist/Calendar.css";
const ShecduleProduct = ({ closeSchedule }) => {
  return (
    <div>
      <div className="mt-4 mx-auto lg:max-w-[30%]">
        <div className="bg-white rounded-[12px] w-full  m-auto px-4 py-6 my-6 shadow lg:min-w-[50%]">
          <div>
            <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
              <Typography
                textColor="text-primary"
                textWeight="font-bold"
                textSize="text-[14px]"
              >
                Get support
              </Typography>
              {/* <Image
                  src={closeIcon}
                  alt=""
                  onClick={closeModal}
                  className="cursor-pointer"
                /> */}
            </div>

            <DateInput
              placeholder={"Select Date"}
              // value={dropDownValue}
              setValue={(data) => {
                //   setDropDownValue(data);
              }}
              label="Date"
            />
            <TimeInput
              label="Time"
              placeholder="Select Time"
              setValue={(data) => {}}
            />
            <div className="my-6 flex items-center justify-center lg:justify-end ">
              <Button
                children="Schedule activation"
                btnSize="small"
                minWidth="min-w-[100%]"
                variant="primary"
                clickHandler={() => {
                  closeSchedule();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShecduleProduct;
