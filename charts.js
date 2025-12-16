
// let tempChartInstance;
// let humidityChartInstance;
// let rainChartInstance;

// function renderCharts(labels, temps, humidity, rain) {
  
//   // 🔹 Temperature Trend (LINE)
//   if (tempChartInstance) tempChartInstance.destroy();
//   tempChartInstance = new Chart(document.getElementById('tempChart'), {
//     type: 'line',
//     data: {
//       labels,
//       datasets: [
//         {
//           label: 'Temperature Trend (°C)',
//           data: temps,
//           fill: false,
//           tension: 0.4,
//         },
//       ],
//     },
//   });

//   // 🔹 Humidity Distribution (BAR)
//   if (humidityChartInstance) humidityChartInstance.destroy();
//   humidityChartInstance = new Chart(document.getElementById('humidityChart'), {
//     type: 'bar',
//     data: {
//       labels,
//       datasets: [
//         {
//           label: 'Humidity (%)',
//           data: humidity,
//         },
//       ],
//     },
//   });

//   // 🔹 Rainfall Probability (BAR)
//   if (rainChartInstance) rainChartInstance.destroy();
//   rainChartInstance = new Chart(document.getElementById('rainChart'), {
//     type: 'bar',
//     data: {
//       labels,
//       datasets: [
//         {
//           label: 'Chance of Rain (%)',
//           data: rain,
//         },
//       ],
//     },
//   });
// }





let tempChart, humidityChart, rainChart;

function renderCharts(labels, temps, humidity, rain) {
  const textColor = '#eef2ff'; // indigo-50

  if (tempChart) tempChart.destroy();
  if (humidityChart) humidityChart.destroy();
  if (rainChart) rainChart.destroy();

  // 🌡 Temperature Trend (Line Chart)
  tempChart = new Chart(document.getElementById('tempChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature Trend',
          data: temps,
          borderColor: '#3b82f6', // blue-500
          backgroundColor: 'rgba(59,130,246,0.25)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4f46e5', // indigo-600
        },
      ],
    },
    options: chartOptions(textColor),
  });

  // 💧 Humidity Comparison (Bar Chart)
  humidityChart = new Chart(document.getElementById('humidityChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Humidity (%)',
          data: humidity,
          backgroundColor: '#4f46e5', // indigo-600
        },
      ],
    },
    options: chartOptions(textColor),
  });

  // 🌧 Rainfall / Wind Speed (Bar Chart)
  rainChart = new Chart(document.getElementById('rainChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Rain / Wind',
          data: rain,
          backgroundColor: '#7c3aed', // purple-600
        },
      ],
    },
    options: chartOptions(textColor),
  });
}

// 🔹 Shared chart styling
function chartOptions(textColor) {
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: textColor },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };
}
