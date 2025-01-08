"use client";
import { useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  chat_img_url?: string | null;
}

interface ChatRoomProps {
  params: { id: string };
}

export default function ChatRoom({ params }: ChatRoomProps) {
  const supabase = createClient();
  const router = useRouter();
  const roomId = params.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [chatRoomTitle, setChatRoomTitle] = useState<string>("");

  const userId = process.env.NEXT_PUBLIC_AUTH_2;

  const fetchChatRoom = async () => {
    const { data: room } = await supabase
      .from("chatrooms")
      .select("id, title, image_url, leader_id, created_at")
      .eq("id", roomId)
      .single();

    if (!room) {
      return notFound();
    }

    setChatRoomTitle(room.title);

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    setMessages(messages || []);
  };

  useState(() => {
    fetchChatRoom();
  });

  const handleSendMessage = async () => {
    if (!newMessage && !imageFile) return;

    const userId = process.env.NEXT_PUBLIC_AUTH_2;
    if (!userId) {
      console.error("USER_ID is missing in environment variables.");
      alert("로그인이 필요합니다.");
      return;
    }

    let imageUrl = null;

    if (imageFile) {
      const fileExtension = imageFile.name.split(".").pop();
      const newFileName = `messages/${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(newFileName, imageFile);

      if (uploadError) {
        console.error("이미지 업로드 실패:", uploadError);
        return;
      }

      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(uploadData.path);

      imageUrl = data.publicUrl;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        content: newMessage,
        room_id: roomId,
        user_id: userId,
        created_at: new Date().toISOString(),
        chat_img_url: imageUrl
      }])
      .select();

    if (data) {
      setMessages([...messages, data[0]]);
      setNewMessage("");
      setImageFile(null);

      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } else {
      console.error("메시지 전송 실패:", error);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1200px] mx-auto py-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-black bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            ← 돌아가기
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">{chatRoomTitle || "채팅방"}</h1>

        <div className="border rounded-md p-6 bg-white shadow-md">
          {messages?.map((msg) => (
            <div key={msg.id} className="mb-4">
              {msg.chat_img_url && (
                <div className="relative w-60 h-60 mb-2">
                  <Image
                    src={msg.chat_img_url}
                    alt="채팅 이미지"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              )}
              <p className="text-lg">{msg.content}</p>
              <span className="text-sm text-gray-500">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <input
            id="file-input"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageFile(file);
            }}
            className="border rounded-lg p-3 bg-white text-black h-[52px]"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="border rounded-lg w-full p-3 bg-white text-black h-[52px]"
          />
          <button
            onClick={handleSendMessage}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition w-auto whitespace-nowrap"
          >
            보내기
          </button>
        </div>
      </div>
    </main>
  );
}