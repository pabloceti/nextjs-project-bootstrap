import { NextRequest, NextResponse } from 'next/server';
import { scanNetwork } from '@/lib/networkScanner';
import { mockScanNetwork } from '@/lib/mockNetworkScanner';
import { saveDevice } from '@/lib/database';
import { mockSaveDevice, addMockDevice } from '@/lib/mockDatabase';
import { ScanResult, Device } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando escaneo de red desde API...');
    
    let devices: Device[] = [];
    let scanMode = 'real';
    
    try {
      // Intentar escaneo real primero
      devices = await scanNetwork();
    } catch (scanError) {
      console.log('Escaneo real falló, usando escaneo simulado...');
      // Si falla el escaneo real, usar simulado
      devices = await mockScanNetwork();
      scanMode = 'demo';
    }
    
    if (devices.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No se encontraron dispositivos en la red',
        devices: [],
        scanTime: new Date(),
        totalDevices: 0
      }, { status: 200 });
    }
    
    // Guardar dispositivos en la base de datos
    const saveResults = [];
    for (const device of devices) {
      try {
        // Intentar guardar en base de datos real primero
        const result = await saveDevice(device);
        saveResults.push({
          device: device.IP,
          success: result.success,
          message: result.message
        });
      } catch (error) {
        // Si falla, usar base de datos simulada
        try {
          const mockResult = await mockSaveDevice(device);
          saveResults.push({
            device: device.IP,
            success: mockResult.success,
            message: mockResult.message + ' (Modo Demo)'
          });
        } catch (mockError) {
          saveResults.push({
            device: device.IP,
            success: false,
            message: `Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`
          });
        }
      }
    }
    
    const successfulSaves = saveResults.filter(r => r.success).length;
    
    const scanResult: ScanResult = {
      devices,
      scanTime: new Date(),
      totalDevices: devices.length
    };
    
    return NextResponse.json({
      success: true,
      message: `Escaneo completado${scanMode === 'demo' ? ' (Modo Demo)' : ''}. ${devices.length} dispositivos encontrados, ${successfulSaves} guardados en base de datos.`,
      ...scanResult,
      saveResults,
      scanMode
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error durante el escaneo:', error);
    
    return NextResponse.json({
      success: false,
      message: `Error durante el escaneo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      devices: [],
      scanTime: new Date(),
      totalDevices: 0
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint de escaneo de red. Use POST para iniciar un escaneo.',
    usage: 'POST /api/scan'
  });
}
