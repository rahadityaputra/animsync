// components/CommentSection.tsx
type CommentSectionProps = {
  comment: string;
  onCommentChange: (text: string) => void;
  onAddComment: () => void;
};

export function CommentSection({
  comment,
  onCommentChange,
  onAddComment
}: CommentSectionProps) {
  return (
    <div className="comment-section text-gray-200">
      <h3 className="text-lg font-semibold">Comments Section</h3>
      <p className="text-gray-400">Add Feedback Based on Timeline</p>
      
      <div className="comment-input mt-4">
        <input
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add your comment..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
        <button 
          onClick={onAddComment}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-full"
        >
          Add
        </button>
      </div>
    </div>
  );
}