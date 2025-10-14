import { useEffect } from 'preact/hooks'

const OVERLAY_ID = 'nodeflip-generation-overlay'

const createOverlayElement = () => {
  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(2px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    animation: fadeIn 0.2s ease-out;
  `

  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 20px 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 14px;
    ">
      <div style="
        width: 24px;
        height: 24px;
        border: 3px solid #7C3AED;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <span style="
        font-size: 15px;
        font-weight: 600;
        color: #333;
      ">Building workflow...</span>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `

  return overlay
}

const removeOverlay = () => {
  const existingOverlay = document.getElementById(OVERLAY_ID)
  if (existingOverlay) {
    existingOverlay.remove()
  }
}

export const useCanvasOverlay = (isActive) => {
  useEffect(() => {
    const canvasContainer = document.querySelector('.vue-flow__viewport') ||
      document.querySelector('.vue-flow__container')

    if (isActive && canvasContainer) {
      const overlay = createOverlayElement()
      const parent = canvasContainer.parentElement || canvasContainer
      parent.style.position = parent.style.position || 'relative'
      parent.appendChild(overlay)
    } else if (!isActive) {
      removeOverlay()
    }

    return () => {
      removeOverlay()
    }
  }, [isActive])
}
