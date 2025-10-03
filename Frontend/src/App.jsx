import AppRoutes from "@/routes/AppRoutes";
import { DocumentAttachment } from "./doc";
import { AudioPlayer } from "./audio";
import { VoicePlayer } from "./voice";

function App() {
  return <AppRoutes />;
}

export default App;

// export default function App() {
//   return (
//     <>
//       <DocumentAttachment
//         fileName="Daya Project PRD"
//         fileSize="300 KB"
//         onClick={() => console.log("Document clicked")}
//         onMenuClick={() => console.log("Menu clicked")}
//       />
//       <DocumentAttachment
//         fileName="Meeting Notes Q4 2024"
//         fileSize="1.2 MB"
//         onClick={() => console.log("Document clicked")}
//         onMenuClick={() => console.log("Menu clicked")}
//       />

//       <AudioPlayer
//         fileName="Sample Audio.mp3"
//         fileSize="240 KB"
//         audioUrl="https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
//         onMenuClick={() => console.log("Audio menu clicked")}
//       />

//       <AudioPlayer
//         fileName="Voice Message.mp3"
//         fileSize="2.1 MB"
//         audioUrl="https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
//         onMenuClick={() => console.log("Audio menu clicked")}
//       />

//       <VoicePlayer timestamp="7 hours ago" avatarFallback="JD" />

//       <VoicePlayer timestamp="2 days ago" avatarFallback="AS" />
//     </>
//   );
// }
