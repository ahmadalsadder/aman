
'use client';

import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapChartProps {
    data: { [countryCode: string]: number }; // ISO_A3 -> count
}

export function WorldMapChart({ data }: WorldMapChartProps) {
    const maxPassengers = useMemo(() => {
        const values = Object.values(data);
        return values.length > 0 ? Math.max(...values) : 0;
    }, [data]);

    const colorScale = scaleLinear<string>()
        .domain([0, 1, maxPassengers > 0 ? maxPassengers : 1])
        .range(["hsl(var(--muted))", "hsl(var(--primary) / 0.5)", "hsl(var(--primary))"]);

    return (
        <div className="w-full h-[400px] border rounded-lg bg-background overflow-hidden">
            <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: "100%", height: "100%" }}>
                <ZoomableGroup center={[0, 0]} zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryCode = geo.properties.ISO_A3;
                                const passengerCount = data[countryCode] || 0;
                                const fillColor = passengerCount > 0 ? colorScale(passengerCount) : "hsl(var(--muted-foreground) / 0.2)";
                                
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={fillColor}
                                        stroke="hsl(var(--card))"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none', fill: 'hsl(var(--primary) / 0.8)' },
                                            pressed: { outline: 'none', fill: 'hsl(var(--primary))'},
                                        }}
                                    >
                                        <title>
                                            {`${geo.properties.NAME}: ${passengerCount.toLocaleString()} passenger(s)`}
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
