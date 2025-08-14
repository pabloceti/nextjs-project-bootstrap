import { Device } from './types';

// Simulación de escaneo de red para demostración
export async function mockScanNetwork(): Promise<Device[]> {
  console.log('Iniciando escaneo simulado de red...');
  
  // Simular tiempo de escaneo
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Dispositivos simulados que se "encontrarían" en la red
  const simulatedDevices: Device[] = [
    {
      MAC: '00:1B:44:11:3A:B7',
      IP: '128.100.0.1',
      Estado: 1,
      Latencia: '2ms',
      ProveedorDeMac: 'Cisco',
      NombreEquipo: 'Router-Gateway',
      SO: 'Linux'
    },
    {
      MAC: 'DC:A6:32:12:34:56',
      IP: '128.100.0.100',
      Estado: 1,
      Latencia: '15ms',
      ProveedorDeMac: 'Raspberry Pi',
      NombreEquipo: 'RaspberryPi-Server',
      SO: 'Linux'
    },
    {
      MAC: '00:26:BB:78:90:AB',
      IP: '128.100.0.105',
      Estado: 1,
      Latencia: '8ms',
      ProveedorDeMac: 'Apple',
      NombreEquipo: 'MacBook-Pro-Office',
      SO: 'macOS'
    },
    {
      MAC: '00:50:56:C0:00:08',
      IP: '128.100.0.110',
      Estado: 1,
      Latencia: '12ms',
      ProveedorDeMac: 'VMware',
      NombreEquipo: 'VM-Windows-10',
      SO: 'Windows'
    },
    {
      MAC: '3C:07:54:AA:BB:CC',
      IP: '128.100.0.120',
      Estado: 1,
      Latencia: '25ms',
      ProveedorDeMac: 'Apple',
      NombreEquipo: 'iPhone-Personal',
      SO: 'iOS'
    },
    {
      MAC: '00:1E:58:DD:EE:FF',
      IP: '128.100.0.130',
      Estado: 0,
      Latencia: 'N/A',
      ProveedorDeMac: 'WD',
      NombreEquipo: 'NAS-Storage',
      SO: 'Linux'
    },
    {
      MAC: '08:00:27:11:22:33',
      IP: '128.100.0.140',
      Estado: 1,
      Latencia: '18ms',
      ProveedorDeMac: 'VirtualBox',
      NombreEquipo: 'Ubuntu-VM',
      SO: 'Linux'
    },
    {
      MAC: '00:22:72:44:55:66',
      IP: '128.100.0.150',
      Estado: 1,
      Latencia: '35ms',
      ProveedorDeMac: 'American Micro-Fuel Device',
      NombreEquipo: 'IoT-Sensor-01',
      SO: 'Desconocido'
    }
  ];
  
  // Simular variabilidad en los resultados
  const randomDevices = simulatedDevices.filter(() => Math.random() > 0.2);
  
  // Agregar algunos dispositivos con latencia variable
  randomDevices.forEach(device => {
    if (device.Estado === 1) {
      const baseLatency = parseInt(device.Latencia);
      const variation = Math.floor(Math.random() * 10) - 5;
      device.Latencia = `${Math.max(1, baseLatency + variation)}ms`;
    }
  });
  
  console.log(`Escaneo simulado completado. Encontrados ${randomDevices.length} dispositivos`);
  return randomDevices;
}

// Función para generar dispositivos aleatorios adicionales
export function generateRandomDevice(): Device {
  const vendors = ['Apple', 'Samsung', 'Cisco', 'VMware', 'Raspberry Pi', 'Intel', 'Realtek'];
  const oses = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Desconocido'];
  const deviceNames = ['Laptop', 'Desktop', 'Phone', 'Tablet', 'Router', 'Switch', 'IoT-Device', 'Server'];
  
  const randomIP = `128.100.0.${Math.floor(Math.random() * 200) + 50}`;
  const randomMAC = Array.from({length: 6}, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  ).join(':');
  
  return {
    MAC: randomMAC,
    IP: randomIP,
    Estado: Math.random() > 0.1 ? 1 : 0,
    Latencia: Math.random() > 0.1 ? `${Math.floor(Math.random() * 50) + 1}ms` : 'N/A',
    ProveedorDeMac: vendors[Math.floor(Math.random() * vendors.length)],
    NombreEquipo: `${deviceNames[Math.floor(Math.random() * deviceNames.length)]}-${Math.floor(Math.random() * 100)}`,
    SO: oses[Math.floor(Math.random() * oses.length)]
  };
}
