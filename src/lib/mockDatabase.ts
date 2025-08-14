import { Device, DatabaseStatus } from './types';

// Simulación de base de datos en memoria para demostración
let mockDevices: Device[] = [
  {
    MAC: '00:1B:44:11:3A:B7',
    IP: '128.100.0.1',
    Estado: 1,
    Latencia: '2ms',
    ProveedorDeMac: 'Cisco',
    NombreEquipo: 'Router-Principal',
    SO: 'Linux'
  },
  {
    MAC: 'DC:A6:32:12:34:56',
    IP: '128.100.0.100',
    Estado: 1,
    Latencia: '15ms',
    ProveedorDeMac: 'Raspberry Pi',
    NombreEquipo: 'RaspberryPi-IoT',
    SO: 'Linux'
  },
  {
    MAC: '00:26:BB:78:90:AB',
    IP: '128.100.0.105',
    Estado: 1,
    Latencia: '8ms',
    ProveedorDeMac: 'Apple',
    NombreEquipo: 'MacBook-Pro',
    SO: 'macOS'
  }
];

export async function mockTestConnection(): Promise<DatabaseStatus> {
  // Simular un pequeño delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    connected: true,
    message: 'Conexión simulada exitosa (Modo Demo)',
    lastCheck: new Date()
  };
}

export async function mockInitializeDatabase(): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'Base de datos simulada inicializada correctamente (Modo Demo)'
  };
}

export async function mockSaveDevice(device: Device): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Buscar si el dispositivo ya existe
  const existingIndex = mockDevices.findIndex(d => d.MAC === device.MAC || d.IP === device.IP);
  
  if (existingIndex >= 0) {
    // Actualizar dispositivo existente
    mockDevices[existingIndex] = device;
  } else {
    // Agregar nuevo dispositivo
    mockDevices.push(device);
  }
  
  return {
    success: true,
    message: 'Dispositivo guardado correctamente (Modo Demo)'
  };
}

export async function mockGetAllDevices(): Promise<Device[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...mockDevices];
}

export function addMockDevice(device: Device): void {
  mockDevices.push(device);
}

export function clearMockDevices(): void {
  mockDevices = [];
}
