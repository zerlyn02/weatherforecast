let weatherData = null;
        let currentView = 'table'; // Track whether the table or chart is displayed
        window.expenseChart = null;

        function fetchWeather() {
            const location = document.getElementById('get-location').value;
            document.getElementById('location-name').innerHTML = '';
            document.getElementById('forecast-table').innerHTML = '';
            document.getElementById('day-buttons').innerHTML = '';

            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=54be5f3702a2ae0f5877507070d27798`;

            fetch(url)
                .then(response => 
                    {
                        if (!response.ok) {
                            throw new Error('City not found');
                        }
                        return response.json();
                    }
                )
                .then(data => {
                    weatherData = data;
                    const locationName = data.city.name;
                    document.getElementById('location-name').innerHTML = locationName; 
                    createDayButtons(data);
                    displayTable(); 
                })
                .catch(error => {
                    document.getElementById('location-name').innerHTML = 'No city found';
                    document.getElementById('error-message').innerHTML = error.message;
                    document.getElementById('forecast-table').style.display('none');
                    document.getElementById('forecast-chart').style.display('none');
                    document.getElementById('day-buttons').style.display('none');
        })
        }

        function createDayButtons(data) {
            const buttonsContainer = document.getElementById('day-buttons');
            buttonsContainer.innerHTML = '';

            const uniqueDates = [...new Set(data.list.map(item => item.dt_txt.split(' ')[0]))];

            uniqueDates.forEach(date => {
                const dayData = data.list.find(item => item.dt_txt.startsWith(date));
                const iconUrl = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`;

                const button = document.createElement('button');
                button.className = 'btn btn-outline-primary mx-1 mb-2';
                button.innerHTML = `<img src="${iconUrl}" alt="${dayData.weather[0].description}">${date}`;
                button.onclick = () => {
                    if (currentView === 'table') {
                        displaySingleDayTable(date);
                    } else {
                        displaySingleDayChart(date);
                    }
                };

                buttonsContainer.appendChild(button);
            });
        }

        function displayTable() {
            currentView = 'table';
            document.getElementById('forecast-chart').style.display = 'none';
            document.getElementById('forecast-table').style.display = 'block';
            forecast(weatherData);
        }

        function displaySingleDayTable(date) {
            const filteredData = {
                ...weatherData,
                list: weatherData.list.filter(item => item.dt_txt.startsWith(date))
            };
            forecast(filteredData);
        }

        function displayLineChart() {
            currentView = 'chart';
            document.getElementById('forecast-table').style.display = 'none';
            document.getElementById('forecast-chart').style.display = 'block';
            linechart(weatherData);
        }

        function displaySingleDayChart(date) {
            const filteredData = {
                ...weatherData,
                list: weatherData.list.filter(item => item.dt_txt.startsWith(date))
            };
            linechart(filteredData);
        }

        function forecast(data) {
            let table = '<table><thead><tr><th>Date Time</th><th>Temperature</th><th>Description</th></thead><tbody>';
            for (let i = 0; i < data.list.length; i++) {
                const currentDate = new Date(data.list[i].dt_txt).getDate();
                const previousDate = i > 0 ? new Date(data.list[i - 1].dt_txt).getDate() : currentDate;
                const rowClass = currentDate !== previousDate ? 'table-primary' : '';
                table += `<tr class="${rowClass}">
                            <td>${data.list[i].dt_txt}</td>
                            <td>${(data.list[i].main.temp - 273.15).toFixed(2)}°C</td>
                            <td>${data.list[i].weather[0].description}</td>
                          </tr>`;
            }
            table += '</tbody></table>';
            document.getElementById('forecast-table').innerHTML = table;
        }

        function linechart(data) {
            const ctx = document.getElementById('forecast-chart').getContext('2d');
            const labels = data.list.map(item => item.dt_txt);
            const temperatures = data.list.map(item => (item.main.temp - 273.15).toFixed(2));

            if (window.expenseChart) {
                window.expenseChart.destroy();
            }

            window.expenseChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatures,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Date Time'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        }
                    }
                }
            });
        }