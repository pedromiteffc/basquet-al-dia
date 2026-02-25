# 🏀 Básquet Al Día

Básquet Al Día es una plataforma web dinámica diseñada para el seguimiento  de las principales competencias de básquet en Argentina

## 🚀 Características Principales

* **Vistas Públicas Dinámicas:** Tablas de posiciones automatizadas y visualización de resultados por jornadas.
* **Cálculo Automático:** El sistema calcula automáticamente los partidos jugados, ganados, perdidos, puntos a favor/en contra y la diferencia de gol en base a los resultados cargados.
* **Página 404 Personalizada:** Redirección amigable para enlaces rotos.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla, ES6 Modules).
* **Backend / Base de Datos:** Firebase Firestore (NoSQL).
* **Autenticación:** Firebase Authentication.
* **Hosting:** GitHub Pages.
* **Iconos y Fuentes:** Remix Icon, Boxicons, Google Fonts (Quicksand, Mulish).

## 📁 Estructura del Proyecto

```text
basquet-al-dia/
├── admin/                  # Paneles de control protegidos
│   ├── adminnacional.html
│   ├── adminfederal.html
│   └── adminproximo.html
├── assets/
│   ├── css/                # Hojas de estilo
│   │   ├── styles.css
│   │   ├── federal.css
│   │   └── admin.css
│   ├── img/                # Imágenes estáticas y logos
│   └── js/                 # Lógica de la aplicación
│       ├── liganacional.js # Lógica vista pública
│       ├── adminnacional.js# Lógica administrador
│       └── principal.js    # Menús y UI general
├── index.html              # Página de inicio
├── liganacional.html       # Vistas públicas de cada liga
├── ligafederal.html
├── ligaproximo.html
└── 404.html                # Página de error personalizada
