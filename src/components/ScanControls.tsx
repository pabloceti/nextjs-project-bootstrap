'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScanControlsProps {
  onScanComplete: (devices: any[]) => void;
  onScanStart: () => void;
}

export default function ScanControls({ onScanComplete, onScanStart }: ScanControlsProps) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanResults, setScanResults] = useState<{
    totalDevices: number;
    savedDevices: number;
    message: string;
  } | null>(null);

  const startScan = async () => {
    setScanning(true);
    setScanResults(null);
    onScanStart();

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setScanResults({
          totalDevices: data.totalDevices,
          savedDevices: data.saveResults?.filter((r: any) => r.success).length || 0,
          message: data.message
        });
        onScanComplete(data.devices);
        setLastScan(new Date());
      } else {
        setScanResults({
          totalDevices: 0,
          savedDevices: 0,
          message: data.message || 'Error durante el escaneo'
        });
        onScanComplete([]);
      }
    } catch (error) {
      setScanResults({
        totalDevices: 0,
        savedDevices: 0,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
      onScanComplete([]);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Control de Escaneo
          {lastScan && (
            <Badge variant="outline" className="text-xs">
              Último escaneo: {lastScan.toLocaleTimeString()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={startScan}
            disabled={scanning}
            className="flex-1"
          >
            {scanning ? 'Escaneando...' : 'Iniciar Escaneo de Red'}
          </Button>
        </div>

        {scanning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Escaneando red local...</span>
              <span className="text-gray-500">Esto puede tomar unos minutos</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {scanResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {scanResults.totalDevices}
                </div>
                <div className="text-sm text-blue-800">
                  Dispositivos Encontrados
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {scanResults.savedDevices}
                </div>
                <div className="text-sm text-green-800">
                  Guardados en BD
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{scanResults.message}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• El escaneo detecta dispositivos activos en la red local</p>
          <p>• Se obtiene información de IP, MAC, latencia y más</p>
          <p>• Los resultados se guardan automáticamente en la base de datos</p>
          <p>• Red configurada: {process.env.NEXT_PUBLIC_NETWORK_RANGE || '128.100.0.0/24'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
