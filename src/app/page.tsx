import NetworkScanner from '@/components/NetworkScanner';

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Detector de Dispositivos de Red Local
        </h1>
        <p className="text-gray-600">
          Escanea y monitorea todos los dispositivos conectados a tu red local. 
          Los datos se almacenan automáticamente en SQL Server para su análisis posterior.
        </p>
      </div>
      
      <NetworkScanner />
    </div>
  );
}
