import Image from "next/image";
import { createClient } from "@/lib/utils/supabase/client";  // Supabase 클라이언트 추가
import { useRouter } from "next/navigation";  // 페이지 새로고침 없이 반영

interface ChatRoom {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

interface ChatListProps {
  chatrooms: ChatRoom[];
  onDelete: (id: string) => void;
}

export default function ChatList({ chatrooms, onDelete }: ChatListProps) {
  return (
    <div className="max-w-[1200px] mx-auto py-10 bg-white text-black">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {chatrooms.map((room) => (
          <div
            key={room.id}
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition bg-white"
          >
            <a href={`/chat/${room.id}`}>
              {room.image_url && (
                <Image
                  src={room.image_url}
                  alt={room.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              )}
            </a>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{room.title}</h2>
                <p className="text-sm text-gray-500">
                  생성일: {new Date(room.created_at).toLocaleDateString()}
                </p>
              </div>
              {/* 삭제 버튼 */}
              <button
                onClick={() => onDelete(room.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}