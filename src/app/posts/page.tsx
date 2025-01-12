'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore'; // 인증 상태를 가져오는 스토어
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/utils/supabase/client";

const supabase = createClient();

// Post 타입 정의
interface Post {
  id: string;
  title: string;
  content: string;
  upload_place: string;
  created_at: string;
}

// 게시글 목록 및 삭제 페이지
const PostsPage = () => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user); // 로그인 상태 확인
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 로그인 상태 확인
  useEffect(() => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      router.push('/login'); // 로그인 페이지로 리다이렉트
    } else {
      fetchPosts(); // 게시글 불러오기
    }
  }, [currentUser, router]);

  // Supabase에서 게시글 불러오기
  const fetchPosts = async () => {
    setLoading(true); // 로딩 시작
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 불러오기 실패:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false); // 로딩 종료
  };

  // 게시글 삭제 핸들러
  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .match({ id });

    if (error) {
      console.error('게시글 삭제 실패:', error);
    } else {
      alert('게시글이 삭제되었습니다.');
      fetchPosts(); // 삭제 후 목록 갱신
    }
  };

  if (!currentUser || loading) {
    // 로딩 중 또는 로그인하지 않은 상태
    return <p className="p-8 text-center">로딩 중...</p>;
  }

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-4xl font-bold mb-6">게시글 목록</h1>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post.id}
            className="p-6 mb-4 bg-gray-100 rounded-md shadow"
          >
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-lg">{post.content}</p>
            <p className="text-sm text-gray-500">위치: {post.upload_place}</p>
            <p className="text-sm text-gray-400">
              작성일: {new Date(post.created_at).toLocaleDateString()}
            </p>

            <button
              onClick={() => deletePost(post.id)}
              className="mt-4 bg-red-500 p-2 text-white rounded"
            >
              삭제
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-lg">게시글이 없습니다.</p>
      )}
    </div>
  );
};

export default PostsPage;