import ChatInterface from "@/components/chat/ChatInterface";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <main className="h-screen w-full">
        <ChatInterface />
      </main>
    </ProtectedRoute>
  );
}
