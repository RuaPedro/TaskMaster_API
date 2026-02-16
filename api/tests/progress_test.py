from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from tasks.models import BlockTask, StudyBlock, StudyTopic
from users.models import Student, StudentTaskProgress

User = get_user_model()


class StudentTaskProgressApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Estructura base: topic -> block -> tasks
        cls.topic = StudyTopic.objects.create(name="Tema Progreso", difficulty="beginner")
        cls.block = StudyBlock.objects.create(topic=cls.topic, number=1, title="Bloque Progreso")
        cls.task1 = BlockTask.objects.create(
            block=cls.block,
            title="Tarea Base",
            instructions="Resolver ejercicio",
            order=1,
            status="available",
        )
        cls.task2 = BlockTask.objects.create(
            block=cls.block,
            title="Tarea Nueva",
            instructions="Resolver ejercicio 2",
            order=2,
            status="available",
        )
        # Estudiante base
        cls.user = User.objects.create(username="progress_user", email="progress@example.com")
        cls.student = Student.objects.create(user=cls.user, full_name="Estudiante Progreso")

        cls.base_progress = StudentTaskProgress.objects.create(
            student=cls.student,
            task=cls.task1,
            status="pending",
        )

    def _results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def test_create_progress(self):
        payload = {"student": self.student.id, "task": self.task2.id, "status": "in_progress"}
        res = self.client.post(reverse("student-task-progress-list"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["status"], payload["status"])

    def test_list_progress(self):
        res = self.client.get(reverse("student-task-progress-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [p["id"] for p in self._results(res.json())]
        self.assertIn(self.base_progress.id, ids)

    def test_retrieve_progress(self):
        res = self.client.get(reverse("student-task-progress-detail", args=[self.base_progress.id]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["id"], self.base_progress.id)

    def test_update_progress(self):
        payload = {"status": "completed"}
        res = self.client.patch(
            reverse("student-task-progress-detail", args=[self.base_progress.id]),
            payload,
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["status"], payload["status"])

    def test_delete_progress(self):
        temp = StudentTaskProgress.objects.create(
            student=self.student, task=self.task2, status="pending"
        )
        res = self.client.delete(reverse("student-task-progress-detail", args=[temp.id]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
