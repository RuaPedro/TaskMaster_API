from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class BlockTaskApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Crear topic y block base
        topic_payload = {
            "name": "Tema Tareas",
            "description": "Tema base",
            "difficulty": "beginner",
            "is_active": True,
        }
        topic_res = cls.client_class().post(reverse("study-topics-list"), topic_payload, format="json")
        cls.topic_id = topic_res.json()["id"]

        block_payload = {
            "topic": cls.topic_id,
            "number": 1,
            "title": "Bloque Tareas",
            "description": "Bloque base",
            "estimated_minutes": 25,
            "is_published": True,
        }
        block_res = cls.client_class().post(reverse("study-blocks-list"), block_payload, format="json")
        cls.block_id = block_res.json()["id"]

    def _results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def _task_payload(self, order=1):
        return {
            "block": self.block_id,
            "title": f"Tarea {order}",
            "instructions": "Instrucciones breves",
            "resources": None,
            "estimated_minutes": 10,
            "order": order,
            "status": "available",
        }

    def test_create_task(self):
        res = self.client.post(reverse("block-tasks-list"), self._task_payload(order=1), format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["title"], "Tarea 1")

    def test_list_tasks(self):
        created = self.client.post(reverse("block-tasks-list"), self._task_payload(order=2), format="json").json()
        res = self.client.get(reverse("block-tasks-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [t["title"] for t in self._results(res.json())]
        self.assertIn(created["title"], titles)

    def test_retrieve_task(self):
        created = self.client.post(reverse("block-tasks-list"), self._task_payload(order=3), format="json").json()
        res = self.client.get(reverse("block-tasks-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["id"], created["id"])

    def test_update_task(self):
        created = self.client.post(reverse("block-tasks-list"), self._task_payload(order=4), format="json").json()
        payload = {"title": "Tarea actualizada"}
        res = self.client.patch(reverse("block-tasks-detail", args=[created["id"]]), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["title"], payload["title"])

    def test_delete_task(self):
        created = self.client.post(reverse("block-tasks-list"), self._task_payload(order=5), format="json").json()
        res = self.client.delete(reverse("block-tasks-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
