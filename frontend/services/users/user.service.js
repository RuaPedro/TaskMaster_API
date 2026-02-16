import { environment } from "../../environment.js";

export class UserService
{
    // Django REST Framework espera trailing slash con APPEND_SLASH activo
    baseUrl = `${environment.apiUrl}/users/`;

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
    
    async insert(user)
    {
         try
        {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)


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

    async update(user)
    {
        if (!user?.id) throw new Error('User id is required for update');
        const url = `${this.baseUrl}${user.id}/`;

        try
        {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
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
        if (!id) throw new Error('User id is required for delete');
        const url = `${this.baseUrl}${id}/`;

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
