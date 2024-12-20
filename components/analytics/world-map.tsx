import { useState, useEffect } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps"
import { scaleLinear } from 'd3-scale'
import type { CountryDistribution } from '@/lib/utils/analytics'
import { Card, CardContent } from '@/components/ui/card'

const geoUrl = "/world-110m.json"

interface WorldMapProps {
  countryDistribution: CountryDistribution
}

export function WorldMap({ countryDistribution }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState("")
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 })
  
  // Create a combined distribution that includes Hong Kong's data in China's total
  const combinedDistribution = Object.entries(countryDistribution).reduce((acc, [country, count]) => {
    if (country === "Hong Kong SAR China") {
      // Add Hong Kong's count to China's total
      acc["China"] = (acc["China"] || 0) + count
      // Store Hong Kong's count separately for tooltip
      acc["HongKongCount"] = count
    } else {
      acc[country] = (acc[country] || 0) + count
    }
    return acc
  }, {} as Record<string, number>)
  
  const maxValue = Math.max(...Object.values(combinedDistribution).filter(v => typeof v === 'number'))
  
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(["#ffedea", "#ff5233"])

  function handleMoveEnd(position: { coordinates: [number, number]; zoom: number }) {
    setPosition(position)
  }

  return (
    <Card>
      <CardContent>
        <div style={{ width: "100%", height: "400px", backgroundColor: "#ffffff", position: "relative" }}>
          {tooltipContent && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                padding: "8px",
                background: "white",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                fontSize: "14px",
                zIndex: 10
              }}
            >
              {tooltipContent}
            </div>
          )}
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 150,
              center: [0, 0]
            }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates as [number, number]}
              onMoveEnd={handleMoveEnd}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoName = geo.properties.name
                    const count = combinedDistribution[geoName] || 0
                    const hongKongCount = combinedDistribution["HongKongCount"] || 0
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={count > 0 ? colorScale(count) : "#F5F5F5"}
                        stroke="#D6D6DA"
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: "none",
                          },
                          hover: {
                            outline: "none",
                            fill: "#F53",
                            transition: "all 250ms",
                          },
                          pressed: {
                            outline: "none",
                          },
                        }}
                        onMouseEnter={() => {
                          if (geoName === "China" && hongKongCount > 0) {
                            setTooltipContent(`${geoName}: ${count} users (including Hong Kong: ${hongKongCount} users)`)
                          } else {
                            setTooltipContent(`${geoName}: ${count} users`)
                          }
                        }}
                        onMouseLeave={() => {
                          setTooltipContent("")
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </CardContent>
    </Card>
  )
} 