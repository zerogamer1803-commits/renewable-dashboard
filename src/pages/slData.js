// Mock data — replace with API calls later
export const STREET_LIGHTS = [
  { id: 'SL-001', location: 'Main Road',        status: 'working', state: 'ON',  power: 42, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '10 sec ago' },
  { id: 'SL-002', location: 'Main Road',        status: 'working', state: 'ON',  power: 40, voltage: 229, fault: 'None',             communication: 'Connected',    lastUpdated: '12 sec ago' },
  { id: 'SL-003', location: 'College Road',     status: 'fault',   state: 'OFF', power: 0,  voltage: 0,   fault: 'LED Failure',      communication: 'Connected',    lastUpdated: '15 sec ago' },
  { id: 'SL-004', location: 'Station Road',     status: 'working', state: 'ON',  power: 38, voltage: 231, fault: 'None',             communication: 'Connected',    lastUpdated: '8 sec ago'  },
  { id: 'SL-005', location: 'Market Road',      status: 'working', state: 'OFF', power: 0,  voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '20 sec ago' },
  { id: 'SL-006', location: 'Main Road',        status: 'working', state: 'ON',  power: 41, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '9 sec ago'  },
  { id: 'SL-007', location: 'Highway Road',     status: 'fault',   state: 'OFF', power: 0,  voltage: 0,   fault: 'Power Failure',    communication: 'Connected',    lastUpdated: '2 min ago'  },
  { id: 'SL-008', location: 'Residential Area', status: 'working', state: 'ON',  power: 36, voltage: 228, fault: 'None',             communication: 'Connected',    lastUpdated: '11 sec ago' },
  { id: 'SL-009', location: 'College Road',     status: 'working', state: 'ON',  power: 39, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '14 sec ago' },
  { id: 'SL-010', location: 'Station Road',     status: 'fault',   state: 'OFF', power: 0,  voltage: 0,   fault: 'Power Failure',    communication: 'Connected',    lastUpdated: '5 min ago'  },
  { id: 'SL-011', location: 'Market Road',      status: 'working', state: 'ON',  power: 43, voltage: 231, fault: 'None',             communication: 'Connected',    lastUpdated: '7 sec ago'  },
  { id: 'SL-012', location: 'Residential Area', status: 'working', state: 'OFF', power: 0,  voltage: 229, fault: 'None',             communication: 'Connected',    lastUpdated: '18 sec ago' },
  { id: 'SL-013', location: 'Highway Road',     status: 'working', state: 'ON',  power: 37, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '6 sec ago'  },
  { id: 'SL-014', location: 'Main Road',        status: 'warning', state: 'ON',  power: 28, voltage: 218, fault: 'Voltage Issue',    communication: 'Connected',    lastUpdated: '30 sec ago' },
  { id: 'SL-015', location: 'College Road',     status: 'working', state: 'ON',  power: 41, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '10 sec ago' },
  { id: 'SL-016', location: 'Station Road',     status: 'working', state: 'ON',  power: 39, voltage: 229, fault: 'None',             communication: 'Connected',    lastUpdated: '13 sec ago' },
  { id: 'SL-017', location: 'Market Road',      status: 'fault',   state: 'OFF', power: 0,  voltage: 0,   fault: 'LED Failure',      communication: 'Connected',    lastUpdated: '8 min ago'  },
  { id: 'SL-018', location: 'Residential Area', status: 'warning', state: 'ON',  power: 32, voltage: 221, fault: 'Weak Signal',      communication: 'Weak Signal',  lastUpdated: '45 sec ago' },
  { id: 'SL-019', location: 'Highway Road',     status: 'working', state: 'ON',  power: 44, voltage: 232, fault: 'None',             communication: 'Connected',    lastUpdated: '5 sec ago'  },
  { id: 'SL-020', location: 'Main Road',        status: 'offline', state: 'OFF', power: 0,  voltage: 0,   fault: 'No Response',      communication: 'Disconnected', lastUpdated: '1 hr ago'   },
  { id: 'SL-021', location: 'College Road',     status: 'working', state: 'ON',  power: 40, voltage: 230, fault: 'None',             communication: 'Connected',    lastUpdated: '9 sec ago'  },
  { id: 'SL-022', location: 'Station Road',     status: 'fault',   state: 'OFF', power: 0,  voltage: 0,   fault: 'LED Failure',      communication: 'Connected',    lastUpdated: '12 min ago' },
  { id: 'SL-023', location: 'Market Road',      status: 'working', state: 'ON',  power: 38, voltage: 229, fault: 'None',             communication: 'Connected',    lastUpdated: '11 sec ago' },
  { id: 'SL-024', location: 'Residential Area', status: 'working', state: 'OFF', power: 0,  voltage: 228, fault: 'None',             communication: 'Connected',    lastUpdated: '22 sec ago' },
];

export const ENERGY_CONSUMPTION = [
  { day: 'Mon', kwh: 8.2 },
  { day: 'Tue', kwh: 8.6 },
  { day: 'Wed', kwh: 8.1 },
  { day: 'Thu', kwh: 9.0 },
  { day: 'Fri', kwh: 8.7 },
  { day: 'Sat', kwh: 9.2 },
  { day: 'Sun', kwh: 8.8 },
];

export const FAULT_CATEGORIES = [
  { name: 'LED Failure',             count: 5, color: '#ef4444' },
  { name: 'Power Failure',           count: 3, color: '#f97316' },
  { name: 'Communication Failure',   count: 2, color: '#f59e0b' },
  { name: 'Voltage Issue',           count: 1, color: '#eab308' },
  { name: 'Other',                   count: 1, color: '#94a3b8' },
];

export const LOCATION_DATA = [
  { location: 'Main Road',        total: 25, working: 22, nonWorking: 3, on: 20, off: 5, faults: 3 },
  { location: 'College Road',     total: 20, working: 18, nonWorking: 2, on: 16, off: 4, faults: 2 },
  { location: 'Station Road',     total: 22, working: 19, nonWorking: 3, on: 17, off: 5, faults: 3 },
  { location: 'Market Road',      total: 18, working: 17, nonWorking: 1, on: 15, off: 3, faults: 1 },
  { location: 'Residential Area', total: 20, working: 19, nonWorking: 1, on: 16, off: 4, faults: 1 },
  { location: 'Highway Road',     total: 15, working: 13, nonWorking: 2, on: 12, off: 3, faults: 2 },
];

export const ALERTS = [
  { id: 1, type: 'critical', icon: '🔴', title: 'LED Failure Detected',          desc: 'SL-003 on College Road has reported an LED failure.',              lightId: 'SL-003', location: 'College Road',     time: '5 min ago',  resolved: false },
  { id: 2, type: 'warning',  icon: '🟠', title: 'Lights Not Responding',         desc: '3 street lights on Station Road are not responding.',              lightId: 'SL-010', location: 'Station Road',     time: '12 min ago', resolved: false },
  { id: 3, type: 'warning',  icon: '🟡', title: 'Weak Communication Signal',     desc: 'Communication signal weak for SL-018 on Residential Area.',        lightId: 'SL-018', location: 'Residential Area', time: '20 min ago', resolved: false },
  { id: 4, type: 'critical', icon: '🔴', title: 'Power Failure',                 desc: 'SL-007 on Highway Road has reported a complete power failure.',     lightId: 'SL-007', location: 'Highway Road',     time: '35 min ago', resolved: false },
  { id: 5, type: 'critical', icon: '🔴', title: 'Light Offline',                 desc: 'SL-020 on Main Road is not responding. Last seen 1 hour ago.',     lightId: 'SL-020', location: 'Main Road',        time: '1 hr ago',   resolved: false },
  { id: 6, type: 'resolved', icon: '🟢', title: 'Fault Resolved',                desc: 'SL-011 fault on Market Road has been resolved by maintenance.',    lightId: 'SL-011', location: 'Market Road',      time: '2 hr ago',   resolved: true  },
];
