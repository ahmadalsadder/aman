'use client';

import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapChartProps {
    data: { [countryCode: string]: number }; // ISO_A3 -> count
}

export function WorldMapChart({ data }: WorldMapChartProps) {
    const maxPassengers = useMemo(() => Math.max(...Object.values(data), 0), [data]);

    const colorScale = scaleLinear<string>()
        .domain([0, 1, maxPassengers])
        .range(["#E0E7FF", "#6366F1", "#3730A3"]);

    return (
        <div className="w-full h-[400px] border rounded-lg bg-muted/50 overflow-hidden">
            <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: "100%", height: "100%" }}>
                <ZoomableGroup center={[0, 0]} zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryCode = geo.properties.ISO_A3 || geo.properties.A3;
                                const passengerCount = data[countryCode] || 0;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={passengerCount > 0 ? colorScale(passengerCount) : "#D1D5DB"}
                                        stroke="#FFFFFF"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none', fill: '#4f46e5' },
                                            pressed: { outline: 'none' },
                                        }}
                                    >
                                        <title>
                                            {`${geo.properties.name}: ${passengerCount.toLocaleString()} passenger(s)`}
                                        </title>
                                    </Geography>
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}
