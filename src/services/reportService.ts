// Servicio para generar reportes profesionales en PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReporteData {
  fecha: string;
  filtro: string;
  stats: {
    totalIngresos: number;
    totalVentas: number;
    rutaMasDemandada: string;
    rutaCount: number;
    horaMasVendida: string;
    metodoPagoEfectivo: number;
    metodoPagoTransferencia: number;
  };
  ventasPorMes: Array<{
    mes: string;
    ventas: number;
    ingresos: number;
  }>;
  rutasData: Array<{
    name: string;
    value: number;
  }>;
  ventasPorHora: Array<{
    hora: string;
    ventas: number;
  }>;
  gananciaBusData: Array<{
    bus: string;
    ganancia: number;
  }>;
}

interface ReporteBusData {
  bus: string;
  placa: string;
  chofer: string;
  totalVentas: number;
  totalIngresos: number;
  historial: Array<any>;
}

const COLORS = {
  primary: '#940016',
  primaryLight: '#B8001F',
  success: '#22c55e',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
  background: '#ffffff'
};

export class ReportService {
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  private static addHeader(doc: jsPDF, title: string) {
    // Logo y título
    doc.setFillColor(COLORS.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor('#ffffff');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Trans Doramald', 15, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Transporte Rural de Confianza', 15, 22);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 30);
    
    // Fecha
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generado: ${fecha}`, 210 - 15, 30, { align: 'right' });
    
    doc.setTextColor(COLORS.text);
  }

  private static addFooter(doc: jsPDF, pageNumber: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight);
    doc.text(
      `Página ${pageNumber} | © 2024 Trans Doramald - Sistema de Gestión`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  private static addSection(doc: jsPDF, title: string, yPosition: number): number {
    doc.setFillColor(COLORS.primary);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 17, yPosition + 5.5);
    doc.setTextColor(COLORS.text);
    return yPosition + 12;
  }

  // Reporte completo general
  static generarReporteCompleto(data: ReporteData): void {
    const doc = new jsPDF();
    let yPos = 45;

    // Header
    this.addHeader(doc, 'Reporte de Estadísticas General');

    // Filtro aplicado
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtro:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filtro, 30, yPos);
    yPos += 10;

    // KPIs principales
    yPos = this.addSection(doc, 'Indicadores Principales', yPos);

    const kpis = [
      ['Ingresos Totales', this.formatCurrency(data.stats.totalIngresos)],
      ['Total de Ventas', data.stats.totalVentas.toString()],
      ['Ruta Más Demandada', `${data.stats.rutaMasDemandada} (${data.stats.rutaCount} viajes)`],
      ['Hora Más Vendida', data.stats.horaMasVendida],
      ['Efectivo', `${data.stats.metodoPagoEfectivo} transacciones`],
      ['Transferencia', `${data.stats.metodoPagoTransferencia} transacciones`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Indicador', 'Valor']],
      body: kpis,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Ventas por mes
    if (data.ventasPorMes.length > 0) {
      yPos = this.addSection(doc, 'Ventas por Mes', yPos);

      const ventasMesData = data.ventasPorMes.map(m => [
        m.mes,
        m.ventas.toString(),
        this.formatCurrency(m.ingresos)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Mes', 'Boletos Vendidos', 'Ingresos']],
        body: ventasMesData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Nueva página para rutas
    doc.addPage();
    yPos = 20;
    
    yPos = this.addSection(doc, 'Rutas Más Demandadas', yPos);

    if (data.rutasData.length > 0) {
      const rutasTableData = data.rutasData.map(r => [
        r.name,
        r.value.toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Ruta', 'Número de Viajes']],
        body: rutasTableData,
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Ventas por hora
    if (data.ventasPorHora.length > 0 && yPos < 240) {
      yPos = this.addSection(doc, 'Ventas por Hora', yPos);

      const ventasHoraData = data.ventasPorHora.map(h => [
        h.hora,
        h.ventas.toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Hora', 'Boletos Vendidos']],
        body: ventasHoraData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
    }

    // Nueva página para ganancias por bus
    if (data.gananciaBusData.length > 0) {
      doc.addPage();
      yPos = 20;
      
      yPos = this.addSection(doc, 'Ganancia por Bus', yPos);

      const busTableData = data.gananciaBusData.map(b => [
        `Bus ${b.bus}`,
        this.formatCurrency(b.ganancia)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Bus', 'Ganancia Total']],
        body: busTableData,
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 },
        foot: [[
          'Total',
          this.formatCurrency(data.gananciaBusData.reduce((sum, b) => sum + b.ganancia, 0))
        ]],
        footStyles: { fillColor: COLORS.success, textColor: '#ffffff', fontStyle: 'bold' }
      });
    }

    // Footer en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    // Guardar PDF
    const filename = `Reporte_General_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  // Reporte individual por bus
  static generarReportePorBus(data: ReporteBusData): void {
    const doc = new jsPDF();
    let yPos = 45;

    // Header
    this.addHeader(doc, `Reporte de Bus ${data.bus}`);

    // Información del bus
    yPos = this.addSection(doc, 'Información del Vehículo', yPos);

    const infoData = [
      ['Número de Bus', data.bus],
      ['Placa', data.placa],
      ['Chofer', data.chofer],
      ['Total de Ventas', data.totalVentas.toString()],
      ['Ingresos Totales', this.formatCurrency(data.totalIngresos)]
    ];

    autoTable(doc, {
      startY: yPos,
      body: infoData,
      theme: 'plain',
      margin: { left: 15, right: 15 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Historial de ventas
    if (data.historial.length > 0) {
      yPos = this.addSection(doc, 'Historial de Ventas', yPos);

      const historialData = data.historial.slice(0, 50).map(h => [
        h.fechaSalida || 'N/A',
        h.horaSalida || 'N/A',
        h.paradaNombre || 'N/A',
        h.metodoPago || 'N/A',
        this.formatCurrency(h.precio || 0)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Hora', 'Ruta', 'Método Pago', 'Precio']],
        body: historialData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary, textColor: '#ffffff' },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 60 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 }
        }
      });

      // Nota si hay más registros
      if (data.historial.length > 50) {
        yPos = (doc as any).lastAutoTable.finalY + 5;
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textLight);
        doc.text(
          `Mostrando 50 de ${data.historial.length} registros totales`,
          15,
          yPos
        );
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    // Guardar PDF
    const filename = `Reporte_Bus_${data.bus}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  // Reporte mensual específico
  static generarReporteMensual(mes: string, data: any): void {
    const doc = new jsPDF();
    let yPos = 45;

    this.addHeader(doc, `Reporte Mensual - ${mes}`);

    // Aquí puedes agregar la lógica específica para reportes mensuales
    // Similar a los métodos anteriores

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    const filename = `Reporte_Mensual_${mes.replace(' ', '_')}.pdf`;
    doc.save(filename);
  }
}