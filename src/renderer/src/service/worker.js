// worker.js
self.onmessage = async (e) => {
  const { url, username, password, index } = e.data
  const fetchOptions = {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Accept-Encoding': 'gzip, deflate, br'
    }
  }

  try {
    const response = await fetch(url, fetchOptions)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('Content-Type')
    let data

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text/csv') || contentType.includes('application/csv')) {
      data = await response.text()
    } else {
      throw new Error('Unsupported file type')
    }

    self.postMessage({ type: 'success', data: data, contentType: contentType, index: index })
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message, index: index })
  }
}
