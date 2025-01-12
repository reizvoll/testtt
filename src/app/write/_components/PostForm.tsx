import React from 'react';

interface PostFormProps {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
}

const PostForm = ({ title, content, setTitle, setContent }: PostFormProps) => {
  return (
    <>
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
    </>
  );
};

export default PostForm;