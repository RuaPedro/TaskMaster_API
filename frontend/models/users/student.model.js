import { User } from './user.model.js'

export class Student
{
    constructor(params)
    {
        this.id = params?.id ?? null;
        this.user = params?.user
            ? (typeof params.user === 'object' ? new User(params.user) : params.user)
            : null;
        this.fullname = params?.fullname || '';
        this.started_at = params?.started_at || '';
    }
}
