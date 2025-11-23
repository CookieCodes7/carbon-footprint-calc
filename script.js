const state = {
    currentScreen: 'welcome',
    currentTab: 'transportation',
    profile: {
        name: '',
        country: 'India',
        householdSize: 1,
        houseType: 'Apartment'
    },
    transportation: {
        monthlyDistance: 0,
        vehicleType: 'Petrol Car',
        busDistance: 0,
        trainDistance: 0,
        flightsPerYear: 0,
        flightCategory: 'Short-haul'
    },
    energy: {
        electricityConsumption: 0,
        heatingType: 'None',
        heatingConsumption: 0,
        renewablePercentage: 0
    },
    food: {
        dietType: 'Omnivore',
        beefServings: 0,
        chickenServings: 0,
        fishServings: 0,
        dairyServings: 0,
        localPercentage: 0
    },
    shopping: {
        clothingSpend: 0,
        electronicsSpend: 0,
        householdSpend: 0,
        secondhandPercentage: 0
    },
    water: {
        waterConsumption: 0,
        landfillWaste: 0,
        recycledWaste: 0,
        compostWaste: 0
    }
};

// Data
const data = {
    countries: [
        { name: 'India', gridFactor: 0.71 },
        { name: 'USA', gridFactor: 0.475 },
        { name: 'UK', gridFactor: 0.233 },
        { name: 'Germany', gridFactor: 0.233 }
    ],
    vehicles: [
        { name: 'Petrol Car', efficiency: 6, fuelFactor: 2.31 },
        { name: 'Diesel Car', efficiency: 5.5, fuelFactor: 2.68 },
        { name: 'Hybrid', efficiency: 4, fuelFactor: 1.15 },
        { name: 'Electric', efficiency: 0, fuelFactor: 0 },
        { name: 'Motorcycle', efficiency: 4.5, fuelFactor: 2.31 }
    ],
    dietBaseEmissions: {
        'Vegan': 600,
        'Vegetarian': 1200,
        'Pescatarian': 1500,
        'Omnivore': 2500
    },
    foodFactors: {
        beef: 9,
        chicken: 1.035,
        fish: 0.825,
        dairy: 3.15
    },
    shoppingFactors: {
        clothing: 0.5,
        electronics: 1.2,
        household: 0.8
    }
};

// Calculation Engine
const calculations = {
    getGridFactor() {
        const country = data.countries.find(c => c.name === state.profile.country);
        return country ? country.gridFactor : 0.71;
    },

    getVehicleData() {
        return data.vehicles.find(v => v.name === state.transportation.vehicleType) || data.vehicles[0];
    },

    calculateTransportation() {
        let total = 0;

        // Car emissions
        const vehicle = this.getVehicleData();
        if (vehicle.efficiency > 0) {
            const monthlyCarEmissions = (state.transportation.monthlyDistance * vehicle.efficiency * vehicle.fuelFactor) / 100;
            total += monthlyCarEmissions * 12;
        }

        // Public transport
        total += state.transportation.busDistance * 12 * 0.089;
        total += state.transportation.trainDistance * 12 * 0.041;

        // Flights
        const flightEmissions = state.transportation.flightCategory === 'Short-haul' ? 255 : 975;
        total += state.transportation.flightsPerYear * flightEmissions;

        return total;
    },

    calculateEnergy() {
        let total = 0;
        const gridFactor = this.getGridFactor();

        // Electricity
        const electricityEmissions = state.energy.electricityConsumption * 12 *
            (gridFactor * (1 - state.energy.renewablePercentage / 100));
        total += electricityEmissions;

        // Heating
        if (state.energy.heatingType === 'Natural Gas') {
            total += state.energy.heatingConsumption * 12 * 2.0;
        } else if (state.energy.heatingType === 'Heating Oil') {
            total += state.energy.heatingConsumption * 12 * 2.68;
        } else if (state.energy.heatingType === 'Electric') {
            total += state.energy.heatingConsumption * 12 * gridFactor;
        } else if (state.energy.heatingType === 'Heat Pump') {
            total += state.energy.heatingConsumption * 12 * gridFactor * 0.25;
        }

        return total;
    },

    calculateFood() {
        let total = data.dietBaseEmissions[state.food.dietType] || 2500;

        // Add specific servings
        total += state.food.beefServings * 52 * data.foodFactors.beef;
        total += state.food.chickenServings * 52 * data.foodFactors.chicken;
        total += state.food.fishServings * 52 * data.foodFactors.fish;
        total += state.food.dairyServings * 52 * data.foodFactors.dairy;

        // Apply local food reduction
        const localReduction = (state.food.localPercentage / 100) * 0.3;
        total = total * (1 - localReduction);

        return total;
    },

    calculateShopping() {
        const total = (
            state.shopping.clothingSpend * data.shoppingFactors.clothing +
            state.shopping.electronicsSpend * data.shoppingFactors.electronics +
            state.shopping.householdSpend * data.shoppingFactors.household
        ) / 1000;

        // Apply second-hand reduction
        return total * (1 - state.shopping.secondhandPercentage / 100);
    },

    calculateWater() {
        const water = state.water.waterConsumption * 12 * 0.40;
        const waste = (state.water.landfillWaste * 0.5 - state.water.recycledWaste * 0.4) * 12;
        return water + Math.max(0, waste);
    },

    calculateTotal() {
        return {
            transportation: this.calculateTransportation(),
            energy: this.calculateEnergy(),
            food: this.calculateFood(),
            shopping: this.calculateShopping(),
            water: this.calculateWater()
        };
    },

    getTotalEmissions() {
        const breakdown = this.calculateTotal();
        return Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    },

    getColorClass(tonnes) {
        if (tonnes < 2) return 'green';
        if (tonnes < 4) return 'yellow';
        return 'red';
    }
};

// Chart Management
let chartInstance = null;

function createChart(breakdown) {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = Object.keys(breakdown);
    const values = Object.values(breakdown);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value.toFixed(0) + ' kg CO2e';
                        }
                    }
                }
            }
        }
    });
}

// Recommendation Engine
function getRecommendations() {
    const breakdown = calculations.calculateTotal();
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const recommendations = [];

    // Calculate percentages
    const percentages = {};
    for (const [key, value] of Object.entries(breakdown)) {
        percentages[key] = (value / total) * 100;
    }

    // Transportation recommendations
    if (percentages.transportation > 40) {
        const saved = state.transportation.monthlyDistance * 2 * 0.089 * 12;
        recommendations.push({
            category: 'Transportation',
            tip: `Switch to public transport 2 days per week to save approximately ${saved.toFixed(0)} kg CO2 per year.`
        });
    }

    // Energy recommendations
    if (percentages.energy > 35) {
        const saved = state.energy.electricityConsumption * 12 * calculations.getGridFactor() * 0.5;
        recommendations.push({
            category: 'Energy',
            tip: `Switch to renewable energy or install solar panels to save approximately ${saved.toFixed(0)} kg CO2 per year.`
        });
    }

    // Food recommendations
    if (percentages.food > 25 && state.food.beefServings > 0) {
        const saved = 2 * 52 * data.foodFactors.beef;
        recommendations.push({
            category: 'Food',
            tip: `Replace 2 beef meals per week with plant-based alternatives to save approximately ${saved.toFixed(0)} kg CO2 per year.`
        });
    }

    // Shopping recommendations
    if (percentages.shopping > 20) {
        const currentShopping = calculations.calculateShopping();
        const saved = currentShopping * 0.5;
        recommendations.push({
            category: 'Shopping',
            tip: `Purchase 50% of items second-hand to save approximately ${saved.toFixed(0)} kg CO2 per year.`
        });
    }

    // Water recommendations
    if (percentages.water > 10) {
        recommendations.push({
            category: 'Water & Waste',
            tip: 'Reduce shower time by 2 minutes daily and increase recycling to save approximately 100 kg CO2 per year.'
        });
    }

    return recommendations.slice(0, 3);
}

// PDF Generation
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const breakdown = calculations.calculateTotal();
    const total = calculations.getTotalEmissions();
    const tonnes = total / 1000;

    // Title
    pdf.setFontSize(20);
    pdf.text('Carbon Footprint Report', 105, 20, { align: 'center' });

    // Date and Name
    pdf.setFontSize(12);
    pdf.text(`Name: ${state.profile.name}`, 20, 35);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);

    // Total Footprint
    pdf.setFontSize(16);
    pdf.text('Total Annual Footprint', 20, 55);
    pdf.setFontSize(14);
    pdf.text(`${total.toFixed(0)} kg CO2e (${tonnes.toFixed(2)} tonnes)`, 20, 63);

    // Comparison
    const comparison = ((tonnes - 2) / 2 * 100).toFixed(0);
    const compText = tonnes < 2 ?
        `${Math.abs(comparison)}% below the 2-ton Paris Agreement target` :
        `${comparison}% above the 2-ton Paris Agreement target`;
    pdf.setFontSize(11);
    pdf.text(compText, 20, 71);

    // Category Breakdown
    pdf.setFontSize(14);
    pdf.text('Emissions Breakdown', 20, 85);
    pdf.setFontSize(11);
    let yPos = 93;
    for (const [category, value] of Object.entries(breakdown)) {
        const percentage = ((value / total) * 100).toFixed(1);
        pdf.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${value.toFixed(0)} kg (${percentage}%)`, 20, yPos);
        yPos += 7;
    }

    // Recommendations
    pdf.setFontSize(14);
    pdf.text('Personalized Recommendations', 20, yPos + 10);
    pdf.setFontSize(10);
    yPos += 18;
    const recommendations = getRecommendations();
    recommendations.forEach((rec, idx) => {
        const lines = pdf.splitTextToSize(`${idx + 1}. ${rec.category}: ${rec.tip}`, 170);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 5 + 3;
    });

    // Environmental Impact
    pdf.setFontSize(14);
    pdf.text('Environmental Impact', 20, yPos + 10);
    pdf.setFontSize(10);
    const kmEquivalent = (total / 2.31 / 6 * 100).toFixed(0);
    pdf.text(`Your emissions equal driving ${kmEquivalent} km in a gas car.`, 20, yPos + 18);
    const treesNeeded = (total / 20).toFixed(0);
    pdf.text(`Trees needed to offset annually: ${treesNeeded}`, 20, yPos + 25);

    // Save
    pdf.save('carbon-footprint-report.pdf');
}

// UI Rendering Functions
function renderWelcome() {
    return `
                <div class="welcome-screen">
                    <div class="welcome-content">
                       <video class="welcome-video" autoplay muted loop playsinline>
    <source src="videos/unicorn.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
                        <h1>Calculate Your Carbon Footprint</h1>
                        <p>Understanding your carbon footprint is the first step toward a more sustainable lifestyle. The Paris Agreement aims to limit global warming to 1.5°C, which requires each person to emit no more than <strong>2 tonnes of CO2</strong> per year by 2030.</p>
                        <p>This calculator will help you measure your annual carbon emissions across transportation, energy, food, shopping, and waste. Let's get started!</p>
                        <button class="btn btn-primary" onclick="navigateTo('profile')">Get Started</button>
                    </div>
                </div>
            `;
}

function renderProfile() {
    return `
                <div class="profile-screen">
                    <div class="card">
                        <h2>Your Profile</h2>
                        <p class="form-label" style="margin-top: 16px; color: var(--color-text-secondary);">Tell us a bit about yourself to personalize your carbon footprint calculation.</p>
                        
                        <div class="form-group">
                            <label class="form-label">Your Name</label>
                            <input type="text" class="form-control" value="${state.profile.name}" 
                                onchange="updateProfile('name', this.value)" placeholder="Enter your name">
                        </div>
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="form-label">Country</label>
                                <select class="form-control" onchange="updateProfile('country', this.value)">
                                    ${data.countries.map(c =>
        `<option value="${c.name}" ${state.profile.country === c.name ? 'selected' : ''}>${c.name}</option>`
    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Household Size</label>
                                <select class="form-control" onchange="updateProfile('householdSize', parseInt(this.value))">
                                    ${[1, 2, 3, 4, 5, 6].map(n =>
        `<option value="${n}" ${state.profile.householdSize === n ? 'selected' : ''}>${n} ${n === 6 ? '+' : ''}</option>`
    ).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">House Type</label>
                            <select class="form-control" onchange="updateProfile('houseType', this.value)">
                                ${['Apartment', 'Detached House', 'Townhouse'].map(t =>
        `<option value="${t}" ${state.profile.houseType === t ? 'selected' : ''}>${t}</option>`
    ).join('')}
                            </select>
                        </div>
                        
                        <div class="info-box">
                            <strong>Regional Electricity Factor:</strong> ${calculations.getGridFactor()} kg CO2/kWh
                        </div>
                        
                        <div class="button-group">
                            <button class="btn btn-secondary" onclick="navigateTo('welcome')">Back</button>
                            <button class="btn btn-primary" onclick="navigateTo('tracker')">Continue to Calculator</button>
                        </div>
                    </div>
                </div>
            `;
}

function renderTracker() {
    const breakdown = calculations.calculateTotal();
    const total = calculations.getTotalEmissions();
    const tonnes = total / 1000;
    const colorClass = calculations.getColorClass(tonnes);
    const comparison = ((tonnes - 2) / 2 * 100).toFixed(0);
    const comparisonText = tonnes < 2 ?
        `${Math.abs(comparison)}% below the 2-ton target` :
        `${comparison}% above the 2-ton target`;

    return `
                <div class="tracker-screen">
                    <h2>Carbon Footprint Calculator</h2>
                    
                    <div class="total-footprint">
                        <div class="total-value ${colorClass}">${total.toFixed(0)} kg</div>
                        <div style="font-size: var(--font-size-xl); margin-bottom: 8px;">${tonnes.toFixed(2)} tonnes CO2e per year</div>
                        <div class="comparison-text">Your footprint is ${comparisonText}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min((tonnes / 4) * 100, 100)}%;"></div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="tabs">
                            <button class="tab ${state.currentTab === 'transportation' ? 'active' : ''}" 
                                onclick="switchTab('transportation')">Transportation</button>
                            <button class="tab ${state.currentTab === 'energy' ? 'active' : ''}" 
                                onclick="switchTab('energy')">Home Energy</button>
                            <button class="tab ${state.currentTab === 'food' ? 'active' : ''}" 
                                onclick="switchTab('food')">Food &amp; Diet</button>
                            <button class="tab ${state.currentTab === 'shopping' ? 'active' : ''}" 
                                onclick="switchTab('shopping')">Shopping</button>
                            <button class="tab ${state.currentTab === 'water' ? 'active' : ''}" 
                                onclick="switchTab('water')">Water &amp; Waste</button>
                        </div>
                        
                        ${renderTabContent()}
                    </div>
                    
                    <div class="card">
                        <h3>Emissions Breakdown</h3>
                        <div class="chart-container">
                            <canvas id="emissionsChart"></canvas>
                        </div>
                        
                        <ul class="category-list">
                            ${Object.entries(breakdown).map(([cat, val]) => {
        const percentage = ((val / total) * 100).toFixed(1);
        return `
                                    <li class="category-item">
                                        <span class="category-name">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                        <span class="category-value">${val.toFixed(0)} kg (${percentage}%)</span>
                                    </li>
                                `;
    }).join('')}
                        </ul>
                    </div>
                    
                    <div class="button-group">
                        <button class="btn btn-secondary" onclick="navigateTo('profile')">Back to Profile</button>
                        <button class="btn btn-primary" onclick="navigateTo('report')">Generate Report</button>
                    </div>
                </div>
            `;
}

function renderTabContent() {
    const tabs = {
        transportation: renderTransportationTab(),
        energy: renderEnergyTab(),
        food: renderFoodTab(),
        shopping: renderShoppingTab(),
        water: renderWaterTab()
    };

    return Object.entries(tabs).map(([key, content]) =>
        `<div class="tab-content ${state.currentTab === key ? 'active' : ''}">${content}</div>`
    ).join('');
}

function renderTransportationTab() {
    const emissions = calculations.calculateTransportation();
    return `
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Monthly Distance Driven (km)</label>
                        <input type="number" class="form-control" min="0" value="${state.transportation.monthlyDistance}" 
                            onchange="updateTransportation('monthlyDistance', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Vehicle Type</label>
                        <select class="form-control" onchange="updateTransportation('vehicleType', this.value)">
                            ${data.vehicles.map(v =>
        `<option value="${v.name}" ${state.transportation.vehicleType === v.name ? 'selected' : ''}>${v.name}</option>`
    ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Monthly Bus Distance (km)</label>
                        <input type="number" class="form-control" min="0" value="${state.transportation.busDistance}" 
                            onchange="updateTransportation('busDistance', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Monthly Train Distance (km)</label>
                        <input type="number" class="form-control" min="0" value="${state.transportation.trainDistance}" 
                            onchange="updateTransportation('trainDistance', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Flights Per Year</label>
                        <input type="number" class="form-control" min="0" value="${state.transportation.flightsPerYear}" 
                            onchange="updateTransportation('flightsPerYear', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Flight Distance Category</label>
                        <select class="form-control" onchange="updateTransportation('flightCategory', this.value)">
                            <option value="Short-haul" ${state.transportation.flightCategory === 'Short-haul' ? 'selected' : ''}>Short-haul (&lt;4 hours)</option>
                            <option value="Long-haul" ${state.transportation.flightCategory === 'Long-haul' ? 'selected' : ''}>Long-haul (&gt;4 hours)</option>
                        </select>
                    </div>
                </div>
                
                <div class="live-calc">
                    <div>Annual Transportation Emissions</div>
                    <div class="live-calc-value">${emissions.toFixed(0)} kg CO2e</div>
                </div>
            `;
}

function renderEnergyTab() {
    const emissions = calculations.calculateEnergy();
    return `
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Monthly Electricity (kWh)</label>
                        <input type="number" class="form-control" min="0" value="${state.energy.electricityConsumption}" 
                            onchange="updateEnergy('electricityConsumption', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Heating Type</label>
                        <select class="form-control" onchange="updateEnergy('heatingType', this.value)">
                            ${['None', 'Natural Gas', 'Heating Oil', 'Electric', 'Heat Pump'].map(t =>
        `<option value="${t}" ${state.energy.heatingType === t ? 'selected' : ''}>${t}</option>`
    ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Monthly Heating (m³ for gas, kWh for others)</label>
                        <input type="number" class="form-control" min="0" value="${state.energy.heatingConsumption}" 
                            onchange="updateEnergy('heatingConsumption', parseFloat(this.value) || 0)">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Renewable Energy Percentage: <span class="slider-value">${state.energy.renewablePercentage}%</span></label>
                    <div class="slider-container">
                        <input type="range" class="slider" min="0" max="100" value="${state.energy.renewablePercentage}" 
                            oninput="updateEnergy('renewablePercentage', parseFloat(this.value))">
                    </div>
                </div>
                
                <div class="live-calc">
                    <div>Annual Energy Emissions</div>
                    <div class="live-calc-value">${emissions.toFixed(0)} kg CO2e</div>
                </div>
            `;
}

function renderFoodTab() {
    const emissions = calculations.calculateFood();
    return `
                <div class="form-group">
                    <label class="form-label">Diet Type</label>
                    <select class="form-control" onchange="updateFood('dietType', this.value)">
                        ${['Vegan', 'Vegetarian', 'Pescatarian', 'Omnivore'].map(d =>
        `<option value="${d}" ${state.food.dietType === d ? 'selected' : ''}>${d}</option>`
    ).join('')}
                    </select>
                </div>
                
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Beef Servings Per Week</label>
                        <input type="number" class="form-control" min="0" max="7" value="${state.food.beefServings}" 
                            onchange="updateFood('beefServings', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Chicken Servings Per Week</label>
                        <input type="number" class="form-control" min="0" max="7" value="${state.food.chickenServings}" 
                            onchange="updateFood('chickenServings', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Fish Servings Per Week</label>
                        <input type="number" class="form-control" min="0" max="7" value="${state.food.fishServings}" 
                            onchange="updateFood('fishServings', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Dairy/Cheese Servings Per Week</label>
                        <input type="number" class="form-control" min="0" max="7" value="${state.food.dairyServings}" 
                            onchange="updateFood('dairyServings', parseFloat(this.value) || 0)">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Local/Seasonal Food Percentage: <span class="slider-value">${state.food.localPercentage}%</span></label>
                    <div class="slider-container">
                        <input type="range" class="slider" min="0" max="100" value="${state.food.localPercentage}" 
                            oninput="updateFood('localPercentage', parseFloat(this.value))">
                    </div>
                </div>
                
                <div class="live-calc">
                    <div>Annual Food Emissions</div>
                    <div class="live-calc-value">${emissions.toFixed(0)} kg CO2e</div>
                </div>
            `;
}

function renderShoppingTab() {
    const emissions = calculations.calculateShopping();
    return `
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Annual Clothing Spend (₹)</label>
                        <input type="number" class="form-control" min="0" value="${state.shopping.clothingSpend}" 
                            onchange="updateShopping('clothingSpend', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Annual Electronics Spend (₹)</label>
                        <input type="number" class="form-control" min="0" value="${state.shopping.electronicsSpend}" 
                            onchange="updateShopping('electronicsSpend', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Annual Household Goods Spend (₹)</label>
                        <input type="number" class="form-control" min="0" value="${state.shopping.householdSpend}" 
                            onchange="updateShopping('householdSpend', parseFloat(this.value) || 0)">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Second-hand Purchase Percentage: <span class="slider-value">${state.shopping.secondhandPercentage}%</span></label>
                    <div class="slider-container">
                        <input type="range" class="slider" min="0" max="100" value="${state.shopping.secondhandPercentage}" 
                            oninput="updateShopping('secondhandPercentage', parseFloat(this.value))">
                    </div>
                </div>
                
                <div class="live-calc">
                    <div>Annual Shopping Emissions</div>
                    <div class="live-calc-value">${emissions.toFixed(0)} kg CO2e</div>
                </div>
            `;
}

function renderWaterTab() {
    const emissions = calculations.calculateWater();
    return `
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Monthly Water (m³)</label>
                        <input type="number" class="form-control" min="0" value="${state.water.waterConsumption}" 
                            onchange="updateWater('waterConsumption', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Landfill Waste (kg/month)</label>
                        <input type="number" class="form-control" min="0" value="${state.water.landfillWaste}" 
                            onchange="updateWater('landfillWaste', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Recycled Waste (kg/month)</label>
                        <input type="number" class="form-control" min="0" value="${state.water.recycledWaste}" 
                            onchange="updateWater('recycledWaste', parseFloat(this.value) || 0)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Composted Waste (kg/month)</label>
                        <input type="number" class="form-control" min="0" value="${state.water.compostWaste}" 
                            onchange="updateWater('compostWaste', parseFloat(this.value) || 0)">
                    </div>
                </div>
                
                <div class="live-calc">
                    <div>Annual Water &amp; Waste Emissions</div>
                    <div class="live-calc-value">${emissions.toFixed(0)} kg CO2e</div>
                </div>
            `;
}

function renderReport() {
    const recommendations = getRecommendations();
    const total = calculations.getTotalEmissions();
    const treesNeeded = (total / 20).toFixed(0);

    return `
                <div class="report-screen">
                    <div class="card">
                        <h2>Your Carbon Footprint Report</h2>
                        <p style="color: var(--color-text-secondary); margin-bottom: 24px;">Review your results and download a detailed PDF report with personalized recommendations.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-bottom: 12px;">Summary</h3>
                            <p>Your total annual carbon footprint is <strong>${total.toFixed(0)} kg CO2e</strong> (${(total / 1000).toFixed(2)} tonnes).</p>
                            <p style="margin-top: 8px;">To offset your emissions, you would need approximately <strong>${treesNeeded} trees</strong> planted and maintained for a year.</p>
                        </div>
                        
                        ${recommendations.length > 0 ? `
                            <h3 style="margin-top: 24px; margin-bottom: 16px;">Top Recommendations</h3>
                            <ul class="recommendations-list">
                                ${recommendations.map(rec => `
                                    <li class="recommendation-item">
                                        <h4>${rec.category}</h4>
                                        <p style="margin: 0; color: var(--color-text-secondary);">${rec.tip}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : ''}
                        
                        <div class="button-group" style="margin-top: 32px;">
                            <button class="btn btn-secondary" onclick="navigateTo('tracker')">Back to Calculator</button>
                            <button class="btn btn-primary" onclick="downloadReport()">Download PDF Report</button>
                            <button class="btn btn-secondary" onclick="restart()">Start Over</button>
                        </div>
                    </div>
                </div>
            `;
}

// State Update Functions
function updateProfile(field, value) {
    state.profile[field] = value;
    render();
}

function updateTransportation(field, value) {
    state.transportation[field] = value;
    render();
}

function updateEnergy(field, value) {
    state.energy[field] = value;
    render();
}

function updateFood(field, value) {
    state.food[field] = value;
    render();
}

function updateShopping(field, value) {
    state.shopping[field] = value;
    render();
}

function updateWater(field, value) {
    state.water[field] = value;
    render();
}

function switchTab(tab) {
    state.currentTab = tab;
    render();
}

function navigateTo(screen) {
    state.currentScreen = screen;
    render();
}

function restart() {
    if (confirm('Are you sure you want to start over? All your data will be cleared.')) {
        state.currentScreen = 'welcome';
        state.profile.name = '';
        render();
    }
}

async function downloadReport() {
    const btn = event.target;
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;

    try {
        await generatePDF();
        btn.textContent = 'Download PDF Report';
        btn.disabled = false;
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
        btn.textContent = 'Download PDF Report';
        btn.disabled = false;
    }
}

function showLanding() {
  document.body.classList.add('landing'); // hides bg
  // render landing...
}

function showOtherPage() {
  document.body.classList.remove('landing'); // shows bg
  // render other page...
}



// Main Render Function
function render() {
    const app = document.getElementById('app');

    let content = '';
    switch (state.currentScreen) {
        case 'welcome':
            content = renderWelcome();
            break;
        case 'profile':
            content = renderProfile();
            break;
        case 'tracker':
            content = renderTracker();
            break;
        case 'report':
            content = renderReport();
            break;
        default:
            content = renderWelcome();
    }

    app.innerHTML = content;

    // Create chart if on tracker screen
    if (state.currentScreen === 'tracker') {
        setTimeout(() => {
            const breakdown = calculations.calculateTotal();
            createChart(breakdown);
        }, 0);
    }
}

// Initialize App
render();