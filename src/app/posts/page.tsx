'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // posts 상태에 Post[] 타입 명시
  const [posts, setPosts] = useState<Post[]>([]);

  // 페이지 로딩 시 게시글 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  // Supabase에서 게시글 불러오기
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 불러오기 실패:', error);
    } else {
      // 데이터가 있을 경우 상태 업데이트
      setPosts(data || []);
    }
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
            <p className="text-sm text-gray-500">
              위치: {post.upload_place}
            </p>
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