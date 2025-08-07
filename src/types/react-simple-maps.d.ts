declare module 'react-simple-maps' {
  import * as React from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
      rotate?: [number, number, number]
    }
    width?: number
    height?: number
    children?: React.ReactNode
  }

  export interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void
    children?: React.ReactNode
  }

  export interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: any[] }) => React.ReactNode
  }

  export interface GeographyProps {
    geography: any
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    fill?: string
    stroke?: string
    strokeWidth?: number
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }

  export interface MarkerProps {
    coordinates: [number, number]
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const ZoomableGroup: React.FC<ZoomableGroupProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const Marker: React.FC<MarkerProps>
} 