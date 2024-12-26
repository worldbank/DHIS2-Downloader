let secretKey = null

export const initializeSecretKey = async () => {
  try {
    secretKey = await window.secureApi.getSecretKey()
    console.log('Secret key initialized')
  } catch (error) {
    console.error('Failed to initialize secret key:', error)
    throw error
  }
}

export const getSecretKey = () => {
  if (!secretKey) {
    throw new Error('Secret key has not been initialized')
  }
  return secretKey
}
