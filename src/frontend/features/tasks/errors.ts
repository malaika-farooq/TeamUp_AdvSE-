export function taskErrorMessage(error: { message: string; code?: string }) {
  if (error.code === "42501")
    return "You don't have permission to change this task — only its creator, its assignee, or a team admin can.";
  return error.message;
}
