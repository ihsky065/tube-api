import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Read your uploaded Mockaroo file from the server repository
    const filePath = path.join(process.cwd(), 'api', 'data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileData);

    // 2. Fetch the current clock seconds right now (0 to 59)
    const currentSeconds = new Date().getSeconds();

    // 3. Loop through your Mockaroo items and overwrite their static numbers with a real-time countdown
    const realTimeData = baseData.map((train, index) => {
      // This formula ensures a steady descending countdown loop (e.g., 5, 4, 3, 2, 1) based on the clock
      // The offset (index * 15) keeps different trains from showing the exact same arrival minute
      const dynamicCountdown = Math.max(1, Math.floor((120 - ((currentSeconds + (index * 15)) % 60)) / 10));
      
      return {
        ...train,
        next_arrival_minutes: dynamicCountdown
      };
    });

    // 4. Set network system headers so browsers read it as a raw, global API object
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 5. Output the live, altered JSON object array directly to the web screen
    return res.status(200).json(realTimeData);

  } catch (error) {
    console.error("System Core Error:", error);
    return res.status(500).json({ error: "Failed to output live JSON object stream." });
  }
}
