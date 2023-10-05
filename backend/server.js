import { Server } from "socket.io";
import { dbConnect } from "./db/dbConnection.js";
import {
  getDocument,
  updateDocument,
} from "./controller/documentController.js";

const PORT = process.env.PORT ?? 8000;

dbConnect();

const io = new Server(PORT, {
  cors: {
    origin: "", // Enter your localhost link
    methods: ["GET", "POST"],
  },
});

io.on("Connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });
});
