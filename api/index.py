# Vercel Serverless Function para Macrobat AI
import sys
import os

# Añadir el directorio backend al path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(current_dir, '..', 'backend')
sys.path.insert(0, backend_path)

# Importar la aplicación FastAPI desde backend/main.py
try:
    from main import app
except ImportError:
    # Si falla, intentar importar desde backend.main
    import importlib.util
    spec = importlib.util.spec_from_file_location("main", os.path.join(backend_path, "main.py"))
    main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(main)
    app = main.app

# Handler para Vercel (necesario para funciones serverless)
from mangum import Mangum
handler = Mangum(app)
