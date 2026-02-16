from uuid import uuid4

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class StudyTopicApiTests(APITestCase):
    def _results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def _topic_payload(self):
        suffix = uuid4().hex[:6]
        return {
            "name": f"Tema {suffix}",
            "description": "Descripción de prueba",
            "difficulty": "beginner",
            "is_active": True,
        }

    def test_create_topic(self):
        url = reverse("study-topics-list")
        payload = self._topic_payload()
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["name"], payload["name"])

    def test_list_topics(self):
        # Crear uno para listar
        created = self.client.post(reverse("study-topics-list"), self._topic_payload(), format="json").json()
        res = self.client.get(reverse("study-topics-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [t["name"] for t in self._results(res.json())]
        self.assertIn(created["name"], names)

    def test_retrieve_topic(self):
        created = self.client.post(reverse("study-topics-list"), self._topic_payload(), format="json").json()
        res = self.client.get(reverse("study-topics-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["id"], created["id"])

    def test_update_topic(self):
        created = self.client.post(reverse("study-topics-list"), self._topic_payload(), format="json").json()
        payload = {"description": "Texto actualizado"}
        res = self.client.patch(reverse("study-topics-detail", args=[created["id"]]), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["description"], payload["description"])

    def test_delete_topic(self):
        created = self.client.post(reverse("study-topics-list"), self._topic_payload(), format="json").json()
        res = self.client.delete(reverse("study-topics-detail", args=[created["id"]]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
