"use client";
import { useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import ChatList from "@/components/chat/ChatList";
import Image from "next/image";  // next/image import 추가

interface ChatRoom {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  leader_id: string;
}

export default function ChatRoomList() {
  const supabase = createClient();
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 채팅방 목록 불러오기
  const fetchChatRooms = async () => {
    const { data } = await supabase
      .from("chatrooms")
      .select("id, title, image_url, leader_id, created_at")
      .order("created_at", { ascending: false });

    if (data) {
      setChatrooms(data);
    }
  };

  // 초기 로드
  useState(() => {
    fetchChatRooms();
  });

  // 이미지 업로드 및 채팅방 생성
  const handleCreateRoom = async () => {
    if (!newRoomTitle) return;

    let imageUrl = null;

    if (imageFile) {
      const fileExtension = imageFile.name.split(".").pop();
      const newFileName = `rooms/${Date.now()}.${fileExtension}`;

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

      imageUrl = data.publicUrl || "/images/default_room.png";
    } else {
      imageUrl = "/images/default_room.png";
    }

    const { data, error } = await supabase
      .from("chatrooms")
      .insert([{
        title: newRoomTitle,
        leader_id: "98603a54-582e-4273-b95c-221440c4565e",
        image_url: imageUrl,
        created_at: new Date().toISOString()
      }])
      .select();

    if (data) {
      setChatrooms([data[0], ...chatrooms]);
      setNewRoomTitle("");
      setImageFile(null);

      // 파일 입력 초기화
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } else {
      console.error("채팅방 생성 실패:", error);
    }
  };

  // 채팅방 삭제 핸들러
  const handleDeleteRoom = async (roomId: string) => {
    const { error } = await supabase
      .from("chatrooms")
      .delete()
      .eq("id", roomId);

    if (error) {
      console.error("채팅방 삭제 실패:", error);
      return;
    }

    // 상태에서 삭제된 채팅방 제거
    setChatrooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1200px] mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">채팅방 목록</h1>

        {/* 중앙 정렬된 채팅방 추가 폼 */}
        <div className="flex justify-center items-start gap-10 mb-10">
          {/* 이미지 미리보기 */}
          <div className="border rounded-lg overflow-hidden flex items-center justify-center">
            {imageFile ? (
              <Image
                src={URL.createObjectURL(imageFile)}
                alt="미리보기"
                width={400}
                height={250}
                className="rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex items-center justify-center text-gray-400"
                style={{ width: "400px", height: "250px" }}
              >
                미리보기
              </div>
            )}
          </div>

          {/* 입력 필드 및 버튼 */}
          <div className="flex flex-col gap-4 w-[400px]">
            <input
              type="text"
              placeholder="새 채팅방 이름"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              className="border p-3 rounded-lg w-full bg-white text-black"
            />

            <input
              id="file-input"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
              }}
              className="border p-3 rounded-lg w-full bg-white text-black"
            />

            <div className="flex justify-center">
              <button
                onClick={handleCreateRoom}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                채팅방 추가
              </button>
            </div>
          </div>
        </div>

        {/* 채팅방 목록 렌더링 */}
        <ChatList chatrooms={chatrooms} onDelete={handleDeleteRoom} />
      </div>
    </main>
  );
}