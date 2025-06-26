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
    <div className="comment-section">
      <h3>Comments Section</h3>
      <p>Add Feedback Based on Timeline</p>
      
      <div className="comment-input">
        <input
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add your comment..."
          className="comment-text"
        />
        <button onClick={onAddComment} className="add-comment">
          Add
        </button>
      </div>
    </div>
  );
}