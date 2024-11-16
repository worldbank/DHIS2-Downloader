import React, { useState, useRef, useEffect } from 'react'

// eslint-disable-next-line react/prop-types
const Tooltip = ({ children }) => {
  const [show, setShow] = useState(false)
  const tooltipRef = useRef(null)
  const [tooltipPosition, setTooltipPosition] = useState({})

  useEffect(() => {
    if (tooltipRef.current && show) {
      const { offsetHeight } = tooltipRef.current
      setTooltipPosition({
        top: `-${offsetHeight + 8}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      })
    }
  }, [show])

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full cursor-pointer relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>

      {show && (
        <div
          ref={tooltipRef}
          className="absolute w-80 bg-gray-100 bg-opacity-75 text-sm rounded shadow-lg p-3"
          style={tooltipPosition}
        >
          {children}
        </div>
      )}
    </span>
  )
}

export default Tooltip
