import React, { useState } from 'react'

// eslint-disable-next-line react/prop-types
export const Accordion = ({ title, children, isOpen, toggleAccordion }) => {
  return (
    <div className={`${isOpen ? 'border-t-0' : 'border-t'} border-x border-b border-gray-300`}>
      <button
        onClick={toggleAccordion}
        className="w-full px-4 py-3 text-left bg-gff-green text-white font-semibold flex justify-between items-center"
      >
        {title}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="p-4 bg-white text-gray-800">{children}</div>}
    </div>
  )
}

// eslint-disable-next-line react/prop-types
export const AccordionGroup = ({ children }) => {
  const [openAccordionId, setOpenAccordionId] = useState(null)

  const toggleAccordion = (id) => {
    if (openAccordionId === id) {
      setOpenAccordionId(null) // Close this accordion if it's already open
    } else {
      setOpenAccordionId(id) // Open the clicked accordion and close others
    }
  }

  // Clone each child and inject the open state and toggle function
  const childrenWithProps = React.Children.map(children, (child, index) =>
    React.cloneElement(child, {
      isOpen: openAccordionId === index,
      toggleAccordion: () => toggleAccordion(index)
    })
  )

  return <div>{childrenWithProps}</div>
}
