# VERIFARM

> **Sistema de Trazabilidad Farmacéutica por Lote (FEFO) y Soporte a la Decisión Clínica ante Polimedicación**

Proyecto Final de Grado para la carrera de **Ingeniería en Sistemas de Información**  
**Universidad Tecnológica Nacional — Facultad Regional Córdoba (UTN-FRC)**  
Comisión 5K01 — Ciclo Lectivo 2026  

- **Autores:**
  - Fiorini, Mauricio Mateo (Leg. 50475)
  - Pastorino, Juan José (Leg. 50469)
  - Malizani, Juan Pablo (Leg. 50917)
- **Tutora:** Ing. Silvia Alicia Stortoni  
- **Cátedra de Proyecto Final:** Ing. Valeria Aguzzi  
- **Institución Destinataria:** Colonia Psiquiátrica «Dr. Abelardo Irigoyen Freyre» (Oliveros, Santa Fe)

---

## 1. Qué resuelve el proyecto

La Colonia Psiquiátrica «Dr. Abelardo Irigoyen Freyre» es una institución de internación prolongada de la provincia de Santa Fe que atiende a pacientes con patologías de salud mental complejas. Su operativa diaria presenta dos problemáticas críticas interrelacionadas:

1. **Pérdida económica y desperdicio por vencimiento de psicofármacos:**  
   En el depósito de farmacia ingresan medicamentos de alto costo o baja rotación. Sin una trazabilidad granular por lote y fecha de caducidad, es frecuente que se consuman medicamentos que ingresaron recientemente mientras vencen lotes previos almacenados en estantería.  
   **Solución de Verifarm:** Trazabilidad estricta por lote y aplicación automática del algoritmo **FEFO (*First Expired, First Out*)**: ante cualquier dispensación o egreso, el sistema consume prioritariamente el lote que vence antes (no el que entró antes, como haría un criterio FIFO). Si la cantidad requerida excede el stock del primer lote, se fracciona automáticamente asignando cantidades exactas entre lotes con trazabilidad inmutable.

2. **Riesgo clínico severo por polimedicación crónica:**  
   En psiquiatría institucionalizada, los pacientes conviven durante años con esquemas de 5 o más psicofármacos combinados (antipsicóticos, benzodiacepinas, antidepresivos, estabilizadores del ánimo, anticolinérgicos). Cada nueva prescripción o ajuste añade interacciones potenciales (prolongación de intervalo QT, depresión respiratoria, sedación excesiva, síndrome serotoninérgico) que son difíciles de contrastar manualmente en la práctica diaria.  
   **Solución de Verifarm:** Módulo clínico integrado que evalúa de forma determinística la **medicación vigente** de cada paciente contra un catálogo propio de interacciones estandarizadas en **RxNorm (RxCUI)**. El sistema genera observaciones clínicas explicativas claras y oportunas.

3. **El punto de unión — La entidad `Medicamento`:**  
   No se trata de dos sistemas separados. Es una única plataforma donde `Medicamento` actúa como núcleo común: el mismo fármaco cuyo stock y lotes se gestionan en depósito es el que se prescribe, asocia al paciente y evalúa clínicamente por interacciones.

---

## 2. Cómo se levanta el proyecto

### Requisitos previos

- **Node.js:** Versión 20 o superior LTS ([nodejs.org](https://nodejs.org/)).
- **Docker & Docker Compose:** Docker Desktop en ejecución ([docker.com](https://www.docker.com/)).
- **Git:** Para control de versiones.

### Configuración del entorno

1. Clonar el repositorio y posicionarse en el directorio del proyecto:

   ```bash
   git clone https://github.com/MauricioFiorini/ProyectoFinalVerifarm.git
   cd ProyectoFinalVerifarm
   ```

2. Configurar el archivo de variables de entorno `.env` en la raíz del proyecto. El archivo ya cuenta con los valores por defecto para desarrollo local:

   ```env
   # Puerto 5433 para evitar colisiones con instancias locales de PostgreSQL
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/verifarm?schema=public"
   PORT=3000
   ```

### Puesta en marcha paso a paso

1. **Instalar dependencias de Node:**

   ```bash
   npm install
   ```

2. **Levantar la base de datos PostgreSQL en Docker:**

   ```bash
   docker compose up -d
   ```

   *Nota:* Verifica que el contenedor de PostgreSQL esté saludable corriendo en el puerto `5433`.

3. **Ejecutar migraciones y cargar el seed definitivo:**

   ```bash
   npm run setup
   ```

   *Este comando ejecuta internamente:*
   - `prisma migrate dev`: Aplica las migraciones de base de datos (`prisma/migrations/`).
   - `prisma db seed`: Carga el catálogo de 25 psicofármacos representativos con RxCUI verificado, lotes preparados para demostración FEFO, stock bajo mínimo, 1150 pares de interacciones de severidad alta (ONCHigh) y pacientes con esquemas de medicación activa que disparan alertas clínicas reales.

4. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**  
   Ingresar a [http://localhost:3000](http://localhost:3000).

### Usuarios para pruebas del prototipo

El sistema incluye un **selector de usuario simulado** en el extremo superior derecho de la barra institucional para alternar roles sin necesidad de autenticación real (la autenticación con JWT/RBAC quedó deliberadamente fuera del alcance del prototipo, ver `docs/ROADMAP_PRODUCTO.md`):

- **Farmacéutico:** Ana Clara Benítez
- **Médico Psiquiatra:** Dr. Gregory House
- **Administrador:** Juan José Pastorino

### Verificación de código y calidad

Para comprobar tipos en TypeScript, reglas de ESLint y formato de código en Prettier:

```bash
npm run check
```

Para abrir la interfaz visual de base de datos con Prisma Studio:

```bash
npx prisma studio
```

---

## 3. Decisiones de Arquitectura y Diseño

### Stack tecnológico

- **Frontend & Backend Integrado:** **Next.js 16 (App Router)** con React Server Components y Route Handlers (`src/app/api/`). Permite servir la interfaz y los endpoints REST desde un único proceso Node, simplificando el despliegue y eliminando puntos de fallo externos para la defensa.
- **Lenguaje:** **TypeScript estricto** en todo el proyecto (`noImplicitAny`, interfaces estrictas para entidades, DTOs y respuestas).
- **Base de Datos & ORM:** **PostgreSQL 16** gestionado mediante **Prisma ORM 7.10.0**, con migraciones declarativas y consultas seguras tipadas.
- **Estilos:** **Tailwind CSS** con paleta semántica institucional personalizada (`primario`, `superficie`, `borde`, `texto`, `critico`, `advertencia`, `exito`). No se utilizan bibliotecas de componentes externas (como Shadcn, Radix o MUI) para mantener un control artesanal absoluto del código, evitar dependencias frágiles y garantizar accesibilidad nativa.

### Arquitectura en tres capas desacopladas

El flujo de información sigue un diseño unidireccional estricto:

```
[ Navegador / Cliente React ]
              │
              │  fetch("/api/...")
              ▼
[ Route Handlers: src/app/api/**/route.ts ]
   - Validan payloads de entrada con esquemas Zod
   - Manejan códigos de estado HTTP (200, 201, 400, 404, 500)
   - Delegan inmediatamente sin contener reglas de negocio
              │
              │  llamada a funciones de servicio
              ▼
[ Servicios de Dominio: src/services/**.ts ]
   - Contienen TODA la lógica de negocio (FEFO, saldos, unicidad, interacciones)
   - Son funciones desacopladas: no importan Request, Response ni cabeceras HTTP
              │
              │  consultas SQL tipadas
              ▼
[ Acceso a Datos: src/lib/db.ts (Prisma Client) ]
              │
              ▼
[ Base de Datos PostgreSQL 16 (Docker :5433) ]
```

### Principios y decisiones fundamentales

1. **Saldos de stock calculados, nunca persistidos:**  
   La cantidad disponible de un lote o de un medicamento no se almacena en una columna `cantidad_actual`. Se calcula en tiempo real a partir del libro mayor de inventario (`ingreso` menos suma de `egreso`). Persistir un saldo crearía dos fuentes de verdad propensas a inconsistencias concurrentes.

2. **Dispensación FEFO estricta:**  
   La lógica de egreso (`dispensarMedicamento`) recupera los lotes vigentes ordenados por `fechaVencimiento ASC`. Descuenta las unidades necesarias del lote más próximo a vencer y, si se agota, continúa sucesivamente con los siguientes, registrando un movimiento inmutable por cada fracción.

3. **Base de interacciones local y determinística:**  
   En enero de 2024, la *National Library of Medicine* (NLM) de EE.UU. **discontinuó definitivamente la Drug Interaction API de RxNav**. En lugar de depender de servicios de terceros caídos o inestables, Verifarm incorpora una tabla propia normalizada con **1150 interacciones de severidad alta** provenientes de la lista oficial **ONCHigh** (HealthIT.gov / NLM), indexadas con pares ordenados de códigos RxNorm (`ordenarParRxcui`). La detección es determinística, funciona 100% offline y es totalmente citable y verificable.

4. **Observaciones compuestas por plantilla:**  
   La generación de explicaciones clínicas no depende de APIs de LLM externas comerciales (OpenAI, Anthropic, Gemini). Se resuelven mediante plantillas clínicas estructuradas que garantizan que el sistema funcione en la mesa de examen sin conexión a internet ni consumo de créditos.

5. **Seudonimización de pacientes (Ley 25.326):**  
   En estricto cumplimiento de la Ley de Protección de Datos Personales (art. 8, datos de salud), el sistema no almacena nombres, apellidos ni DNIs. Cada paciente se identifica únicamente mediante un código seudonimizado (`PAC-101`), manteniendo la confidencialidad en entornos académicos y de prueba.

6. **El sistema asiste, no decide:**  
   Ante una interacción medicamentosa grave, el sistema emite una advertencia destacada (`<AvisoClinico />`) pero **no bloquea** la dispensación ni la prescripción. La responsabilidad y el criterio clínico final permanecen siempre bajo la órbita del profesional médico y farmacéutico.

7. **Manejo de errores global y componentes reutilizables:**  
   La aplicación cuenta con error boundaries nativos (`src/app/error.tsx`), pantalla 404 personalizada (`src/app/not-found.tsx`), manejador crítico de layout (`src/app/global-error.tsx`) y una suite de 7 componentes base en `src/components/ui/` (`Boton`, `Campo`, `Tabla`, `Modal`, `Chip`, `AvisoClinico` y `ErrorSeccion`).

8. **Diseño responsive garantizado:**  
   Todas las interfaces están probadas y optimizadas tanto para la resolución nativa de notebook utilizada en la mesa de defensa académica (1366×768 y 1280×800) como para dispositivos reducidos (375 px), mediante tablas con scroll horizontal contenido y modales fluidos.

---

## 4. Mapa del Repositorio y Documentación

Toda la fundamentación conceptual, decisiones de diseño y registros de avance se encuentran en el directorio `docs/`:

| Archivo | Contenido |
|---|---|
| [`docs/CONTEXTO.md`](docs/CONTEXTO.md) | Qué es el proyecto, problema del destinatario, fundamentación y quiénes somos. |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Detalle técnico interno, flujo de peticiones, diseño de capas y stack. |
| [`docs/CONVENCIONES.md`](docs/CONVENCIONES.md) | Reglas del equipo, política de ramas, autoría de commits y formato. |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Estado detallado del proyecto y seguimiento tarea por tarea (Fases 0 a 6). |
| [`docs/ROADMAP_PRODUCTO.md`](docs/ROADMAP_PRODUCTO.md) | Registro de funcionalidades que deliberadamente quedaron fuera del prototipo académico. |
| [`docs/TRASPASO.md`](docs/TRASPASO.md) | Documento dinámico que describe el estado exacto del último bloque de trabajo. |
| [`docs/decisiones/`](docs/decisiones/) | Registro secuencial de decisiones arquitectónicas tomadas (`0001` a `0015`). |
| [`docs/MD_VERIFARM.drawio`](docs/MD_VERIFARM.drawio) | Diagrama del modelo de dominio de Verifarm. |

---

## 5. Recorrido Rápido de Uso

1. **Tablero de Inicio (`/`):** Panorama general con tres tarjetas clave: medicamentos bajo stock mínimo, lotes con vencimiento próximo a 30 días y consultas clínicas realizadas en la jornada, junto con accesos rápidos a los módulos.
2. **Catálogo de Medicamentos (`/medicamentos`):** Alta y búsqueda de fármacos con su nombre genérico, forma farmacéutica, concentración, código RxCUI y umbral de stock mínimo.
3. **Gestión de Stock (`/stock`):** Vista de existencias calculadas en tiempo real. Al ingresar al detalle de un medicamento (`/stock/[id]`), permite registrar ingresos de lotes con fecha de vencimiento y realizar dispensaciones automáticas bajo lógica FEFO.
4. **Ficha del Paciente (`/pacientes`):** Registro de pacientes seudonimizados y gestión de su medicación activa. Permite disparar la evaluación de interacciones con un solo clic.
5. **Evaluación de Interacciones (`/consultas` y `/consultas/nueva`):** Análisis cruzado de fármacos seleccionados, detección de pares riesgosos, nivel de severidad y composición de la observación clínica de soporte médico.
