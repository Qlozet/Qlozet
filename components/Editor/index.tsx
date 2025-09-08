import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import styles from "./index.module.css";
import { Bold, Italic, Underline } from "lucide-react";
import { BsImage } from "react-icons/bs";
import ToolTip from "../ToolTip";

interface RichTextEditorProps {
    onChange: (html: string) => void;
    label: string;
    tooltips?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ onChange, label, tooltips }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    
    const editor = useEditor({
        extensions: [StarterKit, Image],
        content: ``,
        onUpdate({ editor }) {
            const html = editor.getHTML();
            onChange(html);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
    });

    const insertImage = (): void => {
        const url = window.prompt("Image URL");
        if (url) editor?.chain().focus().setImage({ src: url }).run();
    };

    return (
        <div>
            <div className="flex items-center justify-start gap-2">
                <label className="text-sm my-2 text-dark"> {label}</label>
                {tooltips && <ToolTip text={`${label} is required`} />}
            </div>
            <div className={`border-solid border-[1.5px] rounded-lg ${isFocused ? 'border-primary' : 'border-gray-200'}`}>
                <div className="flex gap-6 p-4">
                    <button 
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()} 
                        className="font-bold"
                    >
                        <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
                        <Italic size={16} />
                    </button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                        <Underline size={16} />
                    </button>
                    {/* <button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    >
                        • List
                    </button>
                    <button onClick={() => editor?.chain().focus().setParagraph().run()}>
                        ¶
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()}
                    >
                        H2
                    </button> */}
                    <button type="button" onClick={() => insertImage()}>
                        <BsImage size={16} />
                    </button>
                </div>
                <div className={`${styles.editor} p-4`}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};

export default RichTextEditor;