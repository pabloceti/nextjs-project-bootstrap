'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatabaseStatus as DatabaseStatusType } from '@/lib/types';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatusType | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/database/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        connected: false,
        message: 'Error al verificar conexión',
        lastCheck: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/database/init', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await checkStatus(); // Verificar estado después de inicializar
      } else {
        setStatus({
          connected: false,
          message: data.message,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        message: 'Error al inicializar base de datos',
        lastCheck: new Date()
      });
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Estado de Base de Datos
          <div className="flex gap-2">
            <Button
              onClick={checkStatus}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </Button>
            <Button
              onClick={initializeDatabase}
              disabled={initializing}
              variant="outline"
              size="sm"
            >
              {initializing ? 'Inicializando...' : 'Inicializar DB'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={status.connected ? 'default' : 'destructive'}>
                {status.connected ? 'Conectado' : 'Desconectado'}
              </Badge>
              <span className="text-sm text-gray-600">
                Última verificación: {new Date(status.lastCheck).toLocaleString()}
              </span>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{status.message}</p>
            </div>
            
            {status.connected && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Servidor: {process.env.NEXT_PUBLIC_DB_SERVER || '128.100.0.100\\CETISQLSERVER'}</p>
                <p>Base de datos: Informatica</p>
                <p>Tabla: ConexRedInterna</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-500">Cargando estado...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
