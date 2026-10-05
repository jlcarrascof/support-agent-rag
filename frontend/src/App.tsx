import { MessageList } from "./components/chat/MessageList";
import { mockMessages } from "./mocks/messages";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MessageList messages={mockMessages} />
    </div>
  );
}

export default App;
