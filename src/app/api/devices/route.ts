import { NextRequest, NextResponse } from 'next/server';
import { getAllDevices, saveDevice } from '@/lib/database';
import { mockGetAllDevices, mockSaveDevice } from '@/lib/mockDatabase';
import { Device } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener de la base de datos real primero
    const devices = await getAllDevices();
    
    return NextResponse.json({
      success: true,
      devices,
      total: devices.length,
      timestamp: new Date()
    }, { status: 200 });
    
  } catch (error) {
    // Si falla, usar base de datos simulada
    try {
      const mockDevices = await mockGetAllDevices();
      return NextResponse.json({
        success: true,
        devices: mockDevices,
        total: mockDevices.length,
        timestamp: new Date(),
        mode: 'demo'
      }, { status: 200 });
    } catch (mockError) {
      return NextResponse.json({
        success: false,
        message: `Error al obtener dispositivos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        devices: [],
        total: 0
      }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar que el cuerpo contiene los campos requeridos
    const requiredFields = ['MAC', 'IP', 'Estado'];
    const missingFields = requiredFields.filter(field => !(field in body));
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      }, { status: 400 });
    }
    
    const device: Device = {
      MAC: body.MAC || '',
      IP: body.IP || '',
      Estado: body.Estado || 0,
      Latencia: body.Latencia || 'N/A',
      ProveedorDeMac: body.ProveedorDeMac || 'Desconocido',
      NombreEquipo: body.NombreEquipo || 'Desconocido',
      SO: body.SO || 'Desconocido'
    };
    
    try {
      // Intentar guardar en base de datos real primero
      const result = await saveDevice(device);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          device
        }, { status: 201 });
      } else {
        return NextResponse.json({
          success: false,
          message: result.message
        }, { status: 500 });
      }
    } catch (dbError) {
      // Si falla, usar base de datos simulada
      const mockResult = await mockSaveDevice(device);
      return NextResponse.json({
        success: true,
        message: mockResult.message + ' (Modo Demo)',
        device,
        mode: 'demo'
      }, { status: 201 });
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error al procesar solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}
