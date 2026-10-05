import { MessageList } from "./components/chat/MessageList";
import { ChatInput } from "./components/chat/ChatInput";
import { mockMessages } from "./mocks/messages";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MessageList messages={mockMessages} />
      <ChatInput onSend={(text) => console.log("send:", text)} />
    </div>
  );
}

export default App;
