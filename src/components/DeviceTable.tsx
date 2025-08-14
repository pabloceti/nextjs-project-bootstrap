'use client';

import { Device } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeviceTableProps {
  devices: Device[];
  loading?: boolean;
}

export default function DeviceTable({ devices, loading = false }: DeviceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Detectados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Cargando dispositivos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Detectados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">
              No se han detectado dispositivos. Realiza un escaneo para comenzar.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Dispositivos Detectados
          <Badge variant="secondary">
            {devices.length} dispositivo{devices.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Latencia</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>SO</TableHead>
                <TableHead>Proveedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device, index) => (
                <TableRow key={`${device.IP}-${device.MAC}-${index}`}>
                  <TableCell className="font-mono text-sm">
                    {device.IP}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {device.MAC === 'N/A' ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      device.MAC
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={device.Estado === 1 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {device.Estado === 1 ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {device.Latencia === 'N/A' ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <span className={
                        device.Latencia.includes('ms') && 
                        parseInt(device.Latencia) < 50 
                          ? 'text-green-600' 
                          : device.Latencia.includes('ms') && 
                            parseInt(device.Latencia) < 100
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }>
                        {device.Latencia}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {device.NombreEquipo === 'Desconocido' ? (
                      <span className="text-gray-400">Desconocido</span>
                    ) : (
                      <span className="truncate max-w-32" title={device.NombreEquipo}>
                        {device.NombreEquipo}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {device.SO === 'Desconocido' ? (
                      <span className="text-gray-400">Desconocido</span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {device.SO}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {device.ProveedorDeMac === 'Desconocido' ? (
                      <span className="text-gray-400">Desconocido</span>
                    ) : (
                      <span className="text-sm truncate max-w-24" title={device.ProveedorDeMac}>
                        {device.ProveedorDeMac}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>• Estado: Indica si el dispositivo responde a ping</p>
          <p>• Latencia: Tiempo de respuesta en milisegundos</p>
          <p>• Los datos se actualizan cada vez que se realiza un escaneo</p>
        </div>
      </CardContent>
    </Card>
  );
}
