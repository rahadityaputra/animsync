// components/RenderButton.tsx
export function RenderButton() {
  const startRender = () => {
    alert('Render process started!');
  };

  return (
    <div className="render-section">
      <button onClick={startRender} className="render-button">
        START RENDER
      </button>
    </div>
  );
}