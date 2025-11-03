import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Wrench, Plus, Trash2, RefreshCw } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FixStep {
  id: string;
  brand?: string | null;
  model?: string | null;
  error_code?: string | null;
  title: string;
  content: string;
  tags?: string[] | null;
  media_urls?: string[] | null;
  created_at?: string;
  created_by?: string | null;
}

export default function AdminFixSteps() {
  const [steps, setSteps] = useState<FixStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Partial<FixStep>>({ tags: [], media_urls: [] });
  const { toast } = useToast();

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fix_steps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSteps(data || []);
    } catch (err) {
      console.error("Error loading fix steps:", err);
      toast({
        title: "Error loading fix steps",
        description: "Failed to fetch data from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!draft.title?.trim() || !draft.content?.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("fix_steps").insert({
        brand: draft.brand || null,
        model: draft.model || null,
        error_code: draft.error_code || null,
        title: draft.title,
        content: draft.content,
        tags: draft.tags || [],
        media_urls: draft.media_urls || [],
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: "Fix step saved successfully" });
      setDraft({ tags: [], media_urls: [] });
      loadSteps();
    } catch (err) {
      console.error("Error saving fix step:", err);
      toast({
        title: "Error saving fix step",
        description: (err as any)?.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this fix step?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("fix_steps").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Fix step deleted" });
      loadSteps();
    } catch (err) {
      console.error("Error deleting fix step:", err);
      toast({
        title: "Error deleting fix step",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <TopRightControls />
      <header className="flex items-center justify-between mb-8 w-full max-w-xl">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="icon" aria-label="Back to Admin">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Go Home">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench size={20} /> Fix Steps
        </h1>
        <div className="w-10" />
      </header>

      <div className="w-full max-w-xl grid gap-4">
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Fix Step</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSteps}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Brand</Label>
              <Input
                placeholder="e.g., Joule"
                value={draft.brand || ""}
                onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                disabled={loading}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Input
                placeholder="e.g., Victorum"
                value={draft.model || ""}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                disabled={loading}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Error Code</Label>
            <Input
              placeholder="e.g., E001"
              value={draft.error_code || ""}
              onChange={(e) => setDraft({ ...draft, error_code: e.target.value })}
              disabled={loading}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="Fix step title"
              value={draft.title || ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              disabled={loading}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Step-by-step Guide</Label>
            <Textarea
              placeholder="Detailed repair instructions..."
              value={draft.content || ""}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              disabled={loading}
              className="text-sm h-24"
            />
          </div>

          <div>
            <Label className="text-xs">Tags (comma separated)</Label>
            <Input
              placeholder="urgent, ac, heating"
              value={
                Array.isArray(draft.tags)
                  ? draft.tags.join(", ")
                  : ""
              }
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              disabled={loading}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Media URLs (comma separated)</Label>
            <Input
              placeholder="https://example.com/image1.jpg, ..."
              value={
                Array.isArray(draft.media_urls)
                  ? draft.media_urls.join(", ")
                  : ""
              }
              onChange={(e) =>
                setDraft({
                  ...draft,
                  media_urls: e.target.value
                    .split(",")
                    .map((u) => u.trim())
                    .filter(Boolean),
                })
              }
              disabled={loading}
              className="text-sm"
            />
          </div>

          <Button onClick={saveDraft} disabled={loading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Save Fix Step
          </Button>
        </div>

        <div className="border rounded p-4 space-y-3">
          <h2 className="font-semibold">Existing Steps ({steps.length})</h2>
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No steps yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {steps.map((s) => (
                <div key={s.id} className="border rounded p-3 text-sm">
                  <div className="font-semibold">{s.title}</div>
                  {(s.brand || s.model || s.error_code) && (
                    <div className="text-xs text-muted-foreground">
                      {[s.brand, s.model, s.error_code]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  )}
                  {s.tags && s.tags.length > 0 && (
                    <div className="text-xs mt-1">
                      Tags: {s.tags.join(", ")}
                    </div>
                  )}
                  <div className="mt-2 whitespace-pre-wrap text-xs">
                    {s.content.substring(0, 100)}
                    {s.content.length > 100 ? "..." : ""}
                  </div>
                  {s.media_urls && s.media_urls.length > 0 && (
                    <div className="mt-2 text-xs">
                      {s.media_urls.length} media URL(s)
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(s.id)}
                    disabled={loading}
                    className="mt-2"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
