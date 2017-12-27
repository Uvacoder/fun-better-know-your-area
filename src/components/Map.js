import extent from 'geojson-extent'
import mapboxgl from 'mapbox-gl'
import React, { Component } from 'react'

import { MAPBOX_KEY } from '../util/misc'

mapboxgl.accessToken = MAPBOX_KEY

class Map extends Component {
  state = { lng: -96, lat: 37, zoom: 2 }

  componentDidMount() {
    const { lng, lat, zoom } = this.state

    const map = new mapboxgl.Map({
      container: this.mapHolder,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [lng, lat],
      zoom,
    })

    map.scrollZoom.disable()

    map.on('load', this.initPlace)

    map.on('move', () => {
      const { lng, lat } = map.getCenter()

      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      })
    })

    this._mapbox = { map }
  }

  componentWillReceiveProps(newProps) {
    const { geoid } = newProps

    if (geoid !== this.props.geoid) {
      return this.highlightPlace(geoid)
    }
  }

  initPlace = () => {
    const { data, geoid } = this.props
    const { map } = this._mapbox

    const datum = data.find(d => d.geoid === geoid)
    if (!datum) return

    map.addSource('place', {
      type: 'geojson',
      data: datum.geom,
    })

    map.addLayer({
      id: 'place',
      type: 'fill',
      source: 'place',
      paint: {
        'fill-color': '#333',
        'fill-opacity': 0.4,
      },
    })

    map.fitBounds(extent(datum.geom), { padding: 20 })
  }

  highlightPlace = geoid => {
    const { data } = this.props
    const { map } = this._mapbox

    const datum = data.find(d => d.geoid === geoid)
    if (!datum) return

    map.getSource('place').setData(datum.geom)
    map.fitBounds(extent(datum.geom), { padding: 20 })
  }

  render() {
    const { name } = this.props

    return (
      <div className="relative">
        <div
          id="map"
          style={{ height: 300, width: '100%' }}
          ref={div => (this.mapHolder = div)}
        />
        <div
          className="absolute"
          style={{ maxWidth: 300, top: '50%', transform: 'translate(0, -50%)' }}
        >
          <span
            className="ml2 h1 bold bg-white multiline-padded-text"
            style={{ lineHeight: '1.3', padding: '4px 8px' }}
          >
            {name}
          </span>
        </div>
      </div>
    )
  }
}

export default Map