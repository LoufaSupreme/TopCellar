// get summary of existing entries' dollar value stats:
const entryValueKPI = async () => {
    console.log("Calculating value KPI's");

    try {
        const res = await fetch(`kpi/entry_value/`);
        const kpiObject = await res.json();
        return kpiObject;
    }
    catch (err) {
        console.error(err);
    }
}

const clearCanvas = () => {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const destroyChart = (chart) => {
    chart.destroy();
}

// make chart.js bar chart:
const barChart = (dataArray, labelArray) => {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelArray,
            datasets: [{
                label: '# of Votes',
                data: dataArray,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return myChart;
}