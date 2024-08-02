import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import NotificationModal from './NotificationModal'
import SignoutModal from './SignoutModal'

const ModalManager = () => {
  const modals = useSelector((state) => state.modal.modals)
  const { isLoading, notification } = useSelector((state) => state.status)
  const dispatch = useDispatch()

  if (modals.length === 0) return null

  return (
    <>
      {modals.map((modal, index) => {
        switch (modal.type) {
          case 'NOTIFICATION':
            return (
              <NotificationModal
                key={index}
                isLoading={isLoading}
                message={notification.message}
                type={notification.type}
              />
            )
          case 'SIGN_OUT':
            return <SignoutModal key={index} />
          default:
            return null
        }
      })}
    </>
  )
}

export default ModalManager
