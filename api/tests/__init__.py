"""
Expone todos los módulos de pruebas para que `python manage.py test tests` los descubra.
"""

from .user_test import *  # noqa: F401,F403
from .topic_test import *  # noqa: F401,F403
from .block_test import *  # noqa: F401,F403
from .task_test import *  # noqa: F401,F403
from .student_test import *  # noqa: F401,F403
from .progress_test import *  # noqa: F401,F403
