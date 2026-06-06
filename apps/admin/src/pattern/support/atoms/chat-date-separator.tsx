// Centered date pill between message groups (e.g. "Yesterday").
export const ChatDateSeparator = ({ label }: { label: string }) => (
  <div className="my-3 flex justify-center">
    <span className="rounded-full bg-[#F2EDE9] px-3 py-1 text-xs font-medium text-grey3">
      {label}
    </span>
  </div>
);
