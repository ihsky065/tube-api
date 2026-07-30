const fs = require('fs');
const path = require('path');

try {
    // Use path.join to avoid relative directory issues in server environments
    const filePath = path.join(__dirname, 'data.json'); 
    const rawData = fs.readFileSync(filePath, 'utf8');
    const stations = JSON.parse(rawData);

    stations.forEach(station => {
        console.log(`Location: ${station.location} (ID: ${station.tube_id})`);
        
        // Check if details exists and is an array before looping
        if (station.details && Array.isArray(station.details)) {
            station.details.forEach(train => {
                console.log(`  - Line ${train.line_no}: Arriving in ${train.next_arrival_minutes} mins (${train.operator})`);
            });
        } else {
            console.warn(`Warning: Missing or invalid 'details' array for station ID ${station.tube_id}`);
        }
    });

} catch (error) {
    // This stops the 500 crash and logs the actual problem in your terminal
    console.error("Failed to load or parse transit data:", error.message);
}
