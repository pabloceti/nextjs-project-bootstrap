export interface Device {
  MAC: string;
  IP: string;
  Estado: number;
  Latencia: string;
  ProveedorDeMac: string;
  NombreEquipo: string;
  SO: string;
}

export interface ScanResult {
  devices: Device[];
  scanTime: Date;
  totalDevices: number;
}

export interface DatabaseStatus {
  connected: boolean;
  message: string;
  lastCheck: Date;
}
