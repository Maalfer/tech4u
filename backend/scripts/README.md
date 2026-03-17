# Tech4U Academy — Scripts de Base de Datos

## Estructura

```
scripts/
├── seed/               Seeds de contenido académico
│   ├── seed_users.py       Usuarios de demostración
│   ├── seed_linux.py       Labs Linux + Bash (Terminal Skills)
│   ├── seed_storage.py     Labs de almacenamiento
│   ├── seed_netlabs.py     Labs de redes (NetLab)
│   ├── seed_theory.py      Guías de teoría (Redes, Ciberseguridad, eJPTv2)
│   └── seed_questions.py   Preguntas, tests, Skill Labs, SQL datasets
│
├── maintenance/        Operaciones de mantenimiento manual
│   ├── reset_admin_pwd.py     Resetear contraseña admin
│   ├── reset_test_users.py    Resetear usuarios de prueba
│   ├── update_content.py      Actualizar contenido en BD
│   └── restore_theory.py      Restaurar guías de teoría
│
├── debug/              Solo para desarrollo y debugging
│   ├── inspect_db.py          Inspeccionar estado de BD
│   └── dump_exercises.py      Exportar ejercicios a JSON
│
└── run_seed.py         ← PUNTO DE ENTRADA PRINCIPAL
```

## Uso en Producción

### Primer despliegue (BD vacía)
```bash
cd backend
python scripts/run_seed.py
```

### Solo un grupo específico
```bash
python scripts/run_seed.py --only=theory
python scripts/run_seed.py --only=linux
python scripts/run_seed.py --only=questions
```

### Ver grupos disponibles
```bash
python scripts/run_seed.py --list
```

## Workflow de Despliegue

```
1. Restaurar backup:        psql tech4u < backup.sql
2. Migraciones Alembic:     alembic upgrade head
3. Seeds (si BD vacía):     python scripts/run_seed.py
4. Arrancar servidor:       uvicorn main:app --host 0.0.0.0 --port 8000
```

## ⚠️ Importante

- Los seeds **NUNCA** se ejecutan automáticamente al arrancar el servidor
- Todos incluyen protección anti-duplicados (idempotentes)
- Los scripts originales en `scripts/*.py` se conservan intactos
- Los subdirectorios son **wrappers** que llaman a los scripts originales
