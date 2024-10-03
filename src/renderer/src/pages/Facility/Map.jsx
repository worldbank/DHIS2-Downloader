import React, { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { useSelector, useDispatch } from 'react-redux'
import { MicroArrowTopRight } from '../../components/Icons'
import { fetchFacilityData, loadDataFromDexie } from '../../reducers/facilityReducer'
import { triggerLoading } from '../../reducers/statusReducer'

// Constants
const MAP_CONFIG = {
  width: 800,
  height: 600,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  zoomExtent: [1, 8]
}

// Styles for different levels
const STYLES = {
  polygon: {
    fill: '#e0f2fe',
    stroke: '#3b82f6',
    strokeWidth: 1,
    hoverFill: '#fbbf24',
    hoverStroke: '#f59e0b',
    hoverStrokeWidth: 2
  },
  levelPolygon: {
    1: { fill: '#e0f2fe', stroke: '#3b82f6', strokeWidth: 1 },
    2: { fill: '#fde68a', stroke: '#d97706', strokeWidth: 1 },
    3: { fill: '#bbf7d0', stroke: '#15803d', strokeWidth: 1 },
    4: { fill: '#ddd6fe', stroke: '#7c3aed', strokeWidth: 1 }
  },
  point: {
    fill: '#ef4444',
    stroke: '#fff',
    strokeWidth: 0.5,
    radius: 3
  }
}

// Tooltip Component
// eslint-disable-next-line react/display-name, react/prop-types
const Tooltip = React.memo(({ x, y, content }) => (
  <div
    className="absolute bg-white border border-gray-300 rounded px-2 py-1 text-sm shadow-lg pointer-events-none whitespace-nowrap"
    style={{
      left: x,
      top: y,
      transform: 'translate(-50%, -100%)'
    }}
  >
    <strong>{content}</strong>
  </div>
))

// Level Selector Component
// eslint-disable-next-line react/prop-types
const LevelSelector = ({ levels, selectedLevels, setSelectedLevels }) => {
  const handleLevelChange = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  return (
    <div className="mb-4 flex flex-wrap">
      {levels.map((level) => (
        <label key={level} className="mr-4 mt-2 flex items-center">
          <input
            type="checkbox"
            value={level}
            checked={selectedLevels.includes(level)}
            onChange={() => handleLevelChange(level)}
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-sm text-gray-700">Level {level}</span>
        </label>
      ))}
    </div>
  )
}

const D3Map = () => {
  const svgRef = useRef()
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const { geoJsonData, dataProcessed } = useSelector((state) => state.facility)

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })
  const zoomTransformRef = useRef(d3.zoomIdentity)

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(triggerLoading(true))
        await dispatch(loadDataFromDexie()).unwrap()
      } catch (error) {
        console.log('No data in Dexie or error loading, fetching from remote...')
        await dispatch(fetchFacilityData({ dhis2Url, username, password })).unwrap()
        await dispatch(loadDataFromDexie()).unwrap()
      } finally {
        dispatch(triggerLoading(false))
      }
    }
    loadData()
  }, [dispatch, dhis2Url, username, password])

  const handleGeoJsonExport = () => {
    const dataStr = JSON.stringify(geoJsonData)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'facilities.geojson'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const featuresByLevel = useMemo(() => {
    if (!geoJsonData) return {}
    return geoJsonData.features.reduce((acc, feature) => {
      const level = feature.properties.level || 1
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        acc[level] = acc[level] || { polygons: [], points: [] }
        acc[level].polygons.push(feature)
      } else if (feature.geometry.type === 'Point') {
        acc[level] = acc[level] || { polygons: [], points: [] }
        acc[level].points.push(feature)
      }
      return acc
    }, {})
  }, [geoJsonData])

  // Available levels sorted in ascending order
  const availableLevels = useMemo(() => {
    return Object.keys(featuresByLevel)
      .map(Number)
      .sort((a, b) => a - b)
  }, [featuresByLevel])

  // State for selected levels
  const [selectedLevels, setSelectedLevels] = useState(availableLevels)

  // Event handlers for tooltip and hover effects
  const handleMouseOver = (event, d) => {
    const target = d3.select(event.target)
    const isPoint = d.geometry.type === 'Point'

    target
      .attr('fill', STYLES.polygon.hoverFill)
      .attr('stroke', STYLES.polygon.hoverStroke)
      .attr(
        'stroke-width',
        isPoint
          ? STYLES.polygon.hoverStrokeWidth / zoomTransformRef.current.k
          : STYLES.polygon.hoverStrokeWidth
      )

    if (d.properties?.name) {
      setTooltip({
        visible: true,
        x: event.pageX,
        y: event.pageY,
        content: d.properties.name
      })
    }
  }

  const handleMouseMove = (event) => {
    setTooltip((prev) => ({
      ...prev,
      x: event.pageX,
      y: event.pageY
    }))
  }

  const handleMouseOut = (event, d) => {
    const target = d3.select(event.target)
    const isPoint = d.geometry.type === 'Point'
    const level = d.properties.level || 1

    target
      .attr(
        'fill',
        isPoint ? STYLES.point.fill : STYLES.levelPolygon[level]?.fill || STYLES.polygon.fill
      )
      .attr(
        'stroke',
        isPoint ? STYLES.point.stroke : STYLES.levelPolygon[level]?.stroke || STYLES.polygon.stroke
      )
      .attr(
        'stroke-width',
        isPoint
          ? STYLES.point.strokeWidth / zoomTransformRef.current.k
          : STYLES.levelPolygon[level]?.strokeWidth || STYLES.polygon.strokeWidth
      )

    setTooltip({ visible: false, x: 0, y: 0, content: '' })
  }

  // Main effect for rendering the map
  useEffect(() => {
    if (!dataProcessed || !geoJsonData) return

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${MAP_CONFIG.width} ${MAP_CONFIG.height}`)
      .attr('class', 'border border-gray-300 shadow-lg')

    // Clear previous contents
    svg.selectAll('*').remove()

    const g = svg.append('g')

    // Gather all selected features
    const allSelectedFeatures = selectedLevels.reduce(
      (acc, level) => {
        const levelFeatures = featuresByLevel[level] || { polygons: [], points: [] }
        acc.polygons = acc.polygons.concat(levelFeatures.polygons)
        acc.points = acc.points.concat(levelFeatures.points)
        return acc
      },
      { polygons: [], points: [] }
    )

    // Use all features if none are selected
    const featuresToRender =
      allSelectedFeatures.polygons.length || allSelectedFeatures.points.length
        ? allSelectedFeatures
        : {
            polygons: geoJsonData.features.filter(
              (feature) =>
                feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
            ),
            points: geoJsonData.features.filter((feature) => feature.geometry.type === 'Point')
          }

    // Define projection and path generator
    const projection = d3
      .geoMercator()
      .fitSize(
        [
          MAP_CONFIG.width - MAP_CONFIG.margin.left - MAP_CONFIG.margin.right,
          MAP_CONFIG.height - MAP_CONFIG.margin.top - MAP_CONFIG.margin.bottom
        ],
        {
          type: 'FeatureCollection',
          features: [...featuresToRender.polygons, ...featuresToRender.points]
        }
      )

    const pathGenerator = d3.geoPath().projection(projection)

    // Zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent(MAP_CONFIG.zoomExtent)
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        zoomTransformRef.current = event.transform

        // Update point sizes and stroke widths based on zoom
        g.selectAll('.feature-point')
          .attr('r', STYLES.point.radius / event.transform.k)
          .attr('stroke-width', STYLES.point.strokeWidth / event.transform.k)
      })

    svg.call(zoom)

    // Sort levels to ensure proper layering (lower levels first)
    const sortedLevels = selectedLevels.slice().sort((a, b) => a - b)

    // Render features for each selected level
    sortedLevels.forEach((level) => {
      const levelFeatures = featuresByLevel[level]
      if (levelFeatures) {
        const { polygons, points } = levelFeatures

        // Draw polygons
        if (polygons.length) {
          g.selectAll(`.feature-polygon-level-${level}`)
            .data(polygons)
            .join('path')
            .attr('class', `feature-polygon-level-${level}`)
            .attr('d', pathGenerator)
            .attr('fill', STYLES.levelPolygon[level]?.fill || STYLES.polygon.fill)
            .attr('stroke', STYLES.levelPolygon[level]?.stroke || STYLES.polygon.stroke)
            .attr('stroke-width', STYLES.levelPolygon[level]?.strokeWidth)
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut)
        }

        // Draw points
        if (points.length) {
          g.selectAll(`.feature-point-level-${level}`)
            .data(points)
            .join('circle')
            .attr('class', `feature-point-level-${level} feature-point`)
            .attr('cx', (d) => projection(d.geometry.coordinates)[0])
            .attr('cy', (d) => projection(d.geometry.coordinates)[1])
            .attr('r', STYLES.point.radius / zoomTransformRef.current.k)
            .attr('fill', STYLES.point.fill)
            .attr('stroke', STYLES.point.stroke)
            .attr('stroke-width', STYLES.point.strokeWidth / zoomTransformRef.current.k)
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut)
        }
      }
    })
  }, [geoJsonData, featuresByLevel, selectedLevels, dataProcessed])

  return (
    <div className="container mx-auto max-w-4xl relative">
      <div className="flex justify-start space-x-4 mb-2">
        <button
          className="text-blue-500 hover:text-blue-700 font-medium text-sm"
          onClick={handleGeoJsonExport}
        >
          <MicroArrowTopRight /> Export GeoJson
        </button>
      </div>
      <LevelSelector
        levels={availableLevels}
        selectedLevels={selectedLevels}
        setSelectedLevels={setSelectedLevels}
      />

      <svg ref={svgRef} className="w-full h-auto mt-6" />

      {tooltip.visible && <Tooltip {...tooltip} />}
    </div>
  )
}

export default D3Map
