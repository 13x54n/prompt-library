export function canAccessPrompt(prompt, viewerUid = null) {
  if (!prompt) return false;
  const visibility = prompt.visibility ?? "public";
  if (visibility !== "unlisted") return true;
  return Boolean(viewerUid && prompt.authorUid === viewerUid);
}

export function ensurePromptAccessOr404(res, prompt, viewerUid = null) {
  if (!prompt || !canAccessPrompt(prompt, viewerUid)) {
    res.status(404).json({ success: false, error: "Prompt not found" });
    return false;
  }
  return true;
}
