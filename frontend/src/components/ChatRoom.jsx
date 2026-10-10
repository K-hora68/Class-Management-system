import { useEffect, useRef, useState } from "react";
import { apiRequest, chatWebSocketUrl, getApiErrorMessage } from "../api.js";

function asList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function getRoomId(room) {
  return room.id ?? room.room_id;
}

function getMessageData(event) {
  return event?.data?.data ?? event?.data ?? event;
}

function mergeMessage(messages, incoming) {
  if (!incoming || incoming.id == null) return messages;
  const messageIndex = messages.findIndex((message) => message.id === incoming.id);
  if (messageIndex < 0) return [...messages, incoming];

  return messages.map((message, index) => index === messageIndex
    ? { ...message, ...incoming }
    : message);
}

function updateRoomMessages(setHistoryState, roomId, update) {
  setHistoryState((currentState) => {
    const isCurrentRoom = currentState.roomId === roomId;
    const currentMessages = isCurrentRoom ? currentState.messages : [];
    return {
      roomId,
      status: isCurrentRoom ? currentState.status : "loading",
      messages: update(currentMessages),
      error: isCurrentRoom ? currentState.error : "",
    };
  });
}

function ChatRoom({ role }) {
  const [roomState, setRoomState] = useState(() => ({
    role,
    status: "loading",
    rooms: [],
    error: "",
  }));
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [historyState, setHistoryState] = useState({ roomId: "", status: "idle", messages: [], error: "" });
  const [draft, setDraft] = useState("");
  const [connectionState, setConnectionState] = useState({ roomId: "", status: "disconnected" });
  const [notice, setNotice] = useState("");
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const messagesEndRef = useRef(null);
  const roomStateIsCurrent = roomState.role === role;
  const rooms = roomStateIsCurrent ? roomState.rooms : [];
  const roomStatus = roomStateIsCurrent ? roomState.status : "loading";
  const roomError = roomStateIsCurrent ? roomState.error : "";
  const historyIsCurrent = historyState.roomId === selectedRoomId;
  const messages = historyIsCurrent ? historyState.messages : [];
  const historyStatus = historyIsCurrent ? historyState.status : selectedRoomId ? "loading" : "idle";
  const historyError = historyIsCurrent ? historyState.error : "";
  const connectionStatus = connectionState.roomId === selectedRoomId
    ? connectionState.status
    : selectedRoomId ? "connecting" : "disconnected";
  const error = roomError || historyError;
  const selectedRoom = rooms.find((room) => String(getRoomId(room)) === selectedRoomId);

  useEffect(() => {
    let active = true;
    const classEndpoint = role === "student" ? "/students/me/classes" : "/classes";

    async function loadRooms() {
      try {
        const classes = asList(await apiRequest(classEndpoint));
        const roomGroups = await Promise.all(classes.map(async (classItem) => {
          const classId = classItem.id ?? classItem.class_id;
          if (classId == null) return [];

          const classRooms = asList(await apiRequest(`/classes/${encodeURIComponent(classId)}/chat-rooms`));
          return classRooms.map((room) => ({
            ...room,
            class_id: classId,
            class_name: classItem.title || classItem.name || classItem.course_name || classItem.code || "Class",
          }));
        }));

        if (active) {
          const availableRooms = roomGroups.flat();
          setRoomState({ role, status: "ready", rooms: availableRooms, error: "" });
          setSelectedRoomId((currentRoomId) => {
            const roomExists = availableRooms.some((room) => String(getRoomId(room)) === currentRoomId);
            return roomExists ? currentRoomId : String(getRoomId(availableRooms[0]) ?? "");
          });
        }
      } catch (requestError) {
        if (active) {
          setRoomState({ role, status: "error", rooms: [], error: getApiErrorMessage(requestError) });
        }
      }
    }

    loadRooms();
    return () => { active = false; };
  }, [role]);

  useEffect(() => {
    if (!selectedRoomId) return undefined;

    let active = true;
    apiRequest(`/chat-rooms/${encodeURIComponent(selectedRoomId)}/messages`)
      .then((response) => {
        if (!active) return;
        const history = asList(response).sort((left, right) => (
          new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime()
        ));
        setHistoryState((currentState) => {
          const liveMessages = currentState.roomId === selectedRoomId ? currentState.messages : [];
          const combinedMessages = history.reduce(mergeMessage, liveMessages);
          combinedMessages.sort((left, right) => (
            new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime()
          ));
          return { roomId: selectedRoomId, status: "ready", messages: combinedMessages, error: "" };
        });
      })
      .catch((requestError) => {
        if (active) {
          setHistoryState({
            roomId: selectedRoomId,
            status: "error",
            messages: [],
            error: getApiErrorMessage(requestError),
          });
        }
      });

    return () => { active = false; };
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return undefined;

    let active = true;
    let socket;

    function connect() {
      if (!active) return;
      if (reconnectAttemptRef.current > 0) {
        setConnectionState({ roomId: selectedRoomId, status: "reconnecting" });
      }

      try {
        socket = new WebSocket(chatWebSocketUrl(selectedRoomId));
        socketRef.current = socket;
      } catch {
        setConnectionState({ roomId: selectedRoomId, status: "disconnected" });
        return;
      }

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionState({ roomId: selectedRoomId, status: "connected" });
        setNotice("");
      };

      socket.onmessage = (socketEvent) => {
        let event;
        try {
          event = JSON.parse(socketEvent.data);
        } catch {
          return;
        }

        const message = getMessageData(event);
        if (event.type === "message" && message?.room_id != null
          && String(message.room_id) === selectedRoomId) {
          updateRoomMessages(setHistoryState, selectedRoomId, (currentMessages) => mergeMessage(currentMessages, message));
        } else if (event.type === "message_edited" && message?.id != null) {
          updateRoomMessages(setHistoryState, selectedRoomId, (currentMessages) => mergeMessage(currentMessages, message));
        } else if (event.type === "message_deleted" && message?.id != null) {
          updateRoomMessages(setHistoryState, selectedRoomId, (currentMessages) => (
            currentMessages.filter((item) => item.id !== message.id)
          ));
        } else if (event.type === "system" && message?.content) {
          setNotice(message.content);
        }
      };

      socket.onclose = () => {
        if (!active) return;
        reconnectAttemptRef.current += 1;
        setConnectionState({ roomId: selectedRoomId, status: "reconnecting" });
        const delay = Math.min(1000 * (2 ** Math.min(reconnectAttemptRef.current - 1, 5)), 30000);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => socket.close();
    }

    connect();
    return () => {
      active = false;
      window.clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      reconnectAttemptRef.current = 0;
    };
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [historyState.messages]);

  function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    const socket = socketRef.current;
    if (!content || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: "message", content }));
    setDraft("");
  }

  return (
    <section className="chat-workspace" aria-label="Class chat">
      <div className="chat-room-list">
        <div className="panel-heading">
          <h2>Class rooms</h2>
          <span className="panel-count">{roomStatus === "loading" ? "..." : rooms.length}</span>
        </div>
        {roomStatus === "loading" && <p className="empty-state">Finding your class rooms...</p>}
        {roomStatus === "ready" && rooms.length === 0 && (
          <p className="empty-state">No chat rooms are available in your classes yet.</p>
        )}
        {rooms.map((room) => {
          const roomId = String(getRoomId(room));
          return (
            <button
              className={`chat-room-option${roomId === selectedRoomId ? " active" : ""}`}
              key={roomId}
              onClick={() => setSelectedRoomId(roomId)}
              type="button"
            >
              <strong>{room.name || room.title || "Class room"}</strong>
              <small>{room.class_name}</small>
            </button>
          );
        })}
      </div>

      <div className="chat-conversation">
        {selectedRoom ? (
          <>
            <header className="chat-conversation-heading">
              <div>
                <p className="eyebrow">{selectedRoom.class_name}</p>
                <h2>{selectedRoom.name || selectedRoom.title || "Class room"}</h2>
              </div>
              <p className="chat-connection" role="status">{connectionStatus}</p>
            </header>
            {error && <p className="inline-error" role="alert">{error}</p>}
            {notice && <p className="chat-notice" role="status">{notice}</p>}
            <div className="chat-message-list" aria-live="polite" aria-relevant="additions text">
              {historyStatus === "loading" && <p className="empty-state">Loading room history...</p>}
              {historyStatus === "ready" && messages.length === 0 && (
                <p className="empty-state">No messages yet. Start the conversation.</p>
              )}
              {messages.map((message, index) => (
                <article className="chat-message" key={message.id ?? `${message.created_at}-${index}`}>
                  <div className="chat-message-heading">
                    <strong>{message.sender?.name || message.sender_name || "Class member"}</strong>
                    <time dateTime={message.created_at || undefined}>
                      {message.created_at ? new Date(message.created_at).toLocaleString() : ""}
                    </time>
                  </div>
                  <p>{message.content}</p>
                </article>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-composer" onSubmit={sendMessage}>
              <label className="visually-hidden" htmlFor="chat-message">Message</label>
              <textarea
                id="chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message..."
                rows={2}
                maxLength={4000}
                required
              />
              <button type="submit" disabled={connectionStatus !== "connected" || !draft.trim()}>
                Send message
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <p className="eyebrow">Class conversation</p>
            <h2>{roomStatus === "error" ? "Rooms could not be loaded." : "Choose a class room."}</h2>
            <p>Only rooms returned for your enrolled or teaching classes are shown here.</p>
            {(error || roomError) && <p className="inline-error" role="alert">{error || roomError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

export default ChatRoom;