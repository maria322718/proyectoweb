# Paquete de auditoría del proyecto: clinic-reservations

## Resumen
- Archivos incluidos: **111**
- Tamaño total incluido: **246831 bytes**
- Directorios ignorados: `.cache, .git, .gradle, .idea, .mvn, .next, .nuxt, .pytest_cache, .scannerwork, .sonarqube, .venv, .vscode, __pycache__, bin, build, coverage, dist, node_modules, obj, out, target, venv`
- Límite de tamaño por bundle: **280000 caracteres**

## Árbol del proyecto (resumido)
```text
clinic-reservations
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── university
│   │   │           └── clinic
│   │   └── resources
│   │       └── application.yml
│   └── test
│       └── java
│           └── com
│               └── university
│                   └── clinic
├── 0
├── auditoria_endpoints.txt
├── auditoria_estructura_main.txt
├── auditoria_estructura_test.txt
├── auditoria_tests_lista.txt
├── MER.md
├── pom.xml
├── README.md
├── requests.http
└── test_output.log
```

## Bundles generados
- **00_root_and_docs**: 00_root_and_docs_part1.md
- **01_main_source**: 01_main_source_part1.md
- **02_test_source**: 02_test_source_part1.md
- **03_resources**: 03_resources_part1.md

## Cómo compartir con una IA
1. Empieza por `index.md` para dar contexto general.
2. Luego comparte el bundle del área que quieras auditar: `00_root_and_docs`, `01_main_source`, `02_test_source`, etc.
3. Si el contenido es muy grande, comparte `part1`, luego `part2`, etc.
4. Pide auditoría focalizada por capa: modelo, repository, service, controller, testing, documentación.

## Recomendación
No compartas `target/`, `.git/`, binarios ni archivos generados. Este script ya los omite para reducir ruido.