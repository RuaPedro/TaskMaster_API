import { environment } from "../../environment.js";

export class StudyBlockService
{
    baseUrl = `${environment.apiUrl}/blocks`;

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

    async insert(blocks)
    {
         try
        {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(blocks)


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

    async update(block)
    {
        if (!block?.id) throw new Error('Block id is required for update');
        const url = `${this.baseUrl}/${block.id}`;

        try
        {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(block)
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
        if (!id) throw new Error('Block id is required for delete');
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
