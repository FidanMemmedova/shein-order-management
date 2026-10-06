import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Tooltip } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import "./NotesEditor.css";

interface NotesEditorProps {
  value?: string[];
  onChange?: (notes: string[]) => void;
  /** Qutulardan biri fokusu itirəndə çağırılır (cədvəldə avtomatik yadda saxlama üçün). */
  onBlur?: () => void;
  compact?: boolean;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ value = [], onChange, onBlur, compact = false }) => {
  const notes = value.length ? value : [""];
  const boxRefs = useRef<(TextAreaRef | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusIndex === null) return;
    boxRefs.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);

  const updateNote = (index: number, text: string) =>
    onChange?.(notes.map((note, i) => (i === index ? text : note)));

  const addNote = () => {
    onChange?.([...notes, ""]);
    setFocusIndex(notes.length);
  };

  const removeNote = (index: number) => onChange?.(notes.filter((_, i) => i !== index));

  return (
    <div className={`notes-editor${compact ? " notes-editor--compact" : ""}`}>
      {notes.map((note, index) => (
        <div className="notes-editor__box" key={index}>
          <span className="notes-editor__index">{index + 1}</span>
          <Input.TextArea
            ref={(element) => {
              boxRefs.current[index] = element;
            }}
            value={note}
            variant="borderless"
            autoSize={{ minRows: 1, maxRows: 6 }}
            placeholder="Müştəri: ad, Instagram, telefon, məhsul…"
            onChange={(event) => updateNote(index, event.target.value)}
            onBlur={onBlur}
          />
          {(notes.length > 1 || note) && (
            <Tooltip title="Qutunu sil">
              <Button
                type="text"
                size="small"
                className="notes-editor__remove"
                icon={<CloseOutlined />}
                aria-label="Qutunu sil"
                onClick={() => removeNote(index)}
              />
            </Tooltip>
          )}
        </div>
      ))}
      <Button
        type="dashed"
        size={compact ? "small" : "middle"}
        icon={<PlusOutlined />}
        className="notes-editor__add"
        onClick={addNote}
      >
        Müştəri əlavə et
      </Button>
    </div>
  );
};

export default NotesEditor;
