export class User
{
    constructor(params)
    {
        this.id = params?.id || 0;
        this.name = params?.name || '';
        this.username = params?.username || '';
        this.first_name = params?.first_name || '';
        this.last_name = params?.last_name || '';
        this.email = params?.email || '';
        this.is_active = params?.is_active || '';
        this.is_staff = params?.is_staff || '';
        this.is_superuser = params?.is_superuser || false;
        this.date_joined = params?.date_joined || '';
        this.last_login = params?.last_login || '';
    }
}