'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const WritePage = () => {
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState({ lat: '', lng: '' });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // env에서 user_id 가져오기
  const userId = process.env.NEXT_PUBLIC_AUTH_2;
  const handleLocationCheck = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude.toString(), lng: longitude.toString() });
          getAddress(latitude, longitude);
        },
        (err) => {
          console.error('위치 권한이 거부되었습니다.', err);
          setLoading(false);
        }
      );
    } else {
      console.error('Geolocation을 지원하지 않는 브라우저입니다.');
    }
  };
  const getAddress = async (lat: number, lng: number) => {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });
      const data = await response.json();
      if (data.documents.length > 0) {
        const { region_1depth_name, region_2depth_name, region_3depth_name } =
          data.documents[0].address;
        setAddress(`${region_1depth_name} ${region_2depth_name} ${region_3depth_name}`);
      } else {
        setAddress('주소 정보 없음');
      }
    } catch (error) {
      console.error('주소 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (!title || !content || !address) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    if (!userId) {
      alert('로그인이 필요합니다.');
      console.error('USER_ID is missing in environment variables.');
      return;
    }
    const { error } = await supabase.from('posts').insert([
      {
        title,
        content,
        upload_place: address,
        latitude: position.lat,
        longitude: position.lng,
        created_at: new Date().toISOString(),
        user_id: userId,  // env에서 가져온 user_id 삽입
      },
    ]);
    if (error) {
      console.error('Supabase 저장 실패:', error);
      alert('저장 실패');
    } else {
      alert('저장 성공!');
      router.push('/posts');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-2xl p-8 border border-gray-300 shadow-lg rounded-md">
        <h1 className="text-3xl font-bold mb-6">게시글 작성</h1>
        <label className="block mb-4">
          제목
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="mt-2 p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <label className="block mb-4">
          내용
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="mt-2 p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-400"
            rows={5}
          />
        </label>
        <button
          onClick={handleLocationCheck}
          disabled={loading}
          className={`w-full p-3 mt-4 text-white rounded-md ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? '주소 확인 중...' : '현재 위치 주소 확인'}
        </button>
        <p className="mt-4 text-center text-lg">
          현재 위치: {address || '주소 정보 없음'}
        </p>
        <button
          onClick={handleSubmit}
          className="w-full p-3 mt-6 bg-green-500 hover:bg-green-600 text-white rounded-md"
        >
          게시글 업로드
        </button>
      </div>
    </div>
  );
};
export default WritePage;