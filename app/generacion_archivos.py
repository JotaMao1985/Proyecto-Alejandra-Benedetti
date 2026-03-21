import os
import random
import datetime
from pathlib import Path
from faker import Faker
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

# Configuración inicial
fake = Faker('es_CO')
BASE_DIR = "documentos_generados"
TIPOS_DOCS = {
    "quejas_reclamos": {"prefijo": "QR", "nombre": "Queja y Reclamo"},
    "contratos": {"prefijo": "CT", "nombre": "Contrato"},
    "resoluciones_administrativas": {"prefijo": "RA", "nombre": "Resolución"},
    "informes_tecnicos": {"prefijo": "IT", "nombre": "Informe Técnico"},
    "comunicaciones_internas": {"prefijo": "CI", "nombre": "Memorando Interno"}
}

def generar_nit():
    """Genera un NIT colombiano ficticio con formato válido (9 dígitos + dígito de verificación)."""
    base = random.randint(800000000, 999999999)
    # Cálculo simplificado del dígito de verificación
    digito_verificacion = random.randint(0, 9)
    return f"{base}-{digito_verificacion}"

class GeneradorDocumentosCol:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._crear_estilos_personalizados()
        
    def _crear_estilos_personalizados(self):
        """Crea estilos de texto adaptados a documentos formales."""
        self.styles.add(ParagraphStyle(name='Justify', parent=self.styles['Normal'], alignment=TA_JUSTIFY, spaceAfter=12))
        self.styles.add(ParagraphStyle(name='CenterTitle', parent=self.styles['Heading1'], alignment=TA_CENTER, spaceAfter=20))
        self.styles.add(ParagraphStyle(name='RightDate', parent=self.styles['Normal'], alignment=TA_RIGHT, spaceAfter=20))
        self.styles.add(ParagraphStyle(name='Signature', parent=self.styles['Normal'], spaceBefore=40))

    def _get_fecha_reciente(self):
        """Genera una fecha del último mes."""
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=30)
        random_date = fake.date_between(start_date=start_date, end_date=end_date)
        meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
        return f"{random_date.day} de {meses[random_date.month - 1]} de {random_date.year}"

    def _crear_encabezado_pie(self, canvas, doc):
        """Función callback para encabezado y pie de página en cada hoja."""
        canvas.saveState()
        # Encabezado
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(inch, 10.5 * inch, "ENTIDAD FICTICIA DE COLOMBIA S.A.S.")
        canvas.setFont('Helvetica', 8)
        canvas.drawString(inch, 10.35 * inch, f"NIT: {generar_nit()} - {fake.city()}")
        canvas.line(inch, 10.3 * inch, 7.5 * inch, 10.3 * inch)
        
        # Pie de página
        canvas.setFont('Helvetica', 8)
        canvas.drawString(inch, 0.75 * inch, "Documento generado para fines de prueba y clasificación automática.")
        canvas.drawRightString(7.5 * inch, 0.75 * inch, f"Página {doc.page}")
        canvas.restoreState()

    def generar_queja(self, filepath, consecutivo):
        """Genera una PQR basada en la Ley 1480 de 2011."""
        doc = SimpleDocTemplate(filepath, pagesize=LETTER)
        story = []
        
        # Datos variables
        nombre_cliente = fake.name()
        ciudad = fake.city()
        fecha = self._get_fecha_reciente()
        motivo = random.choice(["Garantía de Producto", "Cobro Injustificado", "Mala Atención", "Publicidad Engañosa", "Derecho de Retracto"])
        
        story.append(Paragraph(f"Ciudad: {ciudad}", self.styles['RightDate']))
        story.append(Paragraph(f"Fecha: {fecha}", self.styles['RightDate']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph(f"REFERENCIA: {consecutivo} - RECLAMO DIRECTO (LEY 1480 DE 2011)", self.styles['Heading2']))
        story.append(Spacer(1, 12))
        
        cuerpo = [
            f"Yo, <b>{nombre_cliente}</b>, identificado con Cédula de Ciudadanía No. {fake.random_int(10000000, 99999999)}, "
            f"actuando en calidad de consumidor, presento formalmente este reclamo por: {motivo}.",
            
            "<b>HECHOS:</b>",
            f"El día {fake.date_this_year()}, adquirí un servicio/producto en sus instalaciones. "
            f"Sin embargo, {fake.sentence(nb_words=20)} El producto presenta fallas reiteradas que impiden su uso normal.",
            
            "<b>PRETENSIONES:</b>",
            "Solicito la efectividad de la garantía legal, procediendo con la reparación, cambio del bien o devolución del dinero, "
            "según lo estipulado en el Artículo 7 y siguientes del Estatuto del Consumidor.",
            
            "<b>FUNDAMENTO LEGAL:</b>",
            "Invoco la Ley 1480 de 2011 (Estatuto del Consumidor), Artículos 3 (Derechos), 7 (Garantía Legal) y 23 (Información).",
            
            "Quedo atento a su respuesta dentro del término legal de quince (15) días hábiles."
        ]
        
        for parrafo in cuerpo:
            story.append(Paragraph(parrafo, self.styles['Justify']))
        
        story.append(Paragraph("Cordialmente,", self.styles['Signature']))
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"__________________________<br/>{nombre_cliente}", self.styles['Normal']))
        
        doc.build(story, onFirstPage=self._crear_encabezado_pie, onLaterPages=self._crear_encabezado_pie)

    def generar_contrato(self, filepath, consecutivo):
        """Genera un contrato comercial o civil."""
        doc = SimpleDocTemplate(filepath, pagesize=LETTER)
        story = []
        
        tipo_contrato = random.choice(["PRESTACIÓN DE SERVICIOS PROFESIONALES", "ARRENDAMIENTO COMERCIAL", "SUMINISTRO", "CONFIDENCIALIDAD", "COMPRAVENTA"])
        contratante = fake.company()
        contratista = fake.name()
        valor = f"${random.randint(1, 50)}.{random.randint(100, 999)}.000"
        
        story.append(Paragraph(f"CONTRATO DE {tipo_contrato}", self.styles['CenterTitle']))
        story.append(Paragraph(f"No. {consecutivo}", self.styles['CenterTitle']))
        
        intro = f"Entre los suscritos a saber: <b>{contratante}</b>, con NIT {generar_nit()}, quien en adelante se llamará EL CONTRATANTE, " \
                f"y <b>{contratista}</b>, mayor de edad, identificado con C.C. {fake.ean8()}, quien se llamará EL CONTRATISTA, " \
                f"hemos acordado celebrar el presente contrato regido por las siguientes cláusulas:"
        
        story.append(Paragraph(intro, self.styles['Justify']))
        
        clausulas = [
            f"<b>PRIMERA - OBJETO:</b> El Contratista se obliga de manera independiente a {fake.bs()} en favor del Contratante.",
            f"<b>SEGUNDA - VALOR Y FORMA DE PAGO:</b> El valor del presente contrato es de {valor} M/CTE, pagaderos previa presentación de cuenta de cobro y soporte de pago a seguridad social (Ley 797 de 2003).",
            f"<b>TERCERA - DURACIÓN:</b> El plazo de ejecución será de {random.randint(1, 12)} meses contados a partir de la firma del acta de inicio.",
            "<b>CUARTA - DOMICILIO CONTRACTUAL:</b> Para todos los efectos legales, el domicilio contractual será la ciudad de Bogotá D.C.",
            "<b>QUINTA - MÉRITO EJECUTIVO:</b> El presente documento presta mérito ejecutivo en caso de incumplimiento de las obligaciones dinerarias aquí pactadas."
        ]
        
        for clausula in clausulas:
            story.append(Paragraph(clausula, self.styles['Justify']))
            story.append(Spacer(1, 6))

        story.append(Spacer(1, 40))
        
        # Tabla de firmas
        data = [[f"__________________\n{contratante}\nNIT: {generar_nit()}", f"__________________\n{contratista}\nCC: {fake.ean8()}"]]
        t = Table(data)
        t.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'BOTTOM')]))
        story.append(t)
        
        doc.build(story, onFirstPage=self._crear_encabezado_pie, onLaterPages=self._crear_encabezado_pie)

    def generar_resolucion(self, filepath, consecutivo):
        """Genera un acto administrativo."""
        doc = SimpleDocTemplate(filepath, pagesize=LETTER)
        story = []
        
        director = fake.name()
        entidad = "LA DIRECCIÓN DE GESTIÓN HUMANA Y PROCESOS"
        
        story.append(Paragraph(f"RESOLUCIÓN NÚMERO {consecutivo} DE {datetime.date.today().year}", self.styles['CenterTitle']))
        story.append(Paragraph(f"({self._get_fecha_reciente()})", self.styles['CenterTitle']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph(f'"{fake.catch_phrase()}"', self.styles['CenterTitle']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph(f"El Director de {entidad}, en uso de sus facultades legales y estatutarias, y", self.styles['Justify']))
        
        story.append(Paragraph("<b>CONSIDERANDO:</b>", self.styles['Normal']))
        considerandos = [
            f"Que la entidad tiene como misión {fake.bs()}.",
            f"Que mediante acta del {fake.date_this_year()}, el comité evaluador recomendó la adopción de nuevas medidas.",
            "Que es necesario ajustar los procedimientos internos conforme al Código de Procedimiento Administrativo y de lo Contencioso Administrativo (Ley 1437 de 2011)."
        ]
        for c in considerandos:
            story.append(Paragraph(c, self.styles['Justify']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("<b>RESUELVE:</b>", self.styles['CenterTitle']))
        
        articulos = [
            f"<b>ARTÍCULO PRIMERO:</b> ADOPTAR el manual técnico de {fake.job()} para todos los funcionarios.",
            f"<b>ARTÍCULO SEGUNDO:</b> DESIGNAR a {fake.name()} como supervisor del cumplimiento de esta disposición.",
            "<b>ARTÍCULO TERCERO:</b> Contra la presente resolución proceden los recursos de reposición y apelación dentro de los diez (10) días siguientes a su notificación, conforme al artículo 76 del CPACA.",
            "<b>ARTÍCULO CUARTO:</b> La presente resolución rige a partir de la fecha de su expedición."
        ]
        
        for art in articulos:
            story.append(Paragraph(art, self.styles['Justify']))
            story.append(Spacer(1, 6))

        story.append(Spacer(1, 20))
        story.append(Paragraph("PUBLÍQUESE, NOTIFÍQUESE Y CÚMPLASE", self.styles['CenterTitle']))
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"__________________________<br/>{director}<br/>Director General", self.styles['Normal']))
        
        doc.build(story, onFirstPage=self._crear_encabezado_pie, onLaterPages=self._crear_encabezado_pie)

    def generar_informe(self, filepath, consecutivo):
        """Genera un informe técnico basado en NTC."""
        doc = SimpleDocTemplate(filepath, pagesize=LETTER)
        story = []
        
        titulo_proyecto = fake.bs().upper()
        
        story.append(Paragraph(f"INFORME TÉCNICO: {consecutivo}", self.styles['Heading2']))
        story.append(Paragraph(titulo_proyecto, self.styles['Title']))
        story.append(Spacer(1, 20))
        
        datos = [
            ["Solicitante:", fake.company()],
            ["Fecha:", self._get_fecha_reciente()],
            ["Responsable:", fake.name()],
            ["Norma Aplicable:", "NTC-ISO/IEC 17025 / NTC 2050"]
        ]
        
        t = Table(datos, colWidths=[100, 300])
        t.setStyle(TableStyle([('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'), ('ALIGN', (0,0), (-1,-1), 'LEFT')]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        secciones = [
            ("1. OBJETIVO", f"Evaluar el rendimiento y conformidad de {fake.catch_phrase()}."),
            ("2. METODOLOGÍA", f"Se realizó un análisis cuantitativo utilizando herramientas de {fake.job()}. El muestreo se realizó bajo estándares de la norma NTC-ISO 2859-1."),
            ("3. HALLAZGOS", f"- Se identificó una desviación del {random.randint(1,10)}% en los parámetros esperados.<br/>- El componente {fake.word()} operó dentro de los rangos normales."),
            ("4. CONCLUSIONES", f"El sistema cumple parcialmente con los requerimientos. Se recomienda realizar un mantenimiento preventivo en el área de {fake.job()}.")
        ]
        
        for titulo, contenido in secciones:
            story.append(Paragraph(f"<b>{titulo}</b>", self.styles['Heading3']))
            story.append(Paragraph(contenido, self.styles['Justify']))
            story.append(Spacer(1, 10))
            
        doc.build(story, onFirstPage=self._crear_encabezado_pie, onLaterPages=self._crear_encabezado_pie)

    def generar_comunicacion(self, filepath, consecutivo):
        """Genera un memorando o comunicación interna."""
        doc = SimpleDocTemplate(filepath, pagesize=LETTER)
        story = []
        
        story.append(Paragraph("MEMORANDO INTERNO", self.styles['CenterTitle']))
        story.append(Spacer(1, 20))
        
        remitente = fake.name()
        destinatario = fake.name()
        cargo_dest = fake.job()
        asunto = f"Información sobre {fake.catch_phrase()}"
        
        header_data = [
            ["PARA:", f"{destinatario} - {cargo_dest}"],
            ["DE:", f"{remitente} - Director de Área"],
            ["ASUNTO:", asunto],
            ["FECHA:", self._get_fecha_reciente()],
            ["CÓDIGO:", consecutivo]
        ]
        
        t = Table(header_data, colWidths=[80, 400])
        t.setStyle(TableStyle([('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'), ('ALIGN', (0,0), (-1,-1), 'LEFT')]))
        story.append(t)
        story.append(Spacer(1, 12))
        story.append(Paragraph("_" * 70, self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        cuerpo = [
            f"Cordial saludo estimado(a) {destinatario.split()[0]},",
            f"Por medio de la presente se informa que, siguiendo los lineamientos del manual de procedimientos internos, se ha decidido implementar {fake.bs()}.",
            f"Es fundamental que su equipo de trabajo tenga conocimiento de esta directriz antes del cierre del mes. Se adjunta la documentación pertinente.",
            "Agradezco su gestión y pronta respuesta."
        ]
        
        for p in cuerpo:
            story.append(Paragraph(p, self.styles['Justify']))
            story.append(Spacer(1, 8))
            
        story.append(Spacer(1, 20))
        story.append(Paragraph("Atentamente,", self.styles['Normal']))
        story.append(Spacer(1, 30))
        story.append(Paragraph(remitente, self.styles['Normal']))
        
        doc.build(story, onFirstPage=self._crear_encabezado_pie, onLaterPages=self._crear_encabezado_pie)

    def ejecutar(self):
        """Orquesta la creación de todos los documentos."""
        print(f"Iniciando generación de documentos en: {BASE_DIR}")
        
        if not os.path.exists(BASE_DIR):
            os.makedirs(BASE_DIR)
            
        total_creados = 0
        
        for carpeta_clave, info in TIPOS_DOCS.items():
            path_carpeta = os.path.join(BASE_DIR, carpeta_clave)
            if not os.path.exists(path_carpeta):
                os.makedirs(path_carpeta)
                
            print(f"--- Generando {info['nombre']} ---")
            
            for i in range(1, 6):
                consecutivo = f"{info['prefijo']}-{str(i).zfill(3)}"
                filename = f"{consecutivo}_{info['nombre'].replace(' ', '_')}.pdf"
                filepath = os.path.join(path_carpeta, filename)
                
                try:
                    if carpeta_clave == "quejas_reclamos":
                        self.generar_queja(filepath, consecutivo)
                    elif carpeta_clave == "contratos":
                        self.generar_contrato(filepath, consecutivo)
                    elif carpeta_clave == "resoluciones_administrativas":
                        self.generar_resolucion(filepath, consecutivo)
                    elif carpeta_clave == "informes_tecnicos":
                        self.generar_informe(filepath, consecutivo)
                    elif carpeta_clave == "comunicaciones_internas":
                        self.generar_comunicacion(filepath, consecutivo)
                    
                    print(f"  [OK] Generado: {filename}")
                    total_creados += 1
                except Exception as e:
                    print(f"  [ERROR] Falló {filename}: {str(e)}")
                    
        print(f"\nProceso finalizado. Total documentos: {total_creados}")
        print(f"Ubicación: {os.path.abspath(BASE_DIR)}")

if __name__ == "__main__":
    generador = GeneradorDocumentosCol()
    generador.ejecutar()