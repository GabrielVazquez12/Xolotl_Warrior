# Infraestructura Cloud, Pipeline de CI/CD y Despliegue en Edge

## 1. Resumen Ejecutivo
Para garantizar alta disponibilidad, latencia ultra baja y escalabilidad sin fricción en **Xolotl_Warrior**, la aplicación implementa una **arquitectura cloud desacoplada** moderna. La capa de presentación (Frontend) se distribuye globalmente a través de las ubicaciones Edge de AWS mediante **AWS Amplify Hosting**, estableciendo un pipeline automatizado de Integración Continua y Despliegue Continuo (CI/CD) sincronizado directamente con el repositorio de control de versiones.

---

## 2. Topología Arquitectónica

El sistema separa el motor de renderizado del lado del cliente de las capas de persistencia y API, asegurando una separación de incumbencias (SoC) óptima:

       [ Cliente / Navegador ]
                │
                ▼ (HTTPS / Global Edge CDN)
     ┌──────────────────────┐
     │ AWS Amplify Hosting  │ (Assets estáticos: HTML, JS, CSS, WebGL/Kaboom)
     └──────────────────────┘
                │
                ▼ (REST / JSON Payload)
     ┌──────────────────────┐
     │ Backend & Database   │ (API Serverless y Persistencia en DynamoDB)
     └──────────────────────┘

---

## 3. Pipeline de Integración y Despliegue Continuo (CI/CD)

El proyecto prescinde de subidas manuales por FTP o consola en favor de un flujo de trabajo GitOps totalmente automatizado:

1. **Fase de Disparador (Trigger):** Cada push atómico o merge en la rama de producción (`main`) actúa como un webhook que activa al orquestador de compilación de AWS Amplify.
2. **Fase de Aprovisionamiento y Build:** El runner instancia un entorno limpio y contenedorizado, extrayendo la instantánea exacta del commit.
3. **Mapeo de Artefactos:** La configuración de compilación aísla el espacio de trabajo del cliente, mapeando el directorio raíz de distribución a las instancias del servidor web estático.
4. **Invalidación y Propagación en Edge:** Una vez validados, los recursos se propagan de forma dinámica a través de los nodos de la Red de Entrega de Contenido (CDN) global, logrando consistencia global en menos de 120 segundos sin tiempo de inactividad.

---

## 4. Manifiesto de Compilación y Especificación de Configuración

El comportamiento del despliegue se rige explícitamente mediante el manifiesto declarativo `amplify.yml`, garantizando compilaciones deterministas entre iteraciones:

```yaml
version: 1
frontend:
  phases:
    build:
      commands: []
  artifacts:
    baseDirectory: frontend
    files:
      - '**/**'
      
    baseDirectory: frontend: Aísla el árbol de código fuente del cliente de los scripts del servidor backend, Dockerfiles y configuraciones locales.

    commands: []: Omite ciclos pesados de transpilación (bundles de Webpack/Vite) dado que los módulos ES nativos y las dependencias externas vía CDN (Kaboom.js) son consumibles directamente por los navegadores modernos en tiempo de ejecución.

## 5. Endpoint de Producción y Confiabilidad

    Dominio de Producción Asignado: https://main.d5hw5vsttp0x1.amplifyapp.com

    Seguridad de Transporte: Encriptación SSL/TLS de extremo a extremo aplicada de forma automática por AWS Certificate Manager (ACM).

    Tolerancia a Fallos: El almacenamiento en caché en Edge mitiga los picos de tráfico, asegurando que la ejecución del lado del cliente se mantenga fluida incluso en escenarios de alta concurrencia durante la evaluación.