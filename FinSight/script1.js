const body = document.querySelector("body");
const sidebar = document.querySelector(".sidebar");
const toggle = document.querySelector(".toggle");
const modeSwitch = document.querySelector(".toggle-switch");
const modeText = document.querySelector(".mode-text");

// Sidebar toggle
toggle.addEventListener("click", () => sidebar.classList.toggle("close"));

// Dark mode
modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");
    modeText.innerText = body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
    // Update charts if needed (Chart.js doesn't auto-update colors on CSS class change)
    updateChartColors();
});

// SPA navigation
const navLinks = document.querySelectorAll("[data-page]");
let currentPage = document.getElementById("page-dashboard");

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const pageId = link.dataset.page;
        const targetPage = document.getElementById("page-" + pageId);
        if (!targetPage || targetPage === currentPage) return;

        navLinks.forEach(l => l.classList.remove("active"));
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(l => l.classList.add("active"));

        currentPage.classList.remove("active", "visible");
        targetPage.classList.add("active");
        currentPage = targetPage;
        requestAnimationFrame(() => requestAnimationFrame(() => targetPage.classList.add("visible")));

        document.querySelector(".main-content").scrollTop = 0;
    });
});

// Data Loading and Charting
let financialData = [];
let charts = {};

function initCharts() {
    // Overview Charts
    charts.revenueQuarter = new Chart(document.getElementById('revenueQuarterChart').getContext('2d'), {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: { responsive: true,maintainAspectRatio: false }
    });
    charts.creditRiskDist = new Chart(document.getElementById('creditRiskDistChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    charts.stockTrendDist = new Chart(document.getElementById('stockTrendDistChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    charts.profitTrend = new Chart(document.getElementById('profitTrendChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });

    // Financial Performance Charts
    charts.revProfit = new Chart(document.getElementById('revProfitChart').getContext('2d'), {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    charts.epsTrend = new Chart(document.getElementById('epsTrendChart').getContext('2d'), {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: { responsive: true }
    });
    // Risk Analysis Charts
    charts.creditDist = new Chart(document.getElementById('creditScoreDistChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    charts.debtRisk = new Chart(document.getElementById('debtRiskChart').getContext('2d'), {
        type: 'scatter',
        data: { datasets: [] },
        options: { responsive: true, scales: { x: { title: { display: true, text: 'Debt-to-Equity' } }, y: { title: { display: true, text: 'Credit Score' } } } }
    });

    // Stock Insights Charts
    charts.volatility = new Chart(document.getElementById('volatilityTrendChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    charts.marketCap = new Chart(document.getElementById('marketCapChart').getContext('2d'), {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: { responsive: true, indexAxis: 'y' }
    });

    // Simulation Chart
    charts.sim = new Chart(document.getElementById('simChart').getContext('2d'), {
    type: 'radar',
    data: {
        labels: ['Debt Level', 'Profitability', 'Volatility', 'Credit Score', 'Market Cap'],
        datasets: [
            {
                label: 'Current',
                data: [0, 0, 0, 0, 0],
                borderColor: '#7A1E10',
                backgroundColor: 'rgba(122, 30, 16, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#7A1E10',
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Simulated',
                data: [0, 0, 0, 0, 0],
                borderColor: '#378ADD',
                backgroundColor: 'rgba(55, 138, 221, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#378ADD',
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 20, bottom: 10, left: 30, right: 30 }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 24,
                    usePointStyle: true,
                    pointStyleWidth: 32,
                    font: { family: 'Poppins', size: 13 },
                    color: '#555'
                }
            }
        },
        scales: {
            r: {
                min: 0,
                max: 100,
                beginAtZero: true,
                ticks: {
                    stepSize : 10,
                    font: { family: 'Poppins', size: 11 },
                    color: '#888',
                    backdropColor: 'transparent'
                },
                pointLabels: {
                    font: { family: 'Poppins', size: 13, weight: '500' },
                    color: '#444',
                    padding: 16
                },
                grid: { color: 'rgba(0,0,0,0.08)' },
                angleLines: { color: 'rgba(0,0,0,0.08)' }
            }
        }
    }
});
}

function updateChartColors() {
    const isDark = body.classList.contains("dark");
    const textColor = isDark ? '#fff' : '#666';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    Object.values(charts).forEach(chart => {
        if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
                if (scale.ticks) scale.ticks.color = textColor;
                if (scale.grid) scale.grid.color = gridColor;
            });
        }
        if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        chart.update();
    });
}

function processData(data) {
    financialData = data;
    
    // Overview Stats
    const uniqueCompanies = [...new Set(data.map(d => d.Company_ID))];
    const avgRevenue = data.reduce((acc, d) => acc + parseFloat(d.Revenue), 0) / data.length;
    const avgCredit = data.reduce((acc, d) => acc + parseFloat(d.Credit_Score), 0) / data.length;

    document.getElementById('dash-total-companies').innerText = uniqueCompanies.length;
    document.getElementById('dash-avg-revenue').innerText = '$' + avgRevenue.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('dash-avg-credit').innerText = avgCredit.toFixed(0);

    // Overview Charts Processing
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    // 1. Revenue by Quarter (Bar)
    const revByQuarter = quarters.map(q => {
        const qData = data.filter(d => d.Quarter === q);
        return qData.reduce((acc, d) => acc + parseFloat(d.Revenue), 0) / (qData.length || 1);
    });
    charts.revenueQuarter.data.labels = quarters;
    charts.revenueQuarter.data.datasets = [{
        label: 'Avg Revenue',
        data: revByQuarter,
        backgroundColor: '#7A1E10'
    }];
    charts.revenueQuarter.update();

    // 2. Credit Risk Distribution (Doughnut)
    const creditRiskLabels = ['Low', 'Medium', 'High'];
    const creditRiskData = creditRiskLabels.map(label => data.filter(d => d.Credit_Risk_Score === label).length);
    charts.creditRiskDist.data.labels = creditRiskLabels;
    charts.creditRiskDist.data.datasets = [{
        data: creditRiskData,
        backgroundColor: ['#2E9E60', '#E67E22', '#C0392B']
    }];
    charts.creditRiskDist.update();

    // 3. Stock Trend Distribution (Doughnut)
    const stockTrendLabels = ['Up', 'Stable', 'Down'];
    const stockTrendData = stockTrendLabels.map(label => data.filter(d => d.Stock_Trend === label).length);
    charts.stockTrendDist.data.labels = stockTrendLabels;
    charts.stockTrendDist.data.datasets = [{
        data: stockTrendData,
        backgroundColor: ['#378ADD', '#D4A012', '#7A1E10']
    }];
    charts.stockTrendDist.update();

    // 4. Quarterly Profit Trend (Line)
    const profitByQuarter = quarters.map(q => {
        const qData = data.filter(d => d.Quarter === q);
        return qData.reduce((acc, d) => acc + parseFloat(d.Net_Profit), 0) / (qData.length || 1);
    });
    charts.profitTrend.data.labels = quarters;
    charts.profitTrend.data.datasets = [{
    label: 'Avg Net Profit',
    data: profitByQuarter,
    borderColor: '#378ADD',
    backgroundColor: 'rgba(55, 138, 221, 0.15)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#378ADD',
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2.5
}];
    charts.profitTrend.update();

    // Financial Performance
    const avgNetProfit = data.reduce((acc, d) => acc + parseFloat(d.Net_Profit), 0) / data.length;
    const avgDebtEquity = data.reduce((acc, d) => acc + parseFloat(d.Debt_to_Equity), 0) / data.length;
    const avgCurrentRatio = data.reduce((acc, d) => acc + parseFloat(d.Current_Ratio), 0) / data.length;
    const avgEPSVal = data.reduce((acc, d) => acc + parseFloat(d.EPS), 0) / data.length;

    document.getElementById('fin-avg-profit').innerText = '$' + avgNetProfit.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('fin-avg-debt-equity').innerText = avgDebtEquity.toFixed(2);
    document.getElementById('fin-avg-current-ratio').innerText = avgCurrentRatio.toFixed(2);
    document.getElementById('fin-avg-eps').innerText = '$' + avgEPSVal.toFixed(2);

    const top10 = data.slice(0, 10);
    charts.revProfit.data.labels = top10.map(d => d.Company_ID);
    charts.revProfit.data.datasets = [
        { label: 'Revenue', data: top10.map(d => d.Revenue), backgroundColor: '#7A1E10' },
        { label: 'Net Profit', data: top10.map(d => d.Net_Profit), backgroundColor: '#378ADD' }
    ];
    charts.revProfit.update();

    charts.epsTrend.data.labels = quarters;
    const avgEPSByQ = quarters.map(q => {
        const qData = data.filter(d => d.Quarter === q);
        return qData.reduce((acc, d) => acc + parseFloat(d.EPS), 0) / (qData.length || 1);
    });
    charts.epsTrend.data.datasets = [{
    label: 'Average EPS',
    data: avgEPSByQ,
    borderColor: '#E67E22',
    backgroundColor: 'rgba(230, 126, 34, 0.15)',
    tension: 0.3,
    fill: true,
    pointBackgroundColor: '#E67E22',
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2.5
}];
    charts.epsTrend.update();

    // Risk Analysis
    const avgCreditScore = data.reduce((acc, d) => acc + parseFloat(d.Credit_Score), 0) / data.length;
    const highRiskCount = data.filter(d => d.Credit_Risk_Score === 'High').length;

    document.getElementById('risk-avg-credit').innerText = avgCreditScore.toFixed(0);
    document.getElementById('risk-high-count').innerText = highRiskCount;

    const scores = data.map(d => d.Credit_Score);
    const dist = { 'Low (0-400)': 0, 'Medium (401-700)': 0, 'High (701-1000)': 0 };
    scores.forEach(s => {
        if (s <= 400) dist['Low (0-400)']++;
        else if (s <= 700) dist['Medium (401-700)']++;
        else dist['High (701-1000)']++;
    });
    charts.creditDist.data.labels = Object.keys(dist);
    charts.creditDist.data.datasets = [{
        data: Object.values(dist),
        backgroundColor: ['#C0392B', '#E67E22', '#2E9E60']
    }];
    charts.creditDist.update();

    charts.debtRisk.data.datasets = [{
        label: 'Companies',
        data: data.slice(0, 100).map(d => ({ x: d.Debt_to_Equity, y: d.Credit_Score })),
        backgroundColor: 'rgba(122, 30, 16, 0.5)'
    }];
    charts.debtRisk.update();

    // Stock Insights
    const avgVolatility = data.reduce((acc, d) => acc + parseFloat(d.Stock_Volatility), 0) / data.length;
    const uptrendCount = data.filter(d => d.Stock_Trend === 'Up').length;

    document.getElementById('stock-avg-volatility').innerText = avgVolatility.toFixed(2) + '%';
    document.getElementById('stock-uptrend-count').innerText = uptrendCount;

    charts.volatility.data.labels = quarters;
    const avgVolByQ = quarters.map(q => {
        const qData = data.filter(d => d.Quarter === q);
        return qData.reduce((acc, d) => acc + parseFloat(d.Stock_Volatility), 0) / (qData.length || 1);
    });
    charts.volatility.data.datasets = [{
    label: 'Average Volatility',
    data: avgVolByQ,
    borderColor: '#7A1E10',
    backgroundColor: 'rgba(122, 30, 16, 0.15)',
    borderDash: [5, 5],
    fill: true,
    pointBackgroundColor: '#7A1E10',
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2.5
    }];
    charts.volatility.update();

    const topMarketCap = [...data].sort((a, b) => parseFloat(b.Market_Cap) - parseFloat(a.Market_Cap)).slice(0, 10);
    charts.marketCap.data.labels = topMarketCap.map(d => d.Company_ID);
    charts.marketCap.data.datasets = [{
        label: 'Market Cap',
        data: topMarketCap.map(d => parseFloat(d.Market_Cap)),
        backgroundColor: '#D4A012'
    }];
    charts.marketCap.update();

    // Initial Sim Chart
    updateSimChart();
}

// Simulation Logic
const simDebt = document.getElementById('sim-debt');
const simProfit = document.getElementById('sim-profit');
const simVol = document.getElementById('sim-vol');
const runBtn = document.getElementById('run-simulation');

[simDebt, simProfit, simVol].forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById(input.id + '-val').innerText = input.value + '%';
    });
});

function updateSimChart() {
    if (financialData.length === 0) return;
    const base = financialData[0]; // Use first record as baseline
    
    const dVal = parseFloat(simDebt.value);
    const pVal = parseFloat(simProfit.value);
    const vVal = parseFloat(simVol.value);

    // Current normalized values (0-100 scale for radar)
    const current = [50, 50, 50, 50, 50];
    
    // Simulated changes
    const sim = [
        50 + (dVal),
        50 + (pVal),
        50 + (vVal),
        50 - (dVal * 0.5) + (pVal * 0.3), // Credit score logic
        50 + (pVal * 0.4) - (vVal * 0.2)  // Market cap logic
    ];

    charts.sim.data.datasets[0].data = current;
    charts.sim.data.datasets[1].data = sim;
    charts.sim.update();

    // Predict risk and trend
    const riskScore = sim[3];
    document.getElementById('sim-res-risk').innerText = riskScore > 60 ? 'Low' : (riskScore > 40 ? 'Medium' : 'High');
    document.getElementById('sim-res-risk').style.color = riskScore > 60 ? '#2E9E60' : (riskScore > 40 ? '#E67E22' : '#C0392B');
    
    const trendScore = sim[4];
    document.getElementById('sim-res-trend').innerText = trendScore > 55 ? 'Bullish' : (trendScore > 45 ? 'Stable' : 'Bearish');
}

runBtn.addEventListener('click', updateSimChart);

// Initialize
// Initialize
initCharts();

// Make the default active page visible on first load
requestAnimationFrame(() => requestAnimationFrame(() => {
    document.getElementById('page-dashboard').classList.add('visible');
}));
Papa.parse("Financial_Dataset.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        processData(results.data.filter(d => d.Company_ID)); // Filter empty rows
    }
});
