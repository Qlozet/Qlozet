import Button from "@/components/Button";
import SelectInput from "@/components/SelectInput";
import TextArea from "@/components/TextAreaInput";
import Typography from "@/components/Typography";

const ShecduleProduct = ({closeSchedule}) => {
  return (
    <div>
      <div className="mt-4 mx-auto ">
        <div className="bg-white rounded-[12px] w-full   m-auto px-4 py-6 my-6 shadow">
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

            <SelectInput
              placeholder={"Issue type "}
              // value={dropDownValue}
              setValue={(data) => {
                //   setDropDownValue(data);
              }}
              data={[
                { text: "General inquiry" },
                { text: "Pricing" },
                { text: "Feature request" },
                { text: "Bugs and issues" },
                { text: "Others" },
              ]}
              label="User role"
            />
            <TextArea
              label="Message"
              placeholder="Give a summary of the problem you are presently encountering."
              setValue={(data) => {}}
            />
            <div className="my-6 flex items-center justify-center md:justify-end ">
              <Button
                children="Schedule activation"
                btnSize="small"
                minWidth="min-w-[100%]"
                variant="primary"
                clickHandler={() => {
                    closeSchedule()
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
