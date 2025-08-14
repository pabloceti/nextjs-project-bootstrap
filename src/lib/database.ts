import sql from 'mssql';
import { Device, DatabaseStatus } from './types';

const config: sql.config = {
  server: process.env.DB_SERVER || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'Informatica',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: 'CETISQLSERVER',
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
  }
  return pool;
}

export async function testConnection(): Promise<DatabaseStatus> {
  try {
    const connection = await getConnection();
    await connection.request().query('SELECT 1 as test');
    return {
      connected: true,
      message: 'Conexión exitosa a SQL Server',
      lastCheck: new Date()
    };
  } catch (error) {
    return {
      connected: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      lastCheck: new Date()
    };
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const connection = await getConnection();
    
    // Verificar si la base de datos existe
    const dbCheck = await connection.request()
      .query(`SELECT name FROM sys.databases WHERE name = '${process.env.DB_DATABASE}'`);
    
    if (dbCheck.recordset.length === 0) {
      // Crear base de datos si no existe
      await connection.request()
        .query(`CREATE DATABASE [${process.env.DB_DATABASE}]`);
    }
    
    // Usar la base de datos
    await connection.request()
      .query(`USE [${process.env.DB_DATABASE}]`);
    
    // Verificar si la tabla existe
    const tableCheck = await connection.request()
      .query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${process.env.DB_TABLE}'`);
    
    if (tableCheck.recordset.length === 0) {
      // Crear tabla si no existe
      const createTableQuery = `
        CREATE TABLE [${process.env.DB_TABLE}] (
          ID int IDENTITY(1,1) PRIMARY KEY,
          MAC nchar(17) NOT NULL,
          IP nchar(15) NOT NULL,
          Estado smallint NOT NULL,
          Latencia nvarchar(50),
          ProveedorDeMac nvarchar(255),
          NombreEquipo nvarchar(255),
          SO nvarchar(255),
          FechaDeteccion datetime DEFAULT GETDATE(),
          UNIQUE(MAC, IP)
        )
      `;
      await connection.request().query(createTableQuery);
    }
    
    return {
      success: true,
      message: 'Base de datos y tabla inicializadas correctamente'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al inicializar base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

export async function saveDevice(device: Device): Promise<{ success: boolean; message: string }> {
  try {
    const connection = await getConnection();
    
    // Usar MERGE para insertar o actualizar
    const query = `
      USE [${process.env.DB_DATABASE}];
      MERGE [${process.env.DB_TABLE}] AS target
      USING (SELECT @MAC as MAC, @IP as IP) AS source
      ON (target.MAC = source.MAC OR target.IP = source.IP)
      WHEN MATCHED THEN
        UPDATE SET 
          Estado = @Estado,
          Latencia = @Latencia,
          ProveedorDeMac = @ProveedorDeMac,
          NombreEquipo = @NombreEquipo,
          SO = @SO,
          FechaDeteccion = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (MAC, IP, Estado, Latencia, ProveedorDeMac, NombreEquipo, SO)
        VALUES (@MAC, @IP, @Estado, @Latencia, @ProveedorDeMac, @NombreEquipo, @SO);
    `;
    
    await connection.request()
      .input('MAC', sql.NChar(17), device.MAC)
      .input('IP', sql.NChar(15), device.IP)
      .input('Estado', sql.SmallInt, device.Estado)
      .input('Latencia', sql.NVarChar(50), device.Latencia)
      .input('ProveedorDeMac', sql.NVarChar(255), device.ProveedorDeMac)
      .input('NombreEquipo', sql.NVarChar(255), device.NombreEquipo)
      .input('SO', sql.NVarChar(255), device.SO)
      .query(query);
    
    return {
      success: true,
      message: 'Dispositivo guardado correctamente'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al guardar dispositivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

export async function getAllDevices(): Promise<Device[]> {
  try {
    const connection = await getConnection();
    const result = await connection.request()
      .query(`USE [${process.env.DB_DATABASE}]; SELECT MAC, IP, Estado, Latencia, ProveedorDeMac, NombreEquipo, SO FROM [${process.env.DB_TABLE}] ORDER BY FechaDeteccion DESC`);
    
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener dispositivos:', error);
    return [];
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
