import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog"

  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"

  export default function CreateTask() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Task</Button>
        </DialogTrigger>

        <DialogContent>
          <Input placeholder="Task title" />
        </DialogContent>
      </Dialog>
    )
  }