'use client';
import React, { useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressModal from './_components/AddressModal';
import { createClient } from "@/lib/utils/supabase/client";

const supabase = createClient();

const initialState = {
  address: '',
  position: { lat: '', lng: '' },
  title: '',
  content: '',
  bodySize: { height: '', weight: '' },
  thumbnail: '',
  tags: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_POSITION':
      return { ...state, position: action.value };
    case 'SET_BODY_SIZE':
      return { ...state, bodySize: { ...state.bodySize, ...action.value } };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.value] };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter((tag) => tag !== action.value) };
    case 'RESET':
      return initialState;
    default:
      throw new Error('Invalid action type');
  }
}

const WritePage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const userId = process.env.NEXT_PUBLIC_AUTH_2;

  const handleLocationCheck = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          dispatch({ type: 'SET_POSITION', value: { lat: latitude.toString(), lng: longitude.toString() } });
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

  const getAddress = async (lat, lng) => {
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
        dispatch({ type: 'SET_FIELD', field: 'address', value: `${region_1depth_name} ${region_2depth_name} ${region_3depth_name}` });
      } else {
        dispatch({ type: 'SET_FIELD', field: 'address', value: '주소 정보 없음' });
      }
    } catch (error) {
      console.error('주소 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!state.title || !state.content || !state.address) {
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
        title: state.title,
        content: state.content,
        upload_place: state.address,
        created_at: new Date().toISOString(),
        user_id: userId,
        body_size: JSON.stringify(state.bodySize),
        thumbnail: state.thumbnail,
        tags: JSON.stringify(state.tags),
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
    <div className="relative bg-white min-h-screen flex justify-center items-center">
      <div className="absolute top-0 left-0 w-full h-[96px] bg-gray-300 flex items-center">
        <div className="ml-16 w-[140px] h-[48px] bg-gray-400"></div>
      </div>
      <div className="w-full max-w-[1200px] p-8 border border-gray-300 shadow-lg rounded-md">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Title</h1>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-white border border-black rounded-lg text-black">
                임시저장
              </button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-black text-white rounded-lg">
                완료
              </button>
            </div>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-[486px] h-[486px] bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-center font-bold text-lg">
                  드래그 인 드롭이나 추가하기 버튼으로 커버 사진을 업로드해주세요.
                </span>
              </div>
              <button className="w-[180px] h-[48px] bg-black text-white rounded-lg">
                커버 사진 추가하기
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <label>
                <span className="text-lg font-bold">위치 입력</span>
                <div className="mt-2 px-4 py-3 border border-black rounded-lg">
                  <p>{state.address || '주소 정보 없음'}</p>
                </div>
              </label>
              <label>
                <span className="text-lg font-bold">체형</span>
                <div className="flex gap-6 mt-2">
                  <div className="flex flex-col">
                    <span>키</span>
                    <input
                      type="text"
                      value={state.bodySize.height}
                      onChange={(e) =>
                        dispatch({ type: 'SET_BODY_SIZE', value: { height: e.target.value } })
                      }
                      className="mt-1 px-4 py-2 border border-black rounded-lg"
                      placeholder="cm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span>몸무게</span>
                    <input
                      type="text"
                      value={state.bodySize.weight}
                      onChange={(e) =>
                        dispatch({ type: 'SET_BODY_SIZE', value: { weight: e.target.value } })
                      }
                      className="mt-1 px-4 py-2 border border-black rounded-lg"
                      placeholder="kg"
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
          <label className="mt-6">
            <span className="text-lg font-bold">본문</span>
            <textarea
              value={state.content}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'content', value: e.target.value })}
              className="w-full mt-2 px-4 py-3 border border-black rounded-lg"
              placeholder="본문 내용을 입력하세요."
              rows={5}
            />
          </label>
        </div>
        <div className="mt-8">
          <span className="text-lg font-bold">룩북 구성 상품</span>
          <div className="w-[180px] h-[180px] bg-white border border-black rounded-lg flex items-center justify-center mt-4">
            <span className="text-lg font-medium">+ 추가</span>
          </div>
        </div>
      </div>
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