import React from 'react';

interface AddressDisplayProps {
  address: string;
}

const AddressDisplay = ({ address }: AddressDisplayProps) => {
  return (
    <p className="mt-4 text-center text-lg">
      현재 위치: {address || '주소 정보 없음'}
    </p>
  );
};

export default AddressDisplay;