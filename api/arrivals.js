import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Read your newly modified data.json file
    const filePath = path.join(process.cwd(), 'api', 'data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileData);

    // 2. Fetch the current clock seconds right now
    const currentSeconds = new Date().getSeconds();

    // 3. Loop through the outer array elements
    const realTimeData = baseData.map((station) => {
      // Check if this item has the nested 'details' array
      if (station.details && Array.isArray(station.details)) {
        // Map over the inner array to dynamically overwrite the minutes inside it
        const updatedDetails = station.details.map((train, index) => {
          const dynamicCountdown = Math.max(1, Math.floor((120 - ((currentSeconds + (index * 15)) % 60)) / 10));
          return {
            ...train,
            next_arrival_minutes: dynamicCountdown // Overwrites the inner static number
          };
        });

        // Return the object with the cleanly updated inner array
        return {
          ...station,
          details: updatedDetails
        };
      }
      
      return station;
    });

    // 4. Set network system headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 5. Output the clean, dynamic JSON nested object structure
    return res.status(200).json(realTimeData);

  } catch (error) {
    console.error("System Core Error:", error);
    return res.status(500).json({ error: "Failed to output live JSON object stream." });
  }
}
