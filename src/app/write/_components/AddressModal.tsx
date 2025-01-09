import React, { useState } from 'react';

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (selectedAddress: string) => void;
};

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSelectAddress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const resultsPerPage = 10; // 한 페이지에 표시할 결과 수

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchTerm} 동`;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

    try {
      setLoading(true);
      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });
      const data = await response.json();

      console.log('API 응답 데이터:', data); // 디버깅용 출력

      if (data.documents.length > 0) {
        // "ㅇㅇ동" 정보만 필터링 및 중복 제거
        const filteredResults = data.documents
          .filter((doc: any) => doc.address_name.includes('동')) // 동 포함 여부 확인
          .map((doc: any) => {
            const addressParts = doc.address_name.split(' ');
            return addressParts.slice(0, 3).join(' '); // 시, 구, 동까지만 포함
          });

        const uniqueResults = Array.from(new Set(filteredResults)) as string[]; // 중복 제거
        setSearchResults(uniqueResults);
        setCurrentPage(1); // 검색 시 페이지 초기화
      } else {
        setSearchResults([]); // 검색 결과 없을 때 빈 배열 설정
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션: 현재 페이지의 결과 가져오기
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">주소 검색</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="주소 입력 (예: 동대문구, 휘경동)"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="w-full p-3 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? '검색 중...' : '검색'}
          </button>
          {searchResults.length > 0 ? (
            <>
              <ul className="mt-4">
                {paginatedResults.map((result, index) => (
                  <li
                    key={index}
                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      onSelectAddress(result);
                      onClose();
                    }}
                  >
                    {result}
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  이전
                </button>
                <span>
                  {currentPage} / {Math.ceil(searchResults.length / resultsPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(searchResults.length / resultsPerPage))
                    )
                  }
                  disabled={currentPage === Math.ceil(searchResults.length / resultsPerPage)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === Math.ceil(searchResults.length / resultsPerPage)
                      ? 'bg-gray-300'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  다음
                </button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-center text-gray-500">검색 결과가 없습니다.</p>
          )}
          <button
            onClick={onClose}
            className="w-full p-3 mt-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
          >
            닫기
          </button>
        </div>
      </div>
    )
  );
};

export default AddressModal;