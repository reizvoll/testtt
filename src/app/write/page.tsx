'use client';

import React, { useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressModal from './_components/AddressModal';
import ThumbnailUpload from './_components/ThumbnailUpload';
import { useAuthStore } from "@/lib/store/authStore";
import { createClient } from "@/lib/utils/supabase/client";

const supabase = createClient();


// 초기 상태 정의
const initialState = {
  address: '',
  position: { lat: '', lng: '' },
  title: '',
  content: '',
  bodySize: { height: '', weight: '' },
  thumbnail: '',
  tags: [] as string[],
};

// Reducer 함수 정의
function reducer(state: typeof initialState, action: { type: string; field?: string; value?: any }) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field!]: action.value };
    case 'SET_POSITION':
      return { ...state, position: action.value };
    case 'SET_BODY_SIZE':
      return { ...state, bodySize: { ...state.bodySize, ...action.value } };
    case 'SET_THUMBNAIL':
      return { ...state, thumbnail: action.value };
    case 'RESET':
      return initialState;
    default:
      throw new Error('Invalid action type');
  }
}

const WritePage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);

  // 게시글 저장 함수
  const handleSubmit = async () => {
    if (!state.title || !state.content || !state.address) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (!currentUser || !currentUser.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const post = {
        title: state.title,
        content: state.content,
        upload_place: state.address,
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        body_size: [parseFloat(state.bodySize.height) || 0, parseFloat(state.bodySize.weight) || 0], // int4[]로 전달
        thumbnail: state.thumbnail || '',
        tags: state.tags, // text[]로 전달
        comments: 0,
        likes: 0,
        view: 0,
      };
    
      const { error } = await supabase.from('posts').insert([post]);
      if (error) throw error;
    
      alert('저장 성공!');
      router.push('/posts');
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert('저장 실패');
    }
  };

  return (
    <div className="relative bg-white min-h-screen p-10">
      <div className="w-full max-w-[1200px] mx-auto border border-gray-300 rounded-md shadow-lg p-8">
        {/* 상단 버튼 */}
        <div className="flex justify-between items-center mb-8">
          <button className="px-6 py-2 bg-gray-200 border border-gray-300 rounded-lg">
            임시저장
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            완료
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex gap-8">
          {/* 썸네일 업로드 */}
          <div className="w-1/2">
            <ThumbnailUpload
              thumbnail={state.thumbnail}
              onThumbnailUpload={(thumbnailUrl) =>
                dispatch({ type: 'SET_THUMBNAIL', value: thumbnailUrl })
              }
            />
          </div>

          {/* 입력 필드 */}
          <div className="w-1/2 space-y-6">
            {/* 제목 */}
            <div>
              <label className="block mb-2 font-bold">제목</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="제목을 입력하세요."
              />
            </div>

            {/* 위치 */}
            <div>
              <label className="block mb-2 font-bold">위치</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={state.address}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="검색 버튼을 눌러 주소를 입력해주세요."
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                >
                  검색
                </button>
              </div>
            </div>

            {/* 체형 */}
            <div>
              <label className="block mb-2 font-bold">체형</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={state.bodySize.height}
                  onChange={(e) =>
                    dispatch({ type: 'SET_BODY_SIZE', value: { height: e.target.value } })
                  }
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="키 (cm)"
                />
                <input
                  type="number"
                  value={state.bodySize.weight}
                  onChange={(e) =>
                    dispatch({ type: 'SET_BODY_SIZE', value: { weight: e.target.value } })
                  }
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="몸무게 (kg)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mt-8">
          <label className="block mb-2 font-bold">본문</label>
          <textarea
            value={state.content}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'content', value: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={6}
            placeholder="본문 내용을 입력하세요."
          />
        </div>
      </div>

      {/* 주소 검색 모달 */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAddress={(selectedAddress: string) =>
          dispatch({ type: 'SET_FIELD', field: 'address', value: selectedAddress })
        }
      />
    </div>
  );
};

export default WritePage;