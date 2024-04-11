"use client";
import Image from "next/image";
import Button from "./components/Button";
import Typography from "./components/Typography";
import Badge from "./components/Badge";
import FileUploadInput from "./components/FileUploadInput";
import UploadSingleDocInput from "./components/UploadSingleDocInput";
import TextInput from "./components/TextInput";
import ProgressBar from "./components/ProgressBar";
import { useRouter } from "next/navigation";
import PasswordInput from "./components/PasswordInput";
import RadioInput from "./components/RadioInput";
export default function Home() {
  const router = useRouter();
  return (
    <main className="bg-white w-full h-[100vh] p-20">
      {/* 
      <Typography textColor="text-black" textSize="text-[46px]">
        Hello
      </Typography>
      <Badge variant="danger"> Successful</Badge>
      <FileUploadInput></FileUploadInput>
      <TextInput
        label={"Business name "}
        placeholder={"Enter your business name"}
        disabled={false}
      />
      <ProgressBar step={6} />
      <UploadSingleDocInput></UploadSingleDocInput> */}
      <PasswordInput
        label="Create password"
        placeholder=""
        setValue={(data) => {
          console.log(data);
        }}
      />
      <RadioInput />
      <h1>Homepage</h1>
      <Button
        variant="outline"
        btnSize="small"
        disabled={false}
        clickHandler={() => {
          router.push(`auth/signup`);
        }}
      >
        Veiw Signup
      </Button>{" "}
    </main>
  );
}
