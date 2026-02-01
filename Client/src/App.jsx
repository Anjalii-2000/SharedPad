import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [text, setText] = useState("");
  const [users, setUsers] = useState(1);

  useEffect(() => {
    socket.on("load-document", (doc) => {
      setText(doc);
    });

    socket.on("update-document", (doc) => {
      setText(doc);
    });

    socket.on("users-count", (count) => {
      setUsers(count);
    });

    return () => {
      socket.off("load-document");
      socket.off("update-document");
      socket.off("users-count");
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    socket.emit("edit-document", value);
  };

  // 💾 Native Save As dialog
 const saveFile = async () => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: "SharedPad.txt",
      types: [
        {
          description: "Text Files",
          accept: { "text/plain": [".txt"] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();

    alert("File saved successfully ✅");
  } catch (err) {
    console.log("Save cancelled", err);
  }
};

  return (
    <div className="app">
      <div className="header">
        <span>📄 SharedPad™</span>
        <span>👥 {users} online</span>
      </div>

      <div className="editor-wrapper">
        <div className="editor-container">
          <div className="watermark">SharedPad</div>

          <textarea
            className="editor"
            value={text}
            onChange={handleChange}
            placeholder="Start typing..."
          />
        </div>
      </div>

      <button className="save-btn" onClick={saveFile}>
        💾 Save
      </button>
    </div>
  );
}

export default App;