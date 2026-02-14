import { environment } from "../../environment.js";

export class StudentTaskProgressService
{
    baseUrl = `${environment.apiUrl}/student-task-progress`

    async getAll()
    {
        try
        {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Response error: ${error}`);
            }

            return response.json();
        }
        catch (error)
        {
            throw new Error(`Internal error: ${error}`);
        }
    }

    async insert(progress)
    {
         try
        {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(progress)


            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Response error: ${error}`);
            }

            return response.json();
        }
        catch (error)
        {
            throw new Error(`Internal error: ${error}`);
        }
    }

    async update(progress)
    {
        if (!progress?.id) throw new Error('Progress id is required for update');
        const url = `${this.baseUrl}/${progress.id}`;

        try
        {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(progress)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Response error: ${error}`);
            }

            return response.json();
        }
        catch (error)
        {
            throw new Error(`Internal error: ${error}`);
        }
    }

    async delete(id)
    {
        if (!id) throw new Error('Progress id is required for delete');
        const url = `${this.baseUrl}/${id}`;

        try
        {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Response error: ${error}`);
            }

            return response.json();
        }
        catch (error)
        {
            throw new Error(`Internal error: ${error}`);
        }
    }
}
