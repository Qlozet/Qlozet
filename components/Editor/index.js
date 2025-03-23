import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quillStyles.css";

const RichTextEditor = ({ onChange }) => {
    const [content, setContent] = useState("");

    const handleChange = (value) => {
        setContent(value);
        onChange(value);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <div className="quill-container flex-1 flex flex-col">
                <ReactQuill
                    value={content}
                    onChange={handleChange}
                    modules={{
                        toolbar: [
                            ["bold", "italic", "underline"],
                            [{ header: 1 }, { header: 2 }],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["link", "image"],
                            ["emoji"],
                        ],
                    }}
                />
            </div>
        </div>
    );
};

export default RichTextEditor;
