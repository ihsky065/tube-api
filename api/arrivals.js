const fs = require('fs');

// 1. Read and parse your modified data.json
const rawData = fs.readFileSync('data.json', 'utf8');
const stations = JSON.parse(rawData);

// 2. Loop through each tube location
stations.forEach(station => {
    console.log(`Location: ${station.location} (ID: ${station.tube_id})`);
    
    // 3. Loop through the nested details array for this specific station
    station.details.forEach(train => {
        console.log(`  - Line ${train.line_no}: Arriving in ${train.next_arrival_minutes} mins (${train.operator})`);
    });
});
