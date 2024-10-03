const calculateSignedArea = (ring) => {
  let area = 0
  const n = ring.length

  for (let i = 0; i < n; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % n]
    area += (x2 - x1) * (y2 + y1)
  }

  return area / 2
}

// Function to ensure right-hand rule is followed
const enforceRightHandRule = (coordinates, isPolygon = true) => {
  if (isPolygon) {
    // For Polygons, check the first ring (exterior ring) and reverse if necessary
    const [exteriorRing, ...interiorRings] = coordinates
    const exteriorArea = calculateSignedArea(exteriorRing)

    // Create a copy before reversing to avoid mutating the original
    const correctedExteriorRing = exteriorArea > 0 ? exteriorRing : [...exteriorRing].reverse()

    // Interior rings (holes) must be clockwise
    const correctedInteriorRings = interiorRings.map((ring) => {
      const interiorArea = calculateSignedArea(ring)
      return interiorArea < 0 ? ring : [...ring].reverse()
    })

    return [correctedExteriorRing, ...correctedInteriorRings]
  } else {
    // For MultiPolygons, enforce the right-hand rule for each polygon
    return coordinates.map((polygon) => enforceRightHandRule(polygon, true))
  }
}

// Function to determine GeoJSON type and enforce the right-hand rule
export const getGeoJSONType = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return null
  }
  // Check if it's a Point (coordinates are a pair of numbers)
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return {
      type: 'Point',
      coordinates: coordinates
    }
  }
  // Check if it's a Polygon (coordinates are an array of arrays of points)
  else if (
    Array.isArray(coordinates[0]) &&
    coordinates[0].length > 0 &&
    Array.isArray(coordinates[0][0]) &&
    coordinates[0][0].length > 0 &&
    typeof coordinates[0][0][0] === 'number'
  ) {
    const correctedCoordinates = enforceRightHandRule(coordinates, true)
    return {
      type: 'Polygon',
      coordinates: correctedCoordinates
    }
  }
  // Check if it's a MultiPolygon
  else if (
    Array.isArray(coordinates[0]) &&
    coordinates[0].length > 0 &&
    Array.isArray(coordinates[0][0]) &&
    coordinates[0][0].length > 0
  ) {
    const correctedCoordinates = enforceRightHandRule(coordinates, false)
    return {
      type: 'MultiPolygon',
      coordinates: correctedCoordinates
    }
  } else {
    return null
  }
}
export const parseCoordinates = (coordinates) => {
  try {
    const parsed = JSON.parse(coordinates)
    const geometry = getGeoJSONType(parsed)
    if (!geometry) {
      console.warn('Failed to get GeoJSON type for coordinates:', parsed)
    }
    return geometry
  } catch (error) {
    console.warn('Error parsing coordinates:', coordinates, error)
    return null
  }
}
