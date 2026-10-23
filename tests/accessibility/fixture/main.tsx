import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { Switch } from "@/frontend/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/frontend/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/components/ui/tabs";
import { CardSkeletons, EmptyState, ErrorState } from "@/frontend/components/shared/states";
import "@/styles.css";

export function AccessibilityFixture() {
  const [retries, setRetries] = useState(0);
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">TeamUp component accessibility</h1>
      <section aria-labelledby="controls-title" className="space-y-4">
        <h2 id="controls-title" className="text-xl font-semibold">
          Controls
        </h2>
        <div className="space-y-2">
          <Label htmlFor="task-title">Task title</Label>
          <Input id="task-title" aria-describedby="task-help" />
          <p id="task-help">Give your task a descriptive title.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Secondary action</Button>
          <Button variant="destructive">Delete task</Button>
          <Button variant="link">View task details</Button>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="completed" />
          <Label htmlFor="completed">Mark complete</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="reminders" />
          <Label htmlFor="reminders">Session reminders</Label>
        </div>
        <Button disabled>Unavailable action</Button>
      </section>
      <section aria-labelledby="dialog-title">
        <h2 id="dialog-title" className="text-xl font-semibold">
          Dialog
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Edit task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit task details</DialogTitle>
            <DialogDescription>Update the task title before closing this dialog.</DialogDescription>
            <Label htmlFor="dialog-task">Updated title</Label>
            <Input id="dialog-task" />
          </DialogContent>
        </Dialog>
      </section>
      <section aria-labelledby="tabs-title">
        <h2 id="tabs-title" className="text-xl font-semibold">
          Team sections
        </h2>
        <Tabs defaultValue="tasks">
          <TabsList aria-label="Team sections">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">Your team tasks</TabsContent>
          <TabsContent value="resources">Your shared resources</TabsContent>
        </Tabs>
      </section>
      <section aria-labelledby="states-title" className="space-y-4">
        <h2 id="states-title" className="text-xl font-semibold">
          Content states
        </h2>
        <CardSkeletons />
        <EmptyState
          icon={BookOpen}
          title="No resources yet"
          description="Share a note or file to get started."
        />
        <ErrorState
          message="Your tasks could not be loaded."
          onRetry={() => setRetries((n) => n + 1)}
        />
        <p role="status" aria-label="Retry result">
          Retry count: {retries}
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<AccessibilityFixture />);
