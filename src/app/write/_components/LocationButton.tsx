import React from 'react';

interface LocationButtonProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setPosition: (position: { lat: string; lng: string }) => void;
  setAddress: (address: string) => void;
}

const LocationButton = ({
  loading,
  setLoading,
  setPosition,
  setAddress,
}: LocationButtonProps) => {
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

  return (
    <button
      onClick={handleLocationCheck}
      disabled={loading}
      className={`w-full p-3 mt-4 text-white rounded-md ${
        loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {loading ? '주소 확인 중...' : '현재 위치 주소 확인'}
    </button>
  );
};

export default LocationButton;