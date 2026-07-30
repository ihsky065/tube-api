export default function handler(req, res) {
  // Calculate a dynamic countdown based on the actual server clock second
  const currentSeconds = new Date().getSeconds();
  const centralMinutes = Math.max(1, Math.floor((60 - currentSeconds) / 6));
  const victoriaMinutes = Math.max(1, Math.floor((60 - currentSeconds) / 4));

  // Your dynamic JSON payload
  const mockData = [
    {
      "tube_no": "1",
      "operator": "Transport for London (TfL)",
      "current_server_time": new Date().toLocaleTimeString('en-GB'),
      "next_arrival_minutes": centralMinutes
    },
    {
      "tube_no": "1",
      "operator": "Transport for London (TfL)",
      "current_server_time": new Date().toLocaleTimeString('en-GB'),
      "next_arrival_minutes": victoriaMinutes
    }
  ];

  // Set headers to allow anyone to read this API (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Return the JSON response with a 200 OK status code
  return res.status(200).json(mockData);
}
