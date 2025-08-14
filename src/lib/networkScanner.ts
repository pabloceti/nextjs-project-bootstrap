import { exec } from 'child_process';
import { promisify } from 'util';
import { Device } from './types';

const execAsync = promisify(exec);

// Función para obtener el rango de red local
export function getLocalNetworkRange(): string {
  return process.env.NETWORK_RANGE || '128.100.0.0/24';
}

// Función para hacer ping a una IP
export async function pingHost(ip: string): Promise<{ alive: boolean; latency: string }> {
  try {
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows 
      ? `ping -n 1 -w 1000 ${ip}`
      : `ping -c 1 -W 1 ${ip}`;
    
    const { stdout } = await execAsync(pingCommand);
    
    if (stdout.includes('TTL=') || stdout.includes('ttl=')) {
      // Extraer latencia del resultado del ping
      const latencyMatch = stdout.match(/time[<=](\d+\.?\d*)ms/i) || 
                          stdout.match(/tiempo[<=](\d+\.?\d*)ms/i);
      const latency = latencyMatch ? `${latencyMatch[1]}ms` : 'N/A';
      
      return { alive: true, latency };
    }
    
    return { alive: false, latency: 'N/A' };
  } catch (error) {
    return { alive: false, latency: 'N/A' };
  }
}

// Función para obtener la tabla ARP
export async function getArpTable(): Promise<Array<{ ip: string; mac: string }>> {
  try {
    const isWindows = process.platform === 'win32';
    const arpCommand = isWindows ? 'arp -a' : 'arp -a';
    
    const { stdout } = await execAsync(arpCommand);
    const arpEntries: Array<{ ip: string; mac: string }> = [];
    
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      if (isWindows) {
        // Formato Windows: IP Address       Physical Address      Type
        const match = line.match(/^\s*(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]{17})\s+/);
        if (match) {
          arpEntries.push({
            ip: match[1],
            mac: match[2].toUpperCase().replace(/-/g, ':')
          });
        }
      } else {
        // Formato Linux/Mac: IP address       HWtype  HWaddress           Flags Mask            Iface
        const match = line.match(/(\d+\.\d+\.\d+\.\d+).*?([0-9a-fA-F:]{17})/);
        if (match) {
          arpEntries.push({
            ip: match[1],
            mac: match[2].toUpperCase()
          });
        }
      }
    }
    
    return arpEntries;
  } catch (error) {
    console.error('Error obteniendo tabla ARP:', error);
    return [];
  }
}

// Función para obtener información del hostname
export async function getHostname(ip: string): Promise<string> {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `nslookup ${ip}`
      : `nslookup ${ip}`;
    
    const { stdout } = await execAsync(command);
    
    // Buscar el nombre en la respuesta
    const nameMatch = stdout.match(/Name:\s*(.+)/i) || 
                     stdout.match(/Nombre:\s*(.+)/i);
    
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    
    return 'Desconocido';
  } catch (error) {
    return 'Desconocido';
  }
}

// Función para detectar el SO básico (muy limitada sin nmap)
export async function detectOS(ip: string): Promise<string> {
  try {
    // Intentar detectar Windows vs Unix/Linux basado en TTL
    const isWindows = process.platform === 'win32';
    const pingCommand = isWindows 
      ? `ping -n 1 -w 1000 ${ip}`
      : `ping -c 1 -W 1 ${ip}`;
    
    const { stdout } = await execAsync(pingCommand);
    
    // TTL típicos: Windows ~128, Linux ~64, Mac ~64
    const ttlMatch = stdout.match(/TTL=(\d+)/i) || stdout.match(/ttl=(\d+)/i);
    
    if (ttlMatch) {
      const ttl = parseInt(ttlMatch[1]);
      if (ttl > 100) {
        return 'Windows';
      } else if (ttl > 50) {
        return 'Linux/Unix';
      }
    }
    
    return 'Desconocido';
  } catch (error) {
    return 'Desconocido';
  }
}

// Función para obtener el proveedor MAC (simplificada)
export async function getMacVendor(mac: string): Promise<string> {
  try {
    // Usar una base de datos local simplificada de los OUI más comunes
    const oui = mac.substring(0, 8).toUpperCase();
    const vendors: { [key: string]: string } = {
      '00:50:56': 'VMware',
      '08:00:27': 'VirtualBox',
      '00:0C:29': 'VMware',
      '00:1C:42': 'Parallels',
      '00:15:5D': 'Microsoft Hyper-V',
      '00:16:3E': 'Xen',
      'DC:A6:32': 'Raspberry Pi',
      'B8:27:EB': 'Raspberry Pi',
      'E4:5F:01': 'Raspberry Pi',
      '28:CD:C1': 'Raspberry Pi',
      '00:1B:44': 'Cisco',
      '00:1E:58': 'WD',
      '00:22:72': 'American Micro-Fuel Device',
      '00:26:BB': 'Apple',
      '3C:07:54': 'Apple',
      '00:1F:F3': 'Apple',
      'AC:DE:48': 'Apple',
      '00:50:C2': 'IEEE Registration Authority',
    };
    
    for (const [ouiPrefix, vendor] of Object.entries(vendors)) {
      if (oui.startsWith(ouiPrefix)) {
        return vendor;
      }
    }
    
    return 'Desconocido';
  } catch (error) {
    return 'Desconocido';
  }
}

// Función principal de escaneo
export async function scanNetwork(): Promise<Device[]> {
  console.log('Iniciando escaneo de red...');
  
  try {
    // Obtener tabla ARP actual
    const arpEntries = await getArpTable();
    console.log(`Encontradas ${arpEntries.length} entradas en tabla ARP`);
    
    const devices: Device[] = [];
    
    // Procesar cada entrada de la tabla ARP
    for (const entry of arpEntries) {
      console.log(`Procesando dispositivo: ${entry.ip}`);
      
      // Hacer ping para verificar estado y obtener latencia
      const pingResult = await pingHost(entry.ip);
      
      // Obtener información adicional
      const hostname = await getHostname(entry.ip);
      const os = await detectOS(entry.ip);
      const vendor = await getMacVendor(entry.mac);
      
      const device: Device = {
        MAC: entry.mac,
        IP: entry.ip,
        Estado: pingResult.alive ? 1 : 0,
        Latencia: pingResult.latency,
        ProveedorDeMac: vendor,
        NombreEquipo: hostname,
        SO: os
      };
      
      devices.push(device);
    }
    
    // También hacer un escaneo básico de IPs comunes si no hay muchas entradas ARP
    if (arpEntries.length < 5) {
      console.log('Pocas entradas ARP, realizando escaneo adicional...');
      await performAdditionalScan(devices);
    }
    
    console.log(`Escaneo completado. Encontrados ${devices.length} dispositivos`);
    return devices;
    
  } catch (error) {
    console.error('Error durante el escaneo:', error);
    return [];
  }
}

// Función para escaneo adicional cuando hay pocas entradas ARP
async function performAdditionalScan(existingDevices: Device[]): Promise<void> {
  const baseIP = '128.100.0.'; // Ajustar según la red
  const existingIPs = new Set(existingDevices.map(d => d.IP));
  
  // Escanear IPs comunes
  const commonIPs = [1, 2, 3, 4, 5, 10, 20, 50, 100, 101, 102, 103, 104, 105, 254];
  
  for (const lastOctet of commonIPs) {
    const ip = baseIP + lastOctet;
    
    if (existingIPs.has(ip)) continue;
    
    const pingResult = await pingHost(ip);
    
    if (pingResult.alive) {
      console.log(`Dispositivo adicional encontrado: ${ip}`);
      
      const hostname = await getHostname(ip);
      const os = await detectOS(ip);
      
      const device: Device = {
        MAC: 'N/A',
        IP: ip,
        Estado: 1,
        Latencia: pingResult.latency,
        ProveedorDeMac: 'Desconocido',
        NombreEquipo: hostname,
        SO: os
      };
      
      existingDevices.push(device);
    }
  }
}
