# Carbon Footprint Tracker

A comprehensive web application for calculating and tracking personal carbon emissions across multiple categories, with real-time calculations and personalized PDF report generation.

## Overview

This carbon footprint calculator helps individuals understand their environmental impact and provides actionable recommendations to reduce emissions. The app is aligned with the Paris Agreement target of 2 tonnes CO₂ per person per year.

## Features

### Multi-Category Tracking
- **Transportation**: Car travel, public transport, and flights
- **Home Energy**: Electricity consumption, heating, and renewable energy usage
- **Food & Diet**: Diet-based calculations with meal-specific tracking
- **Shopping & Consumer Goods**: Clothing, electronics, and household purchases
- **Water & Waste**: Water usage, landfill, recycling, and composting

### Real-Time Calculations
- Instant emission updates as you enter data
- Scientific emission factors from EPA, DEFRA, and GHG Protocol
- Country-specific electricity grid factors

### Visual Dashboard
- Total annual carbon footprint display
- Interactive pie chart showing emission breakdown by category
- Color-coded comparison to Paris Agreement 2-ton target:
  - Green: Under 2 tonnes (On target)
  - Yellow: 2-4 tonnes (Above target)
  - Red: Over 4 tonnes (Significantly above target)

### Personalized Report Generation
- Downloadable PDF report with:
  - Total emissions summary
  - Visual pie chart
  - Category breakdown table
  - Top 3 personalized reduction recommendations
  - Carbon offset information (trees needed)
  - Practical "How to Reduce" tips for each category

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no build tools required)
- **Charts**: Chart.js for data visualization
- **PDF Generation**: jsPDF + html2canvas
- **Design**: Custom CSS with responsive layout

## Calculation Methodology

### Transportation Emissions
```
Car: (Monthly distance × 12 × fuel efficiency × fuel factor) / 100
Bus: Monthly distance × 12 × 0.089 kg CO₂/km
Train: Monthly distance × 12 × 0.041 kg CO₂/km
Short-haul flight: Number of flights × 255 kg CO₂
Long-haul flight: Number of flights × 975 kg CO₂
```

**Fuel Emission Factors:**
- Petrol: 2.31 kg CO₂/L
- Diesel: 2.68 kg CO₂/L

### Home Energy Emissions
```
Electricity: Monthly kWh × 12 × grid factor × (1 - renewable %)
Natural Gas: Monthly m³ × 12 × 2.0 kg CO₂/m³
```

**Grid Emission Factors (kg CO₂/kWh):**
- India: 0.71
- USA: 0.475
- UK: 0.233
- Germany: 0.233

### Food & Diet Emissions
```
Base emissions by diet type + weekly servings × emission factor × 52 weeks
```

**Base Annual Emissions:**
- Vegan: 600 kg CO₂e
- Vegetarian: 1,200 kg CO₂e
- Pescatarian: 1,500 kg CO₂e
- Omnivore: 2,500 kg CO₂e

**Per Serving Emissions (150g):**
- Beef: 9 kg CO₂e
- Chicken: 1.035 kg CO₂e
- Fish: 0.825 kg CO₂e
- Cheese/Dairy: 3.15 kg CO₂e

### Shopping Emissions
```
(Spending × emission factor / 1000) × (1 - second-hand %)
```

**Spend-Based Factors:**
- Clothing: 0.5 kg CO₂ per ₹1000
- Electronics: 1.2 kg CO₂ per ₹1000
- Household goods: 0.8 kg CO₂ per ₹1000

### Water & Waste Emissions
```
Water: Monthly m³ × 12 × 0.40 kg CO₂/m³
Landfill: Monthly kg × 12 × 0.5 kg CO₂/kg
Recycling: Monthly kg × 12 × 0.4 kg CO₂/kg (savings)
```

## Installation

No installation required. This is a standalone HTML file.

### Running Locally

1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. Start calculating your carbon footprint

### Deployment

Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server

Simply upload the `index.html` file.

## Usage Guide

### Step 1: Profile Setup
1. Enter your name
2. Select your country (determines electricity emission factor)
3. Specify household size
4. Choose housing type

### Step 2: Track Emissions

Navigate through tabs to enter data for each category:

**Transportation Tab:**
- Monthly driving distance and vehicle type
- Public transport usage (bus/train)
- Annual flights (short-haul/long-haul)

**Home Energy Tab:**
- Monthly electricity consumption (kWh)
- Heating type and usage
- Renewable energy percentage

**Food & Diet Tab:**
- Select diet type
- Log weekly servings of different foods
- Specify local/seasonal food percentage

**Shopping Tab:**
- Annual spending on clothing, electronics, household goods
- Second-hand purchase percentage

**Water & Waste Tab:**
- Monthly water consumption
- Waste breakdown (landfill, recycling, composting)

### Step 3: View Dashboard
- Total annual emissions displayed in kg and tonnes
- Pie chart showing category breakdown
- Color-coded comparison to 2-ton target

### Step 4: Generate Report
- Click "Generate Report" button
- PDF downloads automatically with:
  - Summary of emissions
  - Visualizations
  - Personalized recommendations
  - Reduction tips

### Step 5: Take Action
Review recommendations and implement changes to reduce your carbon footprint.

## Data Sources & References

### Emission Factors
- **EPA** (Environmental Protection Agency): Transportation and energy factors
- **DEFRA** (UK Department for Environment): Fuel emission factors
- **GHG Protocol**: Global standards for carbon accounting
- **IPCC**: Climate science and carbon budgets
- **Our World in Data**: Food emission factors
- **ICAO**: Aviation carbon calculator methodology

### Scientific Basis
- Paris Agreement 2-ton per capita target
- Life Cycle Assessment (LCA) data for products
- Regional electricity grid emission factors

## Features Roadmap

### Completed
- [x] Multi-category emission tracking
- [x] Real-time calculations
- [x] Visual dashboard with charts
- [x] PDF report generation
- [x] Personalized recommendations
- [x] Responsive design

### Future Enhancements
- [ ] User accounts and historical tracking
- [ ] Month-over-month comparison
- [ ] Carbon offset marketplace integration
- [ ] Receipt/bill scanning for automatic entry
- [ ] Integration with smart home devices
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] API for third-party integrations
- [ ] Machine learning for predictive insights

## Browser Compatibility

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled.

## Contributing

This is a college project, but suggestions and improvements are welcome.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with detailed description

## License

This project is open source and available for educational purposes.

## Contact & Support

For questions, suggestions, or bug reports, please open an issue in the repository.

## Acknowledgments

- Built as a college project to promote climate awareness
- Emission factors sourced from EPA, DEFRA, GHG Protocol, and IPCC
- Inspired by the Paris Agreement climate goals
- Special thanks to the open-source community for Chart.js and jsPDF libraries

## Environmental Impact Statement

This application itself is designed with sustainability in mind:
- Single-file architecture minimizes data transfer
- No external dependencies beyond CDN libraries
- Efficient calculations reduce processing power
- Client-side computation reduces server load

---

**Remember**: Every small step counts. The goal isn't perfection—it's progress toward a sustainable future.

**Target**: 2 tonnes CO₂ per person per year (Paris Agreement aligned)