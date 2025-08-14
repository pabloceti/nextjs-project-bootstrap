import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/database';
import { mockInitializeDatabase } from '@/lib/mockDatabase';

export async function POST(request: NextRequest) {
  try {
    // Intentar inicialización real primero
    const result = await initializeDatabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }
  } catch (error) {
    // Si falla la inicialización real, usar modo demo
    try {
      const mockResult = await mockInitializeDatabase();
      return NextResponse.json({
        success: true,
        message: mockResult.message
      }, { status: 200 });
    } catch (mockError) {
      return NextResponse.json({
        success: false,
        message: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }, { status: 500 });
    }
  }
}
