import CryptoJS from 'crypto-js'

export const encryptPassword = (password, secretKey) => {
  return CryptoJS.AES.encrypt(password, secretKey).toString()
}

export const decryptPassword = (encryptedPassword, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const isValidPassword = (encryptedPassword, secretKey, plainPassword) => {
  try {
    const decryptedPassword = decryptPassword(encryptedPassword, secretKey)
    return decryptedPassword === plainPassword
  } catch (error) {
    console.error('Decryption failed:', error)
    return false
  }
}
