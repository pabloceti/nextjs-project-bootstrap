'use client';

import { useState, useEffect } from 'react';
import { Device } from '@/lib/types';
import DatabaseStatus from './DatabaseStatus';
import ScanControls from './ScanControls';
import DeviceTable from './DeviceTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NetworkScanner() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Cargar dispositivos desde la base de datos al iniciar
  const loadDevicesFromDB = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error cargando dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar inicio de escaneo
  const handleScanStart = () => {
    setLoading(true);
  };

  // Manejar finalización de escaneo
  const handleScanComplete = (newDevices: Device[]) => {
    setDevices(newDevices);
    setLoading(false);
  };

  // Refrescar datos desde la base de datos
  const refreshFromDB = async () => {
    await loadDevicesFromDB();
  };

  // Auto-refresh cada 30 segundos si está habilitado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshFromDB();
      }, 30000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // Cargar dispositivos al montar el componente
  useEffect(() => {
    loadDevicesFromDB();
  }, []);

  return (
    <div className="space-y-6">
      {/* Estado de la Base de Datos */}
      <DatabaseStatus />

      {/* Controles de Escaneo */}
      <ScanControls 
        onScanStart={handleScanStart}
        onScanComplete={handleScanComplete}
      />

      {/* Controles Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={refreshFromDB}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Cargando...' : 'Refrescar desde BD'}
            </Button>
            
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>

            <Button
              onClick={() => setDevices([])}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Limpiar Vista
            </Button>
          </div>
          
          {autoRefresh && (
            <div className="mt-2 text-xs text-gray-500">
              Los datos se actualizan automáticamente cada 30 segundos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Dispositivos */}
      <DeviceTable devices={devices} loading={loading} />

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Configuración de Red</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Rango de escaneo: 128.100.0.0/24</li>
                <li>• Timeout de ping: 5 segundos</li>
                <li>• Detección automática de SO</li>
                <li>• Lookup de proveedores MAC</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Base de Datos</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Servidor: 128.100.0.100\CETISQLSERVER</li>
                <li>• Base de datos: Informatica</li>
                <li>• Tabla: ConexRedInterna</li>
                <li>• Puerto: 1433</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
