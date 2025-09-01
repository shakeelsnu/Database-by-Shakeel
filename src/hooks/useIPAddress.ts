import { useState, useEffect } from 'react';

export function useIPAddress() {
  const [ip, setIP] = useState('Fetching...');

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIP(data.ip))
      .catch(() => setIP('Unable to fetch'));
  }, []);

  return ip;
}