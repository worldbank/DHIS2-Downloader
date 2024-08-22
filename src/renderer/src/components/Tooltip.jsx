import React, { useState } from 'react'

// eslint-disable-next-line react/prop-types
const Tooltip = ({ children }) => {
  const [show, setShow] = useState(false)

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-gray-600 cursor-pointer relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="size-5"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clip-rule="evenodd"
        />
      </svg>

      {show && (
        <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-100 bg-opacity-75 text-gray-800 text-sm rounded shadow-lg">
          {children}
        </div>
      )}
    </span>
  )
}

export default Tooltip
