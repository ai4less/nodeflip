import { render } from 'preact'
import { Popup } from './Popup'
import './index.css'

// Inject global animations and base styles
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.2);
    }
  }
  
  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: translateY(10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes glow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(151, 51, 238, 0.4); 
    }
    50% { 
      box-shadow: 0 0 40px rgba(151, 51, 238, 0.6); 
    }
  }
  
  * { 
    box-sizing: border-box; 
  }
  
  body { 
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(26, 11, 46, 0.4);
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(151, 51, 238, 0.4);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(151, 51, 238, 0.6);
  }
`
document.head.appendChild(style)

render(<Popup />, document.getElementById('app'))
