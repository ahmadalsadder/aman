// Mock data for the main dashboard
export const mainDashboardData = {
    throughput: [
        { name: '00:00', transactions: 110 },
        { name: '02:00', transactions: 180 },
        { name: '04:00', transactions: 250 },
        { name: '06:00', transactions: 450 },
        { name: '08:00', transactions: 730 },
        { name: '10:00', transactions: 890 },
        { name: '12:00', transactions: 820 },
        { name: '14:00', transactions: 950 },
        { name: '16:00', transactions: 1120 },
        { name: '18:00', transactions: 980 },
        { name: '20:00', transactions: 750 },
        { name: '22:00', transactions: 350 },
    ],
    riskRules: [
        { name: 'Watchlist Match', value: 12 },
        { name: 'Irregular Travel Pattern', value: 8 },
        { name: 'Expired Document', value: 5 },
        { name: 'Invalid Visa', value: 3 },
        { name: 'Baggage Anomaly', value: 2 },
    ],
    nationalityDistribution: {
        'USA': 1250,
        'IND': 980,
        'CHN': 750,
        'GBR': 680,
        'DEU': 550,
        'FRA': 490,
        'CAN': 450,
        'AUS': 380,
        'JPN': 320,
        'BRA': 280,
    }
};

// Mock data for the airport-specific dashboard
export const airportDashboardData = {
    ageDistribution: [
        { name: '0-17', value: 1254 },
        { name: '18-24', value: 2341 },
        { name: '25-34', value: 3123 },
        { name: '35-44', value: 2876 },
        { name: '45-59', value: 1987 },
        { name: '60+', value: 872 },
    ],
    nationalityDistribution: [
        { name: 'USA', value: 1021 },
        { name: 'UK', value: 843 },
        { name: 'India', value: 765 },
        { name: 'Germany', value: 654 },
        { name: 'China', value: 543 },
        { name: 'Canada', value: 432 },
        { name: 'Australia', value: 321 },
        { name: 'France', value: 210 },
        { name: 'UAE', value: 198 },
        { name: 'Nigeria', value: 154 },
    ]
};
