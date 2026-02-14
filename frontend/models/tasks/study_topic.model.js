export class StudyTopic
{
    constructor(params)
    {
        this.id = params?.id || 0;
        this.name = params?.name || '';
        this.description = params?.description || '';
        this.difficulty = params?.difficulty || '';
        this.is_active = params?.is_active || false;
        this.created_at = params?.created_at || '';
        this.updated_at = params?.updated_at || '';
    }
}