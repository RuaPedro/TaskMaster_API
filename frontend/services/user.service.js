import { environment } from "../environment.js";

export class UserService
{
    baseUrl = `${environment.apiUrl}/users`;

    async getAll()
    {
        try
        {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
                // body JSON.stringify({username: 'Pedro}) si es para post 
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Response error: ${error}`);
            }

            return response.json();
        }
        catch
        {
            throw new Error(`Internal error: ${error}`);
        }
    }
}