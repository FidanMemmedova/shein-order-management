import React, { useEffect, useRef, useState } from "react";
import { cleanNotes } from "../../api/orders";
import NotesEditor from "./NotesEditor";

interface NotesCellProps {
  notes: string[];
  onSave: (notes: string[]) => Promise<boolean>;
}

/** Cədvəl xanasında birbaşa redaktə: qutudan çıxanda və ya qutu silinəndə avtomatik yadda saxlayır. */
const NotesCell: React.FC<NotesCellProps> = ({ notes, onSave }) => {
  const [draft, setDraft] = useState(notes);
  const notesKey = JSON.stringify(notes);
  const savedKey = useRef(notesKey);

  // Qeydlər kənardan dəyişibsə (məs. redaktə pəncərəsindən və ya xəta zamanı geri qaytarılıbsa), qaralamanı yenilə.
  useEffect(() => {
    if (notesKey !== savedKey.current) {
      savedKey.current = notesKey;
      setDraft(JSON.parse(notesKey) as string[]);
    }
  }, [notesKey]);

  const commit = (next: string[]) => {
    const cleaned = cleanNotes(next);
    const key = JSON.stringify(cleaned);
    if (key === savedKey.current) return;
    savedKey.current = key;
    void onSave(cleaned);
  };

  const handleChange = (next: string[]) => {
    setDraft(next);
    if (next.length < draft.length) commit(next);
  };

  return (
    <NotesEditor compact value={draft} onChange={handleChange} onBlur={() => commit(draft)} />
  );
};

export default NotesCell;
