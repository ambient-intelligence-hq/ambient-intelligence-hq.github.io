// Curated "what the session produced" lines. Several demos ended on tool calls
// (the deliverable was a file written in the sandbox, not a closing chat
// message), so this gives every replay a clear final outcome.
export const OUTCOMES: Record<string, string> = {
  "safety-inspection-report":
    "Produced an industrial safety report — hazards and the best practices followed, each backed by evidence frames and timestamps.",
  "video-to-documentation":
    "Produced an HTML product-documentation guide — step-by-step instructions with cropped, presenter-free screenshots and timestamp references.",
  "highlight-reel":
    "Assembled a 30-second 9:16 social highlight reel with HyperFrames — clips chosen for the key moments, tip captions, and a music bed.",
  "swing-pose-estimation":
    "Rendered a new video with body-pose skeleton points overlaid on the golf swing.",
  "recipe-blog-post":
    "Wrote a recipe blog post — ingredients and steps, illustrated with frames pulled from the video.",
  "flow-diagram-gif": "Cut the flow-diagram moment into a looping GIF.",
  "video-qa-walkthrough":
    "Tracked a person across the full video with YOLOv8 + ByteTrack, exporting an annotated video and per-frame tracks (CSV).",
};
