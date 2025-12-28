function getMediaPreview(media = []) {
  if (!media.length) return "";

  const types = new Set(media.map((m) => m.type));

  if (types.has("image")) return "📷 Photo";
  if (types.has("video")) return "🎥 Video";
  if (types.has("audio")) {
    return media.some((m) => m.isVoice) ? "🎤 Voice message" : "🎵 Audio";
  }
  if (types.has("document")) return "📄 Document";

  return "📎 Attachment";
}

module.exports = getMediaPreview;
