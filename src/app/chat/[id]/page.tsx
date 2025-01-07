"use client";
import { useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";  // useRouter 추가
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
  const router = useRouter();  // useRouter 훅 사용
  const roomId = params.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchChatRoom = async () => {
    const { data: room } = await supabase
      .from("chatrooms")
      .select("id, title, image_url, leader_id, created_at")
      .eq("id", roomId)
      .single();

    if (!room) {
      return notFound();
    }

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

    let imageUrl = null;

    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(`messages/${Date.now()}_${imageFile.name}`, imageFile);

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
        user_id: "447ba16f-7841-47e0-89c5-7fc3c8e398af",
        created_at: new Date().toISOString(),
        chat_img_url: imageUrl
      }])
      .select();

    if (data) {
      setMessages([...messages, data[0]]);
      setNewMessage("");
      setImageFile(null);
    } else {
      console.error("메시지 전송 실패:", error);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-10 bg-black text-white">
      {/* 돌아가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}  // -1로 이동
          className="text-white bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          ← 돌아가기
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">채팅방</h1>
      <div className="border rounded-md p-6 bg-gray-800 shadow-md">
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
            <span className="text-sm text-gray-400">
              {new Date(msg.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImageFile(file);
          }}
          className="border rounded-lg p-3 bg-gray-700 text-white h-[52px]"
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="border rounded-lg w-full p-3 bg-gray-700 text-white h-[52px]"
        />
        <button
          onClick={handleSendMessage}
          className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-300 hover:text-white transition w-auto whitespace-nowrap"
        >
          보내기
        </button>
      </div>
    </div>
  );
}