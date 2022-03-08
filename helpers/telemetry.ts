export async function sendTelemetry(data: {
  event_name: string;
}): Promise<Response> {
  const response = await fetch(
    'https://event-server.fly.dev/api/v1/s2s/event',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': 's2s.rikq0t4hx3z3tai57xhnr.0ewnnsgza7793e9zws8ccpk',
      },
      body: JSON.stringify(data),
    }
  );
  return response;
}
