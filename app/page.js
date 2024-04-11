"use client";
import Image from "next/image";
import Button from "./components/Button";
import Typography from "./components/Typography";
import Badge from "./components/Badge";
import FileUploadInput from "./components/FileUploadInput";
import UploadSingleDocInput from "./components/UploadSingleDocInput";
import TextInput from "./components/TextInput";
import ProgressBar from "./components/ProgressBar";
export default function Home() {
  return (
    <main className="bg-white w-full h-[100vh] p-20">
      {/* <Button variant="outline" btnSize="small" disabled={false}>
        Primary
      </Button>{" "}
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
      <h1>Homepage</h1>
    </main>
  );
}
