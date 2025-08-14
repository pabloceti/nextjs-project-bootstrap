import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';
import { mockTestConnection } from '@/lib/mockDatabase';

export async function GET(request: NextRequest) {
  try {
    // Intentar conexión real primero
    const status = await testConnection();
    
    return NextResponse.json(status, { 
      status: status.connected ? 200 : 500 
    });
  } catch (error) {
    // Si falla la conexión real, usar modo demo
    try {
      const mockStatus = await mockTestConnection();
      return NextResponse.json(mockStatus, { status: 200 });
    } catch (mockError) {
      return NextResponse.json({
        connected: false,
        message: `Error al verificar conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        lastCheck: new Date()
      }, { status: 500 });
    }
  }
}
