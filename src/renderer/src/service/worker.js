// Define the fetchData function within the worker script
const fetchData = async (apiUrl, username, password, timeout = 1200000) => {
  const controller = new AbortController()
  const { signal } = controller
  const fetchOptions = {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    },
    signal
  }

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(apiUrl, fetchOptions)
    clearTimeout(timeoutId)
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'An error occurred while fetching data')
    }
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`)
    }
    throw error
  }
}

self.onmessage = async (event) => {
  const { url, options, chunkSize, username, password } = event.data
  let offset = 0
  const results = []

  while (true) {
    const end = offset + chunkSize - 1
    const headers = new Headers(options.headers)
    headers.set('Range', `bytes=${offset}-${end}`)
    headers.set('Authorization', `Basic ${btoa(`${username}:${password}`)}`)
    const fetchOptions = { ...options, headers }

    try {
      const response = await fetchData(url, fetchOptions)
      const chunk = await response.arrayBuffer()
      results.push(chunk)
      self.postMessage({
        status: 'progress',
        offset: offset + chunk.byteLength,
        length: chunk.byteLength
      })

      if (chunk.byteLength < chunkSize) {
        break
      }

      offset += chunk.byteLength
    } catch (error) {
      self.postMessage({ status: 'error', message: error.message })
      return
    }
  }

  self.postMessage({ status: 'done', results })
}
