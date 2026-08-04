 import React, { createContext, useState, useEffect, useContext } from 'react';

const TimeContext = createContext();
export const useServerTime = () => useContext(TimeContext);

const API_URL = process.env.REACT_APP_API_URL || '';

export const TimeProvider = ({ children }) => {
  const [offset, setOffset] = useState(0);
  const [serverTime, setServerTime] = useState(null);

  const fetchTime = async () => {
    try {
      const res = await fetch(`${API_URL}/api/time`);
      const data = await res.json();
      const serverDate = new Date(data.serverTime);
      const localDate = new Date();
      setOffset(serverDate.getTime() - localDate.getTime());
      setServerTime(serverDate);
    } catch (err) {
      console.error('Time fetch failed, using local time');
      setServerTime(new Date());
    }
  };

  useEffect(() => {
    fetchTime();
    const interval = setInterval(fetchTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getServerTime = () => {
    if (serverTime) return new Date(Date.now() + offset);
    return new Date();
  };

  return (
    <TimeContext.Provider value={{ serverTime: getServerTime(), fetchTime }}>
      {children}
    </TimeContext.Provider>
  );
};