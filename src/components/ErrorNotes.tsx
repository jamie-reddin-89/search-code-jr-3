import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

function formatError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  const message = (error as any)?.message ?? '';
  const code = (error as any)?.code ?? '';
  return message || code || 'An unknown error occurred';
}

interface ErrorNotesProps {
  systemName: string;
  errorCode: string;
  userId: string | undefined;
}

interface Note {
  id: string;
  note: string;
  created_at: string;
}

export function ErrorNotes({ systemName, errorCode, userId }: ErrorNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [systemName, errorCode, userId]);

  const fetchNotes = async () => {
    const { data, error } = await (supabase as any)
      .from("error_notes" as any)
      .select("*")
      .eq("system_name", systemName)
      .eq("error_code", errorCode)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      const errorMsg = formatError(error);
      console.error("Error fetching notes:", errorMsg, error);
      toast.error(`Failed to load notes: ${errorMsg}`);
    } else {
      setNotes(data || []);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !userId) return;

    setLoading(true);
    const { error } = await (supabase as any).from("error_notes" as any).insert({
      system_name: systemName,
      error_code: errorCode,
      note: newNote.trim(),
      user_id: userId,
    });

    if (error) {
      const errorMsg = formatError(error);
      toast.error(`Failed to add note: ${errorMsg}`);
      console.error("Error adding note:", errorMsg, error);
    } else {
      toast.success("Note added");
      setNewNote("");
      fetchNotes();
    }
    setLoading(false);
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await (supabase as any)
      .from("error_notes" as any)
      .delete()
      .eq("id", noteId)
      .eq("user_id", userId);

    if (error) {
      const errorMsg = formatError(error);
      toast.error(`Failed to delete note: ${errorMsg}`);
      console.error("Error deleting note:", errorMsg, error);
    } else {
      toast.success("Note deleted");
      fetchNotes();
    }
  };

  if (!userId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Add a service note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button onClick={addNote} disabled={loading || !newNote.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        <div className="space-y-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
